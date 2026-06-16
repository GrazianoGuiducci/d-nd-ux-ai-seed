export const AGENT_CONTEXT_ASK_EVENT = 'agent:context:ask';
export const THIA_CONTEXT_ASK_EVENT = 'dnd:thia:ask';

export type AgentOrientation = {
  surface?: string;
  tab?: string;
  subtab?: string;
  focus?: string;
  item?: string;
  relation?: string;
  count?: string;
  mode?: string;
  boundary?: string;
  action?: string;
  active?: boolean | string;
};

export type AgentContextAskDetail = Partial<AgentOrientation> & {
  prompt?: string;
  source?: string;
  autoSend?: boolean;
};

const AGENT_ACTIVE_SELECTOR = '[data-agent-active="true"]';
const THIA_ACTIVE_SELECTOR = '[data-thia-active="true"]';

function clean(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

function readDatasetPair(el: HTMLElement, agentKey: string, thiaKey: string): string | undefined {
  const dataset = el.dataset as DOMStringMap & Record<string, string | undefined>;
  return clean(dataset[agentKey]) || clean(dataset[thiaKey]);
}

export function findActiveOrientationElement(root: ParentNode = document): HTMLElement | null {
  return (
    root.querySelector<HTMLElement>(AGENT_ACTIVE_SELECTOR) ||
    root.querySelector<HTMLElement>(THIA_ACTIVE_SELECTOR)
  );
}

export function readAgentOrientationFromElement(el: HTMLElement | null | undefined): AgentOrientation {
  if (!el) return {};
  return {
    surface: readDatasetPair(el, 'agentMarker', 'thiaMarker'),
    tab: readDatasetPair(el, 'agentTab', 'thiaTab'),
    subtab: readDatasetPair(el, 'agentSubtab', 'thiaSubtab'),
    focus: readDatasetPair(el, 'agentFocus', 'thiaFocus'),
    item: readDatasetPair(el, 'agentItem', 'thiaItem'),
    relation: readDatasetPair(el, 'agentRelation', 'thiaRelation'),
    count: readDatasetPair(el, 'agentCount', 'thiaCount'),
    mode: readDatasetPair(el, 'agentMode', 'thiaMode'),
    boundary: readDatasetPair(el, 'agentBoundary', 'thiaBoundary'),
    action: readDatasetPair(el, 'agentAction', 'thiaAction'),
    active: readDatasetPair(el, 'agentActive', 'thiaActive'),
  };
}

export function readActiveAgentOrientation(root: ParentNode = document): AgentOrientation {
  if (typeof document === 'undefined') return {};
  return readAgentOrientationFromElement(findActiveOrientationElement(root));
}

function boolString(value: boolean | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return value;
}

export function agentOrientationAttributes(
  orientation: AgentOrientation,
  options: { includeCompatibility?: boolean } = {},
): Record<string, string | undefined> {
  const includeCompatibility = options.includeCompatibility ?? true;
  const active = boolString(orientation.active);
  const attrs: Record<string, string | undefined> = {
    'data-agent-marker': orientation.surface,
    'data-agent-active': active,
    'data-agent-tab': orientation.tab,
    'data-agent-subtab': orientation.subtab,
    'data-agent-focus': orientation.focus,
    'data-agent-item': orientation.item,
    'data-agent-relation': orientation.relation,
    'data-agent-count': orientation.count,
    'data-agent-mode': orientation.mode,
    'data-agent-boundary': orientation.boundary,
    'data-agent-action': orientation.action,
  };

  if (!includeCompatibility) return attrs;

  return {
    ...attrs,
    'data-thia-marker': orientation.surface,
    'data-thia-active': active,
    'data-thia-tab': orientation.tab,
    'data-thia-subtab': orientation.subtab,
    'data-thia-focus': orientation.focus,
    'data-thia-item': orientation.item,
    'data-thia-relation': orientation.relation,
    'data-thia-count': orientation.count,
    'data-thia-mode': orientation.mode,
    'data-thia-boundary': orientation.boundary,
    'data-thia-action': orientation.action,
  };
}

export function dispatchAgentContextAsk(
  detail: AgentContextAskDetail,
  options: { includeCompatibilityEvent?: boolean } = {},
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AGENT_CONTEXT_ASK_EVENT, { detail }));
  if (options.includeCompatibilityEvent ?? true) {
    window.dispatchEvent(new CustomEvent(THIA_CONTEXT_ASK_EVENT, { detail }));
  }
}
