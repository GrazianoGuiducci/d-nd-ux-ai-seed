import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileSituatedChatCompetenceContext,
  routeSituatedChatCompetences,
  runAgenticChatTurn,
} from '../dist/d-nd-ux-ai-seed.js';

const localized = (it, en) => ({ it, en });

const situatedDialogue = {
  id: 'situated-dialogue',
  version: '1.0.0',
  lifecycle: 'stable',
  name: localized('Dialogo situato', 'Situated dialogue'),
  purpose: localized('Mantiene domanda, contesto e ignoto insieme.', 'Keeps question, context and unknowns together.'),
  activation: { always: true },
  responseOperations: [localized('Rispondi nel contesto osservato.', 'Answer within the observed context.')],
  effectClass: 'cognitive',
};

const researchRelation = {
  id: 'research-relation',
  version: '1.0.0',
  lifecycle: 'evolving',
  name: localized('Relazione di ricerca', 'Research relation'),
  purpose: localized('Distingue sorgente, condizione e inferenza.', 'Separates source, condition and inference.'),
  activation: { topics: ['physics'] },
  effectAvailableIn: ['operator'],
  evidenceSections: ['paper-a'],
  responseOperations: [localized('Mostra cosa falsificherebbe la relazione.', 'Show what would falsify the relation.')],
  effectClass: 'research-and-proposal',
};

const baseSituation = {
  schema: 'dnd.agentic_chat.situation.v0.2',
  host: { id: 'test-host', adapterVersion: '1.0.0' },
  surface: { slug: 'home', path: '/', scenario: 'public-page', focus: 'overview' },
  dialogue: {
    question: 'What follows from the source?',
    language: 'en',
    answerMode: 'direct',
    visitorLens: 'researcher',
    understandingMode: 'contextual',
    depth: 'research',
    stage: 'active-turn',
  },
  intent: { signal: 'understand', source: 'observed_question', status: 'observed' },
  access: { mode: 'public', effectRequested: false },
  topics: ['physics'],
  evidence: { sectionIds: ['paper-a', 'paper-b'], contextPacketTypes: ['paper'] },
  attention: { explicitExclusions: [], reentryTriggers: ['new-source'] },
  possibilities: {
    retainedRelations: ['alternate-mechanism'],
    unknowns: ['measurement-domain'],
    capabilityGaps: [],
  },
};

test('routing composes competences without treating surface or effect gate as a cognitive boundary', () => {
  const receipt = routeSituatedChatCompetences(baseSituation, [situatedDialogue, researchRelation]);

  assert.equal(receipt.movement.kind, 'compose');
  assert.deepEqual(receipt.movement.selectedCompetenceIds, ['situated-dialogue', 'research-relation']);
  assert.deepEqual(receipt.movement.unknowns, ['measurement-domain']);
  assert.deepEqual(receipt.attention.notSelectedByKernel, ['paper-b']);
  assert.equal(receipt.activations[1].effectAvailability, 'HOST_GATED');
  assert.equal(receipt.effectAuthority, 'UNCHANGED');
  assert.equal(receipt.benefit.status, 'UNOBSERVED');
});

test('no applicable faculty remains an explicit non-application', () => {
  const receipt = routeSituatedChatCompetences(baseSituation, []);

  assert.equal(receipt.movement.kind, 'truthful_non_application');
  assert.deepEqual(receipt.movement.selectedCompetenceIds, []);
  assert.deepEqual(receipt.attention.availableEvidence, ['paper-a', 'paper-b']);
  assert.deepEqual(receipt.attention.notSelectedByKernel, ['paper-a', 'paper-b']);
});

test('compiled context preserves unknowns and does not claim benefit', () => {
  const receipt = routeSituatedChatCompetences(baseSituation, [situatedDialogue, researchRelation]);
  const context = compileSituatedChatCompetenceContext(baseSituation, receipt, {
    hostName: 'Test host',
    heading: localized('Contesto test.', 'Test context.'),
    levelInstructions: {
      plain: localized('Diretto.', 'Direct.'),
      research: localized('Ricerca.', 'Research.'),
    },
  });

  assert.match(context, /measurement-domain/);
  assert.match(context, /other available evidence remains reachable/);
  assert.match(context, /Benefit status=UNOBSERVED/);
});

test('complete turn composes host context, knowledge and transport without invoking effects', async () => {
  let effectCalls = 0;
  let receivedRequest;
  const host = {
    id: 'portable-test',
    name: 'Portable Test Assistant',
    adapterVersion: '1.0.0',
    competences: [situatedDialogue, researchRelation],
    context: {
      observe: () => ({
        surface: { slug: 'other-surface', path: '/other', scenario: 'cross-surface' },
        dialogue: { depth: 'research', visitorLens: 'researcher' },
        access: { mode: 'public' },
        topics: ['physics'],
        possibilities: { unknowns: ['unresolved-scale'] },
      }),
    },
    knowledge: {
      read: () => ({
        sections: [
          { id: 'paper-a', type: 'paper', content: 'Observed relation.', provenance: 'source:a' },
          { id: 'paper-b', type: 'paper', content: 'Alternative relation.', provenance: 'source:b' },
        ],
      }),
    },
    transport: {
      complete: request => {
        receivedRequest = request;
        return { text: 'Situated answer.', provider: 'test', model: 'deterministic' };
      },
    },
    effects: {
      invoke: () => {
        effectCalls += 1;
        return { id: 'write', status: 'completed' };
      },
    },
  };

  const result = await runAgenticChatTurn(host, {
    question: 'Follow the topic across this surface.',
    language: 'en',
    focus: { surface: 'other-surface', focus: 'selected relation' },
    messages: [{ role: 'user', text: 'Follow the topic across this surface.' }],
  });

  assert.equal(result.text, 'Situated answer.');
  assert.equal(result.transport.model, 'deterministic');
  assert.equal(result.receipt.movement.kind, 'compose');
  assert.deepEqual(result.receipt.movement.unknowns, ['unresolved-scale']);
  assert.deepEqual(result.receipt.attention.notSelectedByKernel, ['paper-b']);
  assert.equal(receivedRequest.knowledge.sections.length, 2);
  assert.match(receivedRequest.competenceContext, /HOST_GATED/);
  assert.equal(effectCalls, 0);
});
