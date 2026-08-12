import React, { useCallback } from 'react';
import ThiaChatSeed, {
  type ThiaChatFocus,
  type ThiaChatLanguage,
  type ThiaChatMessage,
  type ThiaChatSeedProps,
  type ThiaChatTurnContext,
} from './ThiaChatSeed';
import {
  compileSituatedChatCompetenceContext,
  routeSituatedChatCompetences,
  type SituatedChatCompileOptions,
  type SituatedChatCompetenceManifest,
  type SituatedChatCompetenceReceipt,
  type SituatedChatSituationEnvelope,
  type SituatedLanguage,
  type SituatedLocalizedText,
} from './chat-kernel/situatedChatKernel';

type MaybePromise<T> = T | Promise<T>;

export interface AgenticChatTurnInput {
  question: string;
  language: SituatedLanguage;
  focus: ThiaChatFocus;
  messages: ThiaChatMessage[];
}

export interface AgenticChatContextObservation {
  surface?: Partial<SituatedChatSituationEnvelope['surface']>;
  dialogue?: Partial<Omit<SituatedChatSituationEnvelope['dialogue'], 'question' | 'language'>>;
  intent?: Partial<SituatedChatSituationEnvelope['intent']>;
  access?: Partial<SituatedChatSituationEnvelope['access']>;
  topics?: string[];
  attention?: Partial<SituatedChatSituationEnvelope['attention']>;
  possibilities?: Partial<SituatedChatSituationEnvelope['possibilities']>;
}

export interface AgenticChatContextAdapter {
  observe(input: AgenticChatTurnInput): MaybePromise<AgenticChatContextObservation>;
}

export interface AgenticChatKnowledgeSection {
  id: string;
  type: string;
  content: string;
  provenance?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface AgenticChatKnowledgeSnapshot {
  sections: AgenticChatKnowledgeSection[];
  packetTypes?: string[];
}

export interface AgenticChatKnowledgeAdapter {
  read(
    input: AgenticChatTurnInput,
    observation: AgenticChatContextObservation,
  ): MaybePromise<AgenticChatKnowledgeSnapshot>;
}

export interface AgenticChatTransportRequest {
  question: string;
  language: SituatedLanguage;
  conversation: ThiaChatMessage[];
  focus: ThiaChatFocus;
  situation: SituatedChatSituationEnvelope;
  receipt: SituatedChatCompetenceReceipt;
  competenceContext: string;
  knowledge: AgenticChatKnowledgeSnapshot;
}

export interface AgenticChatTransportResponse {
  text: string;
  provider?: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

export interface AgenticChatTransportAdapter {
  complete(
    request: AgenticChatTransportRequest,
  ): MaybePromise<string | AgenticChatTransportResponse>;
}

export interface AgenticChatEffectRequest {
  id: string;
  input?: Record<string, unknown>;
  situationFingerprint: string;
}

export interface AgenticChatEffectReceipt {
  id: string;
  status: 'completed' | 'failed' | 'declined' | 'unavailable';
  detail?: string;
  metadata?: Record<string, unknown>;
}

export interface AgenticChatEffectAdapter {
  describe?(): MaybePromise<Array<{ id: string; description: string }>>;
  invoke(request: AgenticChatEffectRequest): MaybePromise<AgenticChatEffectReceipt>;
}

export interface AgenticChatHostAdapter {
  id: string;
  name: string;
  adapterVersion: string;
  competences: SituatedChatCompetenceManifest[];
  context: AgenticChatContextAdapter;
  knowledge: AgenticChatKnowledgeAdapter;
  transport: AgenticChatTransportAdapter;
  effects?: AgenticChatEffectAdapter;
  compile?: {
    heading?: SituatedLocalizedText;
    levelInstructions?: Record<string, SituatedLocalizedText>;
  };
}

export interface AgenticChatTurnResult {
  text: string;
  situation: SituatedChatSituationEnvelope;
  receipt: SituatedChatCompetenceReceipt;
  knowledge: AgenticChatKnowledgeSnapshot;
  transport: Omit<AgenticChatTransportResponse, 'text'>;
}

export type AgenticChatReceiptListener = (
  receipt: SituatedChatCompetenceReceipt,
  result: AgenticChatTurnResult,
) => void;

const DEFAULT_HEADING: SituatedLocalizedText = {
  it: 'Contesto cognitivo situato del turno.',
  en: 'Situated cognitive context for this turn.',
};

const DEFAULT_LEVEL_INSTRUCTIONS: Record<string, SituatedLocalizedText> = {
  plain: {
    it: 'Spiega con parole dirette, mantenendo condizioni, sorgenti e ignoti visibili.',
    en: 'Explain directly while keeping conditions, sources and unknowns visible.',
  },
  technical: {
    it: 'Usa precisione tecnica e conserva provenienza, condizioni e invalidatori.',
    en: 'Use technical precision and preserve provenance, conditions and invalidators.',
  },
  research: {
    it: 'Ragiona come assistente di ricerca: separa osservazione, inferenza, fonte e falsificatore.',
    en: 'Reason as a research assistant: separate observation, inference, source and falsifier.',
  },
};

const compact = (values: Array<string | undefined>): string[] => values.filter((value): value is string => Boolean(value));
const unique = (values: string[]): string[] => [...new Set(values)];

function focusPath(focus: ThiaChatFocus): string {
  return compact([focus.surface, focus.tab, focus.item]).join('/') || 'unresolved';
}

export function createAgenticChatSituation(
  host: AgenticChatHostAdapter,
  input: AgenticChatTurnInput,
  observation: AgenticChatContextObservation,
  knowledge: AgenticChatKnowledgeSnapshot,
): SituatedChatSituationEnvelope {
  const surface = observation.surface || {};
  const dialogue = observation.dialogue || {};
  const intent = observation.intent || {};
  const access = observation.access || {};
  const attention = observation.attention || {};
  const possibilities = observation.possibilities || {};
  const knowledgeSectionIds = knowledge.sections.map(section => section.id);
  const packetTypes = knowledge.packetTypes || knowledge.sections.map(section => section.type);

  return {
    schema: 'dnd.agentic_chat.situation.v0.2',
    host: {
      id: host.id,
      adapterVersion: host.adapterVersion,
    },
    surface: {
      slug: surface.slug || input.focus.surface || 'unresolved',
      path: surface.path || focusPath(input.focus),
      scenario: surface.scenario || input.focus.relation || input.focus.tab || 'situated-dialogue',
      focus: surface.focus || input.focus.focus || input.focus.item || 'open-surface',
    },
    dialogue: {
      question: input.question,
      language: input.language,
      answerMode: dialogue.answerMode || 'direct',
      visitorLens: dialogue.visitorLens || 'situated-user',
      understandingMode: dialogue.understandingMode || 'contextual',
      depth: dialogue.depth || 'plain',
      stage: dialogue.stage || 'active-turn',
    },
    intent: {
      signal: intent.signal || input.question,
      source: intent.source || 'observed_question',
      status: intent.status || 'observed',
    },
    access: {
      mode: access.mode || 'public',
      effectRequested: access.effectRequested || false,
    },
    topics: unique(observation.topics || []),
    evidence: {
      sectionIds: unique(knowledgeSectionIds),
      contextPacketTypes: unique(packetTypes),
    },
    attention: {
      explicitExclusions: unique(attention.explicitExclusions || []),
      reentryTriggers: unique(attention.reentryTriggers || []),
    },
    possibilities: {
      retainedRelations: unique(possibilities.retainedRelations || []),
      unknowns: unique(possibilities.unknowns || []),
      capabilityGaps: unique(possibilities.capabilityGaps || []),
    },
  };
}

function compileOptions(host: AgenticChatHostAdapter): SituatedChatCompileOptions {
  return {
    hostName: host.name,
    heading: host.compile?.heading || DEFAULT_HEADING,
    levelInstructions: {
      ...DEFAULT_LEVEL_INSTRUCTIONS,
      ...(host.compile?.levelInstructions || {}),
    },
  };
}

export async function runAgenticChatTurn(
  host: AgenticChatHostAdapter,
  input: AgenticChatTurnInput,
): Promise<AgenticChatTurnResult> {
  const observation = await host.context.observe(input);
  const knowledge = await host.knowledge.read(input, observation);
  const situation = createAgenticChatSituation(host, input, observation, knowledge);
  const receipt = routeSituatedChatCompetences(situation, host.competences);
  const competenceContext = compileSituatedChatCompetenceContext(
    situation,
    receipt,
    compileOptions(host),
  );
  const transportResponse = await host.transport.complete({
    question: input.question,
    language: input.language,
    conversation: input.messages,
    focus: input.focus,
    situation,
    receipt,
    competenceContext,
    knowledge,
  });
  const normalized = typeof transportResponse === 'string'
    ? { text: transportResponse }
    : transportResponse;

  return {
    text: normalized.text,
    situation,
    receipt,
    knowledge,
    transport: {
      provider: normalized.provider,
      model: normalized.model,
      metadata: normalized.metadata,
    },
  };
}

export interface AgenticChatSystemProps extends Omit<ThiaChatSeedProps, 'language' | 'onSend'> {
  host: AgenticChatHostAdapter;
  language?: ThiaChatLanguage;
  onReceipt?: AgenticChatReceiptListener;
  onTurnComplete?: (result: AgenticChatTurnResult) => void;
}

export const AgenticChatSystem: React.FC<AgenticChatSystemProps> = ({
  host,
  language = 'en',
  onReceipt,
  onTurnComplete,
  ...chatProps
}) => {
  const handleSend = useCallback(async (
    question: string,
    focus: ThiaChatFocus,
    turn: ThiaChatTurnContext,
  ) => {
    const result = await runAgenticChatTurn(host, {
      question,
      language,
      focus,
      messages: turn.messages,
    });
    onReceipt?.(result.receipt, result);
    onTurnComplete?.(result);
    return result.text;
  }, [host, language, onReceipt, onTurnComplete]);

  return (
    <ThiaChatSeed
      {...chatProps}
      language={language}
      onSend={handleSend}
    />
  );
};

export default AgenticChatSystem;
