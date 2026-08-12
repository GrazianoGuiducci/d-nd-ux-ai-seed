export const SITUATED_CHAT_KERNEL_VERSION = '0.2.0';

export type SituatedLanguage = 'it' | 'en';
export type SituatedEffectAuthority = 'UNCHANGED';
export type SituatedBenefitStatus = 'UNOBSERVED';

export type SituatedLocalizedText = Record<SituatedLanguage, string>;

export interface SituatedChatSituationEnvelope {
  schema: string;
  host: {
    id: string;
    adapterVersion: string;
  };
  surface: {
    slug: string;
    path: string;
    scenario: string;
    focus: string;
  };
  dialogue: {
    question: string;
    language: SituatedLanguage;
    answerMode: string;
    visitorLens: string;
    understandingMode: string;
    depth: string;
    stage: string;
  };
  intent: {
    signal: string;
    source: 'observed_question' | 'host_context' | 'explicit_operator';
    status: 'observed' | 'accepted';
  };
  access: {
    mode: string;
    effectRequested: boolean;
  };
  topics: string[];
  evidence: {
    sectionIds: string[];
    contextPacketTypes: string[];
  };
  attention: {
    explicitExclusions: string[];
    reentryTriggers: string[];
  };
  possibilities: {
    retainedRelations: string[];
    unknowns: string[];
    capabilityGaps: string[];
  };
}

export interface SituatedChatCompetenceManifest {
  id: string;
  version: string;
  lifecycle: string;
  name: SituatedLocalizedText;
  purpose: SituatedLocalizedText;
  activation: {
    always?: boolean;
    topics?: string[];
    scenarios?: string[];
    answerModes?: string[];
    visitorLenses?: string[];
    understandingModes?: string[];
  };
  effectAvailableIn?: string[];
  evidenceSections?: string[];
  responseOperations: SituatedLocalizedText[];
  effectClass: string;
}

export interface SituatedChatCompetenceActivation {
  competenceId: string;
  name: string;
  purpose: string;
  lifecycle: string;
  effectClass: string;
  effectAvailability: 'AVAILABLE' | 'HOST_GATED';
  resonance: number;
  reasons: string[];
  evidencePresent: string[];
  evidenceMissing: string[];
  responseOperations: string[];
}

export interface SituatedChatCompetenceReceipt {
  schema: string;
  kernelVersion: string;
  hostId: string;
  situationFingerprint: string;
  topics: string[];
  discussionLevel: string;
  accessMode: string;
  intent: {
    source: SituatedChatSituationEnvelope['intent']['source'];
    status: SituatedChatSituationEnvelope['intent']['status'];
  };
  movement: {
    kind: 'reuse' | 'compose' | 'truthful_non_application';
    selectedCompetenceIds: string[];
    retainedRelations: string[];
    unknowns: string[];
    missingCapabilityCandidates: string[];
  };
  attention: {
    selectedEvidence: string[];
    availableEvidence: string[];
    notSelectedByKernel: string[];
    explicitExclusions: string[];
    reentryTriggers: string[];
  };
  benefit: {
    status: SituatedBenefitStatus;
    comparisonKey: string;
  };
  effectAuthority: SituatedEffectAuthority;
  activations: SituatedChatCompetenceActivation[];
}

export interface SituatedChatCompileOptions {
  hostName: string;
  heading: SituatedLocalizedText;
  levelInstructions: Record<string, SituatedLocalizedText>;
}

const unique = <T,>(values: T[]): T[] => [...new Set(values)];

const localize = (value: SituatedLocalizedText, language: SituatedLanguage): string => value[language];

export function fingerprintSituatedChatSituation(situation: SituatedChatSituationEnvelope): string {
  const value = JSON.stringify({
    host: situation.host,
    surface: situation.surface,
    dialogue: situation.dialogue,
    intent: situation.intent,
    access: situation.access,
    topics: situation.topics,
    evidence: situation.evidence,
    attention: situation.attention,
    possibilities: situation.possibilities,
  });
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function routeSituatedChatCompetences(
  situation: SituatedChatSituationEnvelope,
  manifests: SituatedChatCompetenceManifest[],
  options: { kernelVersion?: string; receiptSchema?: string } = {},
): SituatedChatCompetenceReceipt {
  const language = situation.dialogue.language;
  const activations = manifests.flatMap(manifest => {
    const reasons: string[] = [];
    if (manifest.activation.always) reasons.push('always-present competence');
    const topics = manifest.activation.topics?.filter(topic => situation.topics.includes(topic)) || [];
    if (topics.length) reasons.push(`topic:${topics.join(',')}`);
    if (manifest.activation.scenarios?.includes(situation.surface.scenario)) {
      reasons.push(`scenario:${situation.surface.scenario}`);
    }
    if (manifest.activation.answerModes?.includes(situation.dialogue.answerMode)) {
      reasons.push(`answer_mode:${situation.dialogue.answerMode}`);
    }
    if (manifest.activation.visitorLenses?.includes(situation.dialogue.visitorLens)) {
      reasons.push(`visitor_lens:${situation.dialogue.visitorLens}`);
    }
    if (manifest.activation.understandingModes?.includes(situation.dialogue.understandingMode)) {
      reasons.push(`understanding:${situation.dialogue.understandingMode}`);
    }
    if (!reasons.length) return [];

    const requestedEvidence = manifest.evidenceSections || [];
    const evidencePresent = requestedEvidence.filter(section => situation.evidence.sectionIds.includes(section));
    const evidenceMissing = requestedEvidence.filter(section => !situation.evidence.sectionIds.includes(section));
    return [{
      competenceId: manifest.id,
      name: localize(manifest.name, language),
      purpose: localize(manifest.purpose, language),
      lifecycle: manifest.lifecycle,
      effectClass: manifest.effectClass,
      effectAvailability: !manifest.effectAvailableIn
        || manifest.effectAvailableIn.includes(situation.access.mode)
        ? 'AVAILABLE'
        : 'HOST_GATED',
      resonance: reasons.length,
      reasons,
      evidencePresent,
      evidenceMissing,
      responseOperations: manifest.responseOperations.map(operation => localize(operation, language)),
    } satisfies SituatedChatCompetenceActivation];
  });

  activations.sort((left, right) => {
    if (left.competenceId === 'situated-dialogue') return -1;
    if (right.competenceId === 'situated-dialogue') return 1;
    return right.resonance - left.resonance || left.competenceId.localeCompare(right.competenceId);
  });

  const selectedEvidence = unique(activations.flatMap(activation => activation.evidencePresent));
  const availableEvidence = unique(situation.evidence.sectionIds);
  const situationFingerprint = fingerprintSituatedChatSituation(situation);
  const selectedCompetenceIds = activations.map(activation => activation.competenceId);

  return {
    schema: options.receiptSchema || 'dnd.agentic_chat.competence_activation.v0.2',
    kernelVersion: options.kernelVersion || SITUATED_CHAT_KERNEL_VERSION,
    hostId: situation.host.id,
    situationFingerprint,
    topics: [...situation.topics],
    discussionLevel: situation.dialogue.depth,
    accessMode: situation.access.mode,
    intent: {
      source: situation.intent.source,
      status: situation.intent.status,
    },
    movement: {
      kind: activations.length === 0
        ? 'truthful_non_application'
        : (activations.length > 1 ? 'compose' : 'reuse'),
      selectedCompetenceIds,
      retainedRelations: [...situation.possibilities.retainedRelations],
      unknowns: [...situation.possibilities.unknowns],
      missingCapabilityCandidates: [...situation.possibilities.capabilityGaps],
    },
    attention: {
      selectedEvidence,
      availableEvidence,
      notSelectedByKernel: availableEvidence.filter(section => !selectedEvidence.includes(section)),
      explicitExclusions: [...situation.attention.explicitExclusions],
      reentryTriggers: [...situation.attention.reentryTriggers],
    },
    benefit: {
      status: 'UNOBSERVED',
      comparisonKey: `${situation.host.id}:${situationFingerprint}`,
    },
    effectAuthority: 'UNCHANGED',
    activations,
  };
}

export function compileSituatedChatCompetenceContext(
  situation: SituatedChatSituationEnvelope,
  receipt: SituatedChatCompetenceReceipt,
  options: SituatedChatCompileOptions,
): string {
  const language = situation.dialogue.language;
  const en = language === 'en';
  const levelInstruction = options.levelInstructions[receipt.discussionLevel]
    || options.levelInstructions.plain;
  const activeLines = receipt.activations.map(activation => [
    `- ${activation.competenceId} [${activation.effectClass}] :: ${activation.purpose}`,
    `  ${en ? 'activation' : 'attivazione'}: ${activation.reasons.join('; ')}`,
    `  ${en ? 'effect availability' : 'disponibilita effetto'}: ${activation.effectAvailability}`,
    activation.evidencePresent.length
      ? `  ${en ? 'available evidence' : 'evidenza disponibile'}: ${activation.evidencePresent.join(', ')}`
      : '',
    activation.evidenceMissing.length
      ? `  ${en ? 'missing from this situation' : 'assente in questa situazione'}: ${activation.evidenceMissing.join(', ')}`
      : '',
    ...activation.responseOperations.map(operation => `  - ${operation}`),
  ].filter(Boolean).join('\n'));
  const unknownLine = receipt.movement.unknowns.length
    ? `${en ? 'Unknowns kept open' : 'Ignoto mantenuto aperto'}: ${receipt.movement.unknowns.join('; ')}.`
    : (en ? 'No explicit unknown was supplied by the host.' : 'L host non ha fornito un ignoto esplicito.');
  const retainedLine = receipt.movement.retainedRelations.length
    ? `${en ? 'Relations retained without forced selection' : 'Relazioni mantenute senza selezione forzata'}: ${receipt.movement.retainedRelations.join('; ')}.`
    : '';

  return [
    localize(options.heading, language),
    `host=${receipt.hostId}; kernel=${receipt.kernelVersion}; fingerprint=${receipt.situationFingerprint}; ${en ? 'access' : 'accesso'}=${receipt.accessMode}; ${en ? 'level' : 'livello'}=${receipt.discussionLevel}.`,
    `${en ? 'Observed topics' : 'Argomenti osservati'}: ${receipt.topics.join(', ')}.`,
    `${en ? 'Situated intent' : 'Intento situato'}: ${receipt.intent.status} (${receipt.intent.source}).`,
    `${en ? 'Discussion level' : 'Forma del livello'}: ${localize(levelInstruction, language)}.`,
    en
      ? 'Activation is additive: the surface is a signal, not a boundary. Missing evidence stays visible and does not become a conclusion.'
      : 'L attivazione e additiva: la superficie e un segnale, non un confine. L evidenza mancante resta visibile e non diventa una conclusione.',
    `${en ? 'Movement' : 'Movimento'}: ${receipt.movement.kind}; ${en ? 'selected competences' : 'competenze presenti'}=${receipt.movement.selectedCompetenceIds.join(', ')}.`,
    unknownLine,
    retainedLine,
    en
      ? `Attention receipt: selected evidence=${receipt.attention.selectedEvidence.join(', ') || 'none'}; other available evidence remains reachable and is not rejected.`
      : `Ricevuta di attenzione: evidenza selezionata=${receipt.attention.selectedEvidence.join(', ') || 'nessuna'}; l altra evidenza disponibile resta raggiungibile e non e rifiutata.`,
    en ? 'ACTIVE COMPETENCES:' : 'COMPETENZE ATTIVE:',
    ...activeLines,
    en
      ? `Benefit status=${receipt.benefit.status}. This receipt makes later comparison possible; it is not a self-evaluation or proof of improvement.`
      : `Stato del beneficio=${receipt.benefit.status}. La ricevuta rende possibile un confronto successivo; non e un autogiudizio ne una prova di miglioramento.`,
    en
      ? `Effect relation: ${options.hostName} selects reasoning competences only. It grants no command, publication, runtime, measurement or promotion authority.`
      : `Relazione con gli effetti: ${options.hostName} seleziona soltanto competenze di ragionamento. Non conferisce autorita su comandi, pubblicazione, runtime, misura o promozione.`,
    en
      ? `Use the competences without naming the kernel unless the person asks how ${options.hostName} is reasoning.`
      : `Usare le competenze senza nominare il kernel, salvo una domanda esplicita su come ${options.hostName} sta ragionando.`,
  ].filter(Boolean).join('\n');
}
