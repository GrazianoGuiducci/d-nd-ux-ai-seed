import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AGENT_CONTEXT_ASK_EVENT,
  THIA_CONTEXT_ASK_EVENT,
  readActiveAgentOrientation,
  type AgentContextAskDetail,
} from './agentOrientation';

export type ThiaChatRole = 'assistant' | 'user' | 'operator';
export type ThiaChatBrand = 'agent' | 'thia';

export type ThiaChatMessage = {
  role: ThiaChatRole;
  text: string;
  transientFocus?: boolean;
  quickPrompts?: string[];
};

export type ThiaChatFocus = {
  surface?: string;
  tab?: string;
  focus?: string;
  item?: string;
  relation?: string;
  count?: string;
  boundary?: string;
};

export type ThiaChatAskDetail = AgentContextAskDetail;

export type ThiaChatFeedbackPayload = {
  category: string;
  message: string;
  contact?: string;
  focus: ThiaChatFocus;
  surfaceId?: string;
};

export type ThiaChatFeedbackConfig = {
  enabled?: boolean;
  label?: string;
  tabLabel?: string;
  tabPosition?: 'left' | 'right';
  title?: string;
  description?: string;
  categories?: string[];
  messagePlaceholder?: string;
  contactPlaceholder?: string;
  submitLabel?: string;
};

export interface ThiaChatSeedProps {
  title?: string;
  subtitle?: string;
  surfaceTitle?: string;
  surfaceId?: string;
  focus?: ThiaChatFocus;
  starterPrompts?: string[];
  initialMessages?: ThiaChatMessage[];
  storageKey?: string;
  openByDefault?: boolean;
  className?: string;
  brand?: ThiaChatBrand;
  feedback?: boolean | ThiaChatFeedbackConfig;
  onSend?: (prompt: string, focus: ThiaChatFocus) => Promise<string> | string;
  onFeedbackSubmit?: (payload: ThiaChatFeedbackPayload) => Promise<string | void> | string | void;
}

type Frame = {
  size: { width: number; height: number };
  position: { x: number; y: number };
};

type DragState = {
  kind: 'move' | 'resize';
  offsetX: number;
  offsetY: number;
};

const CHAT_READABLE_WIDTH = 720;
const CHAT_GEOMETRY_TRANSITION = 'opacity 410ms ease, transform 1210ms cubic-bezier(.2,.78,.18,1), left 1210ms cubic-bezier(.2,.78,.18,1), top 1210ms cubic-bezier(.2,.78,.18,1), width 1210ms cubic-bezier(.2,.78,.18,1), height 1210ms cubic-bezier(.2,.78,.18,1)';
const DEFAULT_FEEDBACK_CATEGORIES = ['Design issue', 'Missing context', 'Broken behavior', 'Contribution'];

let chatCssInjected = false;
const CHAT_CSS = `
.dnd-thia {
  --agent-chat-accent: rgb(34 211 238);
  --agent-chat-accent-soft: rgb(34 211 238 / 0.16);
  --agent-chat-accent-border: rgb(34 211 238 / 0.48);
  --agent-chat-accent-glow: rgb(34 211 238 / 0.22);
  --agent-chat-radius-card: var(--dnd-radius-card, 8px);
  --agent-chat-radius-control: var(--dnd-radius-control, 4px);
  position: fixed;
  z-index: 10020;
  color: rgb(var(--text-01, 244 247 251));
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.dnd-thia[data-brand="thia"] {
  --agent-chat-accent: rgb(57 255 20);
  --agent-chat-accent-soft: rgb(57 255 20 / 0.13);
  --agent-chat-accent-border: rgb(57 255 20 / 0.62);
  --agent-chat-accent-glow: rgb(57 255 20 / 0.22);
}
.dnd-thia-feedback-tab {
  position: fixed;
  top: 42%;
  z-index: 10012;
  display: inline-grid;
  place-items: center;
  min-height: 8.75rem;
  border: 1px solid var(--agent-chat-accent-border);
  border-left: 0;
  border-radius: 0 var(--agent-chat-radius-card) var(--agent-chat-radius-card) 0;
  background: rgb(var(--elev-01, 15 18 25) / 0.96);
  color: var(--agent-chat-accent);
  box-shadow: 0 0 22px var(--agent-chat-accent-glow);
  cursor: pointer;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1;
  padding: 0.62rem 0.46rem;
  text-transform: uppercase;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.dnd-thia-feedback-tab[data-position="left"] {
  left: 0;
}
.dnd-thia-feedback-tab[data-position="right"] {
  right: 0;
  border-right: 0;
  border-left: 1px solid var(--agent-chat-accent-border);
  border-radius: var(--agent-chat-radius-card) 0 0 var(--agent-chat-radius-card);
  transform: none;
}
.dnd-thia-feedback-tab:hover,
.dnd-thia-feedback-tab:focus-visible {
  outline: none;
  background: rgb(var(--elev-02, 23 28 38) / 0.98);
}
.dnd-thia-bubble-wrap {
  right: 1rem;
  bottom: 2.2rem;
  display: grid;
  gap: 0.45rem;
  justify-items: end;
}
.dnd-thia-greeting {
  max-width: 19rem;
  border: 1px solid var(--agent-chat-accent-border);
  border-radius: var(--agent-chat-radius-card);
  background: rgb(var(--elev-01, 15 18 25) / 0.94);
  color: rgb(var(--text-01, 244 247 251));
  padding: 0.68rem 0.78rem;
  font-size: 0.78rem;
  line-height: 1.36;
  box-shadow: 0 0 24px var(--agent-chat-accent-glow);
}
.dnd-thia-avatar {
  width: 3.05rem;
  height: 3.05rem;
  border: 2px solid var(--agent-chat-accent);
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 35%, var(--agent-chat-accent), transparent 28%),
    radial-gradient(circle at 42% 46%, rgb(103 232 249 / 0.65), transparent 12%),
    radial-gradient(circle at 60% 48%, rgb(167 139 250 / 0.52), transparent 13%),
    rgb(4 18 20);
  box-shadow: 0 0 18px var(--agent-chat-accent-border), inset 0 0 18px rgb(0 0 0 / 0.55);
  cursor: pointer;
}
.dnd-thia-window {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--agent-chat-radius-card);
  background: rgb(var(--elev-01, 15 18 25) / 0.98);
  box-shadow: 0 30px 90px rgb(0 0 0 / 0.58), 0 0 38px var(--agent-chat-accent-soft);
  transition: ${CHAT_GEOMETRY_TRANSITION};
}
.dnd-thia-window[data-expanded="true"] {
  border-color: var(--agent-chat-accent-border);
}
.dnd-thia-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  min-height: 3.15rem;
  padding: 0.7rem 0.78rem;
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  cursor: move;
  user-select: none;
  touch-action: none;
}
.dnd-thia-mark {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--agent-chat-accent-border);
  border-radius: 999px;
  background: radial-gradient(circle, var(--agent-chat-accent), transparent 62%);
  box-shadow: 0 0 18px var(--agent-chat-accent-glow);
}
.dnd-thia-title,
.dnd-thia-subtitle {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dnd-thia-title {
  font-weight: 800;
  line-height: 1.1;
}
.dnd-thia-subtitle {
  margin-top: 0.15rem;
  color: rgb(var(--text-muted, 147 158 176));
  font-size: 0.75rem;
}
.dnd-thia-actions {
  display: flex;
  gap: 0.3rem;
}
.dnd-thia-icon {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--agent-chat-radius-control);
  background: transparent;
  color: rgb(var(--text-02, 205 213 225));
  cursor: pointer;
  line-height: 1;
  touch-action: manipulation;
}
.dnd-thia-icon:hover,
.dnd-thia-icon:focus-visible {
  outline: none;
  border-color: var(--agent-chat-accent-border);
  color: var(--agent-chat-accent);
}
.dnd-thia-icon-glyph {
  display: block;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 1rem;
  line-height: 1;
  pointer-events: none;
}
.dnd-thia-icon[data-action="expand"] .dnd-thia-icon-glyph {
  transform: translateY(-1px);
}
.dnd-thia-icon[data-action="close"] .dnd-thia-icon-glyph {
  font-size: 1.08rem;
}
.dnd-thia-context {
  display: grid;
  gap: 0.35rem;
  padding: 0.62rem 0.78rem;
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  background: rgb(var(--elev-00, 7 9 13) / 0.42);
}
.dnd-thia-context p {
  margin: 0;
  color: rgb(var(--text-02, 205 213 225));
  font-size: 0.8rem;
  line-height: 1.35;
}
.dnd-thia-context-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.dnd-thia-chip {
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  border-radius: var(--agent-chat-radius-control);
  background: rgb(var(--elev-02, 23 28 38) / 0.62);
  color: rgb(var(--text-muted, 147 158 176));
  padding: 0.22rem 0.42rem;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.62rem;
}
.dnd-thia-messages {
  min-height: 0;
  overflow: auto;
  padding: 0.82rem;
  scrollbar-width: none;
}
.dnd-thia-messages::-webkit-scrollbar {
  display: none;
}
.dnd-thia-message {
  display: flex;
  margin-bottom: 0.75rem;
}
.dnd-thia-message[data-role="user"] {
  justify-content: flex-end;
}
.dnd-thia-message-body {
  max-width: 88%;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  border-radius: var(--agent-chat-radius-card);
  background: rgb(var(--elev-02, 23 28 38) / 0.72);
  padding: 0.62rem 0.75rem;
  color: rgb(var(--text-02, 205 213 225));
  font-size: 0.86rem;
  line-height: 1.45;
}
.dnd-thia-message[data-role="user"] .dnd-thia-message-body {
  border-color: rgb(34 211 238 / 0.32);
  background: rgb(8 145 178 / 0.17);
  color: rgb(var(--text-01, 244 247 251));
}
.dnd-thia-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.55rem;
}
.dnd-thia-quick button {
  border: 1px solid rgb(167 139 250 / 0.32);
  border-radius: 999px;
  background: rgb(167 139 250 / 0.12);
  color: rgb(221 214 254);
  padding: 0.32rem 0.48rem;
  cursor: pointer;
  font-size: 0.74rem;
}
.dnd-thia-composer {
  border-top: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  padding: 0.72rem;
}
.dnd-thia-composer-tools {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.55rem;
}
.dnd-thia-feedback-toggle,
.dnd-thia-feedback-submit,
.dnd-thia-feedback-cancel {
  min-height: 1.9rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--agent-chat-radius-control);
  background: transparent;
  color: rgb(var(--text-02, 205 213 225));
  cursor: pointer;
  font-size: 0.74rem;
  line-height: 1;
}
.dnd-thia-feedback-toggle {
  padding: 0 0.58rem;
  color: var(--agent-chat-accent);
}
.dnd-thia-feedback-toggle:hover,
.dnd-thia-feedback-toggle:focus-visible,
.dnd-thia-feedback-submit:hover,
.dnd-thia-feedback-submit:focus-visible,
.dnd-thia-feedback-cancel:hover,
.dnd-thia-feedback-cancel:focus-visible {
  outline: none;
  border-color: var(--agent-chat-accent-border);
  color: var(--agent-chat-accent);
}
.dnd-thia-feedback-panel {
  display: grid;
  gap: 0.55rem;
  margin-bottom: 0.62rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--agent-chat-radius-card);
  background: rgb(var(--elev-00, 7 9 13) / 0.54);
  padding: 0.68rem;
}
.dnd-thia-feedback-panel h3,
.dnd-thia-feedback-panel p {
  margin: 0;
}
.dnd-thia-feedback-panel h3 {
  color: rgb(var(--text-01, 244 247 251));
  font-size: 0.86rem;
  line-height: 1.2;
}
.dnd-thia-feedback-panel p {
  color: rgb(var(--text-muted, 147 158 176));
  font-size: 0.76rem;
  line-height: 1.38;
}
.dnd-thia-feedback-panel select,
.dnd-thia-feedback-panel textarea,
.dnd-thia-feedback-panel input {
  min-width: 0;
  width: 100%;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  border-radius: var(--agent-chat-radius-control);
  background: rgb(var(--elev-01, 15 18 25) / 0.86);
  color: rgb(var(--text-01, 244 247 251));
  padding: 0.5rem 0.56rem;
  font: inherit;
  font-size: 0.78rem;
}
.dnd-thia-feedback-panel textarea {
  min-height: 5.25rem;
  resize: vertical;
}
.dnd-thia-feedback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.dnd-thia-feedback-submit {
  border-color: var(--agent-chat-accent-border);
  background: var(--agent-chat-accent-soft);
  color: var(--agent-chat-accent);
  padding: 0 0.65rem;
}
.dnd-thia-feedback-cancel {
  padding: 0 0.58rem;
}
.dnd-thia-feedback-status {
  color: rgb(var(--text-muted, 147 158 176));
  font-size: 0.74rem;
  line-height: 1.35;
}
.dnd-thia-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 2.45rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--agent-chat-radius-card);
  background: rgb(var(--elev-00, 7 9 13) / 0.62);
}
.dnd-thia-input-row:focus-within {
  border-color: var(--agent-chat-accent-border);
  box-shadow: 0 0 0 2px var(--agent-chat-accent-soft);
}
.dnd-thia-input-row textarea {
  min-width: 0;
  min-height: 2.5rem;
  max-height: 7rem;
  resize: none;
  border: 0;
  outline: none;
  background: transparent;
  color: rgb(var(--text-01, 244 247 251));
  padding: 0.68rem;
}
.dnd-thia-send {
  border: 0;
  border-left: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  background: transparent;
  color: var(--agent-chat-accent);
  cursor: pointer;
  font-size: 1rem;
}
.dnd-thia-resize {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 1.35rem;
  height: 1.35rem;
  border: 0;
  background:
    linear-gradient(135deg, transparent 48%, var(--agent-chat-accent-border) 50%, transparent 53%),
    linear-gradient(135deg, transparent 60%, var(--agent-chat-accent-soft) 62%, transparent 65%);
  cursor: nwse-resize;
}
@media (max-width: 720px) {
  .dnd-thia-bubble-wrap {
    right: 0.65rem;
    bottom: 2.1rem;
  }
  .dnd-thia-feedback-tab {
    top: auto;
    bottom: 6.25rem;
    min-height: 7.4rem;
    font-size: 0.6rem;
  }
  .dnd-thia-window {
    left: 0 !important;
    top: 0 !important;
    right: auto;
    bottom: auto;
    width: 100vw !important;
    height: 100dvh !important;
    border: 0;
    border-radius: 0;
    transition: opacity 280ms ease, transform 420ms cubic-bezier(.2,.78,.18,1);
  }
  .dnd-thia-head {
    cursor: default;
  }
  .dnd-thia-resize {
    display: none;
  }
  .dnd-thia-messages {
    scrollbar-width: none;
  }
  .dnd-thia-messages::-webkit-scrollbar {
    display: none;
  }
}
`;

function injectChatCss() {
  if (chatCssInjected || typeof document === 'undefined') return;
  const id = 'dnd-thia-chat-seed-css';
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.textContent !== CHAT_CSS) existing.textContent = CHAT_CSS;
    chatCssInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = CHAT_CSS;
  document.head.appendChild(style);
  chatCssInjected = true;
}

function clampFrameSize(value: Frame['size']): Frame['size'] {
  if (typeof window === 'undefined') return value;
  const maxWidth = Math.max(320, window.innerWidth * 0.95);
  const maxHeight = Math.max(360, window.innerHeight * 0.95);
  return {
    width: Math.min(maxWidth, Math.max(360, value.width)),
    height: Math.min(maxHeight, Math.max(360, value.height)),
  };
}

function clampFramePosition(value: Frame['position'], size: Frame['size']): Frame['position'] {
  if (typeof window === 'undefined') return value;
  const margin = 8;
  return {
    x: Math.max(margin, Math.min(Math.max(margin, window.innerWidth - size.width - margin), value.x)),
    y: Math.max(margin, Math.min(Math.max(margin, window.innerHeight - size.height - margin), value.y)),
  };
}

function defaultFrame(): Frame {
  if (typeof window === 'undefined') {
    return { size: { width: 420, height: 540 }, position: { x: 24, y: 80 } };
  }
  const width = Math.min(460, Math.max(380, window.innerWidth * 0.28));
  const height = Math.min(620, Math.max(480, window.innerHeight * 0.58));
  const size = clampFrameSize({ width, height });
  return {
    size,
    position: clampFramePosition({
      x: Math.round(window.innerWidth - size.width - 28),
      y: Math.round(window.innerHeight - size.height - 84),
    }, size),
  };
}

function expandedFrame(pointer?: { x: number; y: number }): Frame {
  if (typeof window === 'undefined') return defaultFrame();
  const width = Math.min(1120, Math.max(CHAT_READABLE_WIDTH, window.innerWidth * 0.72));
  const height = Math.min(780, Math.max(560, window.innerHeight * 0.78));
  const size = clampFrameSize({ width, height });
  const x = pointer ? pointer.x - size.width * 0.55 : (window.innerWidth - size.width) / 2;
  const y = pointer ? pointer.y - 56 : (window.innerHeight - size.height) / 2;
  return { size, position: clampFramePosition({ x: Math.round(x), y: Math.round(y) }, size) };
}

function readStoredFrame(storageKey: string): Frame {
  if (typeof window === 'undefined') return defaultFrame();
  try {
    const raw = window.localStorage.getItem(`${storageKey}:frame`);
    if (!raw) return defaultFrame();
    const parsed = JSON.parse(raw) as Frame;
    const size = clampFrameSize(parsed.size);
    return { size, position: clampFramePosition(parsed.position, size) };
  } catch {
    return defaultFrame();
  }
}

function readDomFocus(): ThiaChatFocus {
  if (typeof document === 'undefined') return {};
  const orientation = readActiveAgentOrientation();
  return {
    surface: orientation.surface,
    tab: orientation.tab,
    focus: orientation.focus,
    item: orientation.item,
    relation: orientation.relation,
    count: orientation.count,
    boundary: orientation.boundary,
  };
}

function compactFocus(focus: ThiaChatFocus): string {
  const bits = [
    focus.surface && `surface: ${focus.surface}`,
    focus.tab && `tab: ${focus.tab}`,
    focus.focus && `focus: ${focus.focus}`,
    focus.relation && `relation: ${focus.relation}`,
  ].filter(Boolean);
  return bits.join(' / ');
}

function resolveFeedbackConfig(feedback: ThiaChatSeedProps['feedback']): Required<ThiaChatFeedbackConfig> {
  const base = {
    enabled: true,
    label: 'Help us improve',
    tabLabel: 'Help us improve',
    tabPosition: 'left' as const,
    title: 'Help us improve',
    description: 'Send a focused note about this surface. The host app decides where it is stored.',
    categories: DEFAULT_FEEDBACK_CATEGORIES,
    messagePlaceholder: 'What should be improved, corrected or preserved?',
    contactPlaceholder: 'Optional contact or reference',
    submitLabel: 'Send feedback',
  };
  if (feedback === false) return { ...base, enabled: false };
  if (feedback === true || feedback === undefined) return base;
  return { ...base, ...feedback, categories: feedback.categories?.length ? feedback.categories : base.categories };
}

export const ThiaChatSeed: React.FC<ThiaChatSeedProps> = ({
  title,
  subtitle,
  surfaceTitle,
  surfaceId,
  focus,
  starterPrompts = ['What is open now?', 'Which surface is in focus?', 'What should be preserved for porting?'],
  initialMessages,
  storageKey,
  openByDefault = false,
  className,
  brand = 'agent',
  feedback,
  onSend,
  onFeedbackSubmit,
}) => {
  const resolvedTitle = title || (brand === 'thia' ? 'THIA' : 'Assistant');
  const resolvedSubtitle = subtitle || (brand === 'thia' ? 'Design assistant' : 'Context assistant');
  const resolvedStorageKey = storageKey || (brand === 'thia' ? 'dnd-thia-chat-seed' : 'agent-context-chat-seed');
  const feedbackConfig = useMemo(() => resolveFeedbackConfig(feedback), [feedback]);

  useEffect(() => { injectChatCss(); }, []);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches,
  );
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return openByDefault;
    return window.sessionStorage.getItem(`${resolvedStorageKey}:open`) === '1' || openByDefault;
  });
  const [expanded, setExpanded] = useState(false);
  const [frame, setFrame] = useState<Frame>(() => readStoredFrame(resolvedStorageKey));
  const [messages, setMessages] = useState<ThiaChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.sessionStorage.getItem(`${resolvedStorageKey}:messages`);
        if (raw) return JSON.parse(raw) as ThiaChatMessage[];
      } catch { /* noop */ }
    }
    return initialMessages || [{
      role: 'assistant',
      text: 'I can orient on the open surface, visible panels and focused design element.',
      quickPrompts: starterPrompts,
    }];
  });
  const [input, setInput] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState(() => feedbackConfig.categories[0] || 'Feedback');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef(frame);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeFocus = useMemo<ThiaChatFocus>(() => {
    const domFocus = readDomFocus();
    return {
      ...domFocus,
      ...focus,
      surface: focus?.surface || surfaceId || domFocus.surface,
      focus: focus?.focus || surfaceTitle || domFocus.focus,
    };
  }, [focus, surfaceId, surfaceTitle]);

  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  useEffect(() => {
    if (!feedbackConfig.categories.includes(feedbackCategory)) {
      setFeedbackCategory(feedbackConfig.categories[0] || 'Feedback');
    }
  }, [feedbackCategory, feedbackConfig.categories]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 720px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(`${resolvedStorageKey}:open`, open ? '1' : '0');
  }, [open, resolvedStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(`${resolvedStorageKey}:messages`, JSON.stringify(messages.slice(-18)));
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, resolvedStorageKey]);

  const saveFrame = useCallback((next: Frame) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`${resolvedStorageKey}:frame`, JSON.stringify(next));
  }, [resolvedStorageKey]);

  const applyFrame = useCallback((next: Frame, persist = false) => {
    const size = clampFrameSize(next.size);
    const nextFrame = { size, position: clampFramePosition(next.position, size) };
    frameRef.current = nextFrame;
    setFrame(nextFrame);
    if (persist) saveFrame(nextFrame);
  }, [saveFrame]);

  const sendPrompt = useCallback(async (prompt: string) => {
    const clean = prompt.trim();
    if (!clean) return;
    setInput('');
    setOpen(true);
    setMessages(prev => [...prev, { role: 'user', text: clean }]);
    const currentFocus = { ...readDomFocus(), ...activeFocus };
    const fallback = `Current focus: ${compactFocus(currentFocus) || 'no active surface marker found'}. Preserve visible state, storage keys, panel boundaries and responsive behavior before porting.`;
    try {
      const response = onSend ? await onSend(clean, currentFocus) : fallback;
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Assistant handoff failed.';
      setMessages(prev => [...prev, { role: 'assistant', text: message }]);
    }
  }, [activeFocus, onSend]);

  const submitFeedback = useCallback(async () => {
    const clean = feedbackMessage.trim();
    if (!clean) {
      setFeedbackStatus('Write a short note before sending.');
      return;
    }

    const payload: ThiaChatFeedbackPayload = {
      category: feedbackCategory,
      message: clean,
      contact: feedbackContact.trim() || undefined,
      focus: { ...readDomFocus(), ...activeFocus },
      surfaceId,
    };

    try {
      const response = await onFeedbackSubmit?.(payload);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: response || `Feedback received: ${payload.category}. It is ready for the host app review flow.`,
        transientFocus: true,
      }]);
      setFeedbackMessage('');
      setFeedbackContact('');
      setFeedbackStatus('Feedback captured.');
      setFeedbackOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Feedback submit failed.';
      setFeedbackStatus(message);
    }
  }, [activeFocus, feedbackCategory, feedbackContact, feedbackMessage, onFeedbackSubmit, surfaceId]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = ((event as CustomEvent<ThiaChatAskDetail>).detail || {}) as ThiaChatAskDetail;
      const nextFocus = { ...activeFocus, ...detail };
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Focus received from ${detail.source || 'surface'}: ${compactFocus(nextFocus) || 'visible UI'}.`,
        transientFocus: true,
        quickPrompts: starterPrompts,
      }]);
      setOpen(true);
      if (!isMobile) {
        const next = expandedFrame();
        setExpanded(true);
        applyFrame(next, true);
      }
      if (detail.autoSend && detail.prompt) {
        window.setTimeout(() => void sendPrompt(detail.prompt || ''), 120);
      }
    };
    window.addEventListener(AGENT_CONTEXT_ASK_EVENT, handler);
    window.addEventListener(THIA_CONTEXT_ASK_EVENT, handler);
    return () => {
      window.removeEventListener(AGENT_CONTEXT_ASK_EVENT, handler);
      window.removeEventListener(THIA_CONTEXT_ASK_EVENT, handler);
    };
  }, [activeFocus, applyFrame, isMobile, sendPrompt, starterPrompts]);

  const onHeaderPointerDown = useCallback((event: React.PointerEvent) => {
    if (isMobile || event.button !== 0) return;
    event.preventDefault();
    const current = frameRef.current;
    dragRef.current = {
      kind: 'move',
      offsetX: event.clientX - current.position.x,
      offsetY: event.clientY - current.position.y,
    };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }, [isMobile]);

  const onResizePointerDown = useCallback((event: React.PointerEvent) => {
    if (isMobile || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      kind: 'resize',
      offsetX: 0,
      offsetY: 0,
    };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }, [isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.kind === 'resize') {
        const current = frameRef.current;
        applyFrame({
          size: {
            width: event.clientX - current.position.x,
            height: event.clientY - current.position.y,
          },
          position: current.position,
        });
        return;
      }

      const current = frameRef.current;
      applyFrame({
        size: current.size,
        position: {
          x: event.clientX - drag.offsetX,
          y: event.clientY - drag.offsetY,
        },
      });
    };
    const onPointerUp = () => {
      if (dragRef.current) saveFrame(frameRef.current);
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [applyFrame, saveFrame]);

  const toggleExpanded = useCallback(() => {
    const next = expanded ? defaultFrame() : expandedFrame();
    setExpanded(!expanded);
    applyFrame(next, true);
  }, [applyFrame, expanded]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendPrompt(input);
  };

  const openFeedbackPanel = useCallback(() => {
    setOpen(true);
    setFeedbackOpen(true);
    setFeedbackStatus('');
  }, []);

  const feedbackTab = feedbackConfig.enabled ? (
    <button
      type="button"
      className={`dnd-thia dnd-thia-feedback-tab${className ? ` ${className}` : ''}`}
      data-brand={brand}
      data-position={feedbackConfig.tabPosition}
      onClick={openFeedbackPanel}
      aria-label={feedbackConfig.title}
    >
      {feedbackConfig.tabLabel}
    </button>
  ) : null;

  if (!open) {
    return (
      <>
        {feedbackTab}
        <div className={`dnd-thia dnd-thia-bubble-wrap${className ? ` ${className}` : ''}`} data-brand={brand}>
          <div className="dnd-thia-greeting">I can orient you on what is open here.</div>
          <button type="button" className="dnd-thia-avatar" aria-label={`Open ${resolvedTitle}`} onClick={() => setOpen(true)} />
        </div>
      </>
    );
  }

  return (
    <>
      {feedbackTab}
      <section
        className={`dnd-thia dnd-thia-window${className ? ` ${className}` : ''}`}
        data-brand={brand}
        data-expanded={expanded ? 'true' : 'false'}
        style={isMobile ? undefined : {
          left: frame.position.x,
          top: frame.position.y,
          width: frame.size.width,
          height: frame.size.height,
        }}
        aria-label={`${resolvedTitle} chat seed`}
      >
      <header className="dnd-thia-head" onPointerDown={onHeaderPointerDown}>
        <span className="dnd-thia-mark" aria-hidden="true" />
        <span>
          <span className="dnd-thia-title">{resolvedTitle}</span>
          <span className="dnd-thia-subtitle">{resolvedSubtitle}</span>
        </span>
        <span className="dnd-thia-actions" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" className="dnd-thia-icon" data-action="expand" onClick={toggleExpanded} aria-label={expanded ? 'Shrink chat' : 'Expand chat'}>
            <span className="dnd-thia-icon-glyph" aria-hidden="true">{expanded ? '↙' : '↗'}</span>
          </button>
          <button type="button" className="dnd-thia-icon" data-action="close" onClick={() => setOpen(false)} aria-label="Close chat">
            <span className="dnd-thia-icon-glyph" aria-hidden="true">×</span>
          </button>
        </span>
      </header>

      <div className="dnd-thia-context">
        <p>{activeFocus.focus || surfaceTitle || 'No focused surface selected yet.'}</p>
        <div className="dnd-thia-context-chips" aria-label="Current awareness">
          {Object.entries(activeFocus).filter(([, value]) => value).map(([key, value]) => (
            <span key={key} className="dnd-thia-chip">{key}: {value}</span>
          ))}
        </div>
      </div>

      <div className="dnd-thia-messages">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className="dnd-thia-message" data-role={message.role}>
            <div className="dnd-thia-message-body">
              {message.text}
              {message.quickPrompts && message.quickPrompts.length > 0 && (
                <div className="dnd-thia-quick">
                  {message.quickPrompts.map(prompt => (
                    <button key={prompt} type="button" onClick={() => void sendPrompt(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="dnd-thia-composer" onSubmit={onSubmit}>
        {feedbackConfig.enabled && (
          <>
            <div className="dnd-thia-composer-tools">
              <button
                type="button"
                className="dnd-thia-feedback-toggle"
                onClick={() => setFeedbackOpen(open => !open)}
                aria-expanded={feedbackOpen ? 'true' : 'false'}
              >
                {feedbackConfig.label}
              </button>
            </div>
            {feedbackOpen && (
              <div className="dnd-thia-feedback-panel" role="group" aria-label={feedbackConfig.title}>
                <div>
                  <h3>{feedbackConfig.title}</h3>
                  <p>{feedbackConfig.description}</p>
                </div>
                <select
                  value={feedbackCategory}
                  onChange={event => setFeedbackCategory(event.target.value)}
                  aria-label="Feedback category"
                >
                  {feedbackConfig.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <textarea
                  value={feedbackMessage}
                  rows={4}
                  placeholder={feedbackConfig.messagePlaceholder}
                  onChange={event => setFeedbackMessage(event.target.value)}
                />
                <input
                  value={feedbackContact}
                  placeholder={feedbackConfig.contactPlaceholder}
                  onChange={event => setFeedbackContact(event.target.value)}
                />
                <div className="dnd-thia-feedback-actions">
                  <button type="button" className="dnd-thia-feedback-submit" onClick={() => void submitFeedback()}>
                    {feedbackConfig.submitLabel}
                  </button>
                  <button type="button" className="dnd-thia-feedback-cancel" onClick={() => setFeedbackOpen(false)}>
                    Cancel
                  </button>
                </div>
                {feedbackStatus && <div className="dnd-thia-feedback-status">{feedbackStatus}</div>}
              </div>
            )}
          </>
        )}
        <div className="dnd-thia-input-row">
          <textarea
            value={input}
            rows={1}
            placeholder="Ask about the active surface..."
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button type="submit" className="dnd-thia-send" aria-label="Send message">&gt;</button>
        </div>
      </form>

        <button type="button" className="dnd-thia-resize" aria-label="Resize chat" onPointerDown={onResizePointerDown} />
      </section>
    </>
  );
};

export default ThiaChatSeed;
