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
  name?: string;
  email?: string;
  newsletter?: boolean;
  attachments?: { name: string; size: number; type: string }[];
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
  moduleTitle?: string;
  moduleSubtitle?: string;
  categories?: string[];
  messagePlaceholder?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  contactPlaceholder?: string;
  newsletterLabel?: string;
  clearLabel?: string;
  previewLabel?: string;
  editLabel?: string;
  downloadLabel?: string;
  attachLabel?: string;
  closeLabel?: string;
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
  managerLabel?: string;
  onSend?: (prompt: string, focus: ThiaChatFocus) => Promise<string> | string;
  onFeedbackSubmit?: (payload: ThiaChatFeedbackPayload) => Promise<string | void> | string | void;
  onManagerClick?: () => void;
}

type Frame = {
  size: { width: number; height: number };
  position: { x: number; y: number };
};

type DragState = {
  kind: 'move' | 'resize' | 'split';
  offsetX: number;
  offsetY: number;
  startX?: number;
  startY?: number;
  startSize?: Frame['size'];
  pendingUndock?: boolean;
  didShrink?: boolean;
};

const CHAT_READABLE_WIDTH = 720;
const CHAT_READABLE_DRAG_WIDTH = 720;
const CHAT_SHRINK_DRAG_DELTA = 90;
const CHAT_NATURAL_HOME_TOLERANCE = 56;
const DEFAULT_INTAKE_SPLIT_PCT = 45;
const INTAKE_COMPACT_WIDTH = 500;
const INTAKE_FORM_MIN_WIDTH = 320;
const RESET_CONFIRM_TIMEOUT_MS = 2600;
const CHAT_GEOMETRY_TRANSITION = 'opacity 410ms ease, transform 1210ms cubic-bezier(.2,.78,.18,1), left 1210ms cubic-bezier(.2,.78,.18,1), top 1210ms cubic-bezier(.2,.78,.18,1), width 1210ms cubic-bezier(.2,.78,.18,1), height 1210ms cubic-bezier(.2,.78,.18,1)';
const DEFAULT_FEEDBACK_CATEGORIES = ['Contribution', 'Question'];

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
  animation: dndThiaWindowIn 280ms ease both;
}
@keyframes dndThiaWindowIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.dnd-thia-window[data-expanded="true"] {
  border-color: var(--agent-chat-accent-border);
}
.dnd-thia-window[data-intake="true"] {
  grid-template-rows: auto minmax(0, 1fr);
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
  align-items: center;
}
.dnd-thia-manager {
  min-height: 2rem;
  border: 1px solid var(--agent-chat-accent-border);
  border-radius: var(--agent-chat-radius-control);
  background: rgb(var(--elev-02, 23 28 38) / 0.44);
  color: rgb(var(--text-02, 205 213 225));
  cursor: pointer;
  font-size: 0.72rem;
  line-height: 1;
  padding: 0 0.62rem;
  touch-action: manipulation;
}
.dnd-thia-manager:hover,
.dnd-thia-manager:focus-visible {
  outline: none;
  color: var(--agent-chat-accent);
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
.dnd-thia-icon[data-confirming="true"] {
  border-color: var(--agent-chat-accent-border);
  background: var(--agent-chat-accent-soft);
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
.dnd-thia-intake {
  display: grid;
  grid-template-columns: minmax(220px, var(--dnd-thia-intake-split, 45%)) 4px minmax(260px, 1fr);
  min-height: 0;
  overflow: hidden;
}
.dnd-thia-mobile-tabs {
  display: none;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  background: rgb(var(--elev-00, 7 9 13) / 0.76);
}
.dnd-thia-mobile-tabs button {
  min-height: 2.55rem;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: rgb(var(--text-muted, 147 158 176));
  cursor: pointer;
  font-weight: 700;
}
.dnd-thia-mobile-tabs button.is-active {
  border-bottom-color: var(--agent-chat-accent);
  background: var(--agent-chat-accent-soft);
  color: var(--agent-chat-accent);
}
.dnd-thia-intake-chat,
.dnd-thia-intake-form-wrap {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dnd-thia-intake-chat {
  border-right: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
}
.dnd-thia-intake-splitter {
  display: grid;
  place-items: center;
  width: 4px;
  border: 0;
  background: rgb(var(--elev-00, 7 9 13) / 0.78);
  cursor: col-resize;
}
.dnd-thia-intake-splitter span {
  width: 2px;
  height: 2.2rem;
  border-radius: 999px;
  background: rgb(var(--text-muted, 147 158 176));
}
.dnd-thia-intake-splitter:hover span,
.dnd-thia-intake-splitter:focus-visible span {
  background: var(--agent-chat-accent);
}
.dnd-thia-intake-starters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  border-top: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  padding: 0.68rem 0.72rem;
}
.dnd-thia-intake-starters button {
  border: 1px solid rgb(167 139 250 / 0.34);
  border-radius: 999px;
  background: rgb(167 139 250 / 0.12);
  color: rgb(221 214 254);
  padding: 0.36rem 0.58rem;
  cursor: pointer;
  font-size: 0.74rem;
}
.dnd-thia-window[data-intake-compact="true"] .dnd-thia-intake {
  display: flex;
  flex-direction: column;
}
.dnd-thia-window[data-intake-compact="true"] .dnd-thia-mobile-tabs {
  display: grid;
}
.dnd-thia-window[data-intake-compact="true"] .dnd-thia-intake-splitter {
  display: none;
}
.dnd-thia-window[data-intake-compact="true"] .dnd-thia-intake-chat {
  border-right: 0;
}
.dnd-thia-window[data-intake-compact="true"][data-pane="chat"] .dnd-thia-intake-form-wrap,
.dnd-thia-window[data-intake-compact="true"][data-pane="form"] .dnd-thia-intake-chat {
  display: none;
}
.dnd-thia-window[data-intake-compact="true"] .dnd-thia-intake-chat,
.dnd-thia-window[data-intake-compact="true"] .dnd-thia-intake-form-wrap {
  flex: 1 1 auto;
}
.dnd-thia-module-form {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto auto auto auto;
  gap: 0.72rem;
  min-height: 0;
  height: 100%;
  overflow: auto;
  padding: 1rem;
  background: rgb(var(--elev-00, 7 9 13) / 0.34);
}
.dnd-thia-module-head {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: flex-start;
}
.dnd-thia-module-title {
  color: var(--agent-chat-accent);
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.2;
}
.dnd-thia-module-subtitle {
  margin-top: 0.52rem;
  color: rgb(var(--text-02, 205 213 225));
  font-size: 0.82rem;
  line-height: 1.42;
}
.dnd-thia-kind-row,
.dnd-thia-module-tools,
.dnd-thia-module-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.dnd-thia-kind-row {
  justify-content: flex-end;
}
.dnd-thia-kind-row button,
.dnd-thia-module-mini,
.dnd-thia-file-button {
  min-height: 2rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--agent-chat-radius-control);
  background: transparent;
  color: rgb(var(--text-02, 205 213 225));
  cursor: pointer;
  font-size: 0.74rem;
  line-height: 1;
  padding: 0 0.62rem;
}
.dnd-thia-kind-row button.is-active,
.dnd-thia-file-button,
.dnd-thia-module-submit {
  border-color: var(--agent-chat-accent-border);
  background: var(--agent-chat-accent-soft);
  color: var(--agent-chat-accent);
}
.dnd-thia-module-close {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: var(--agent-chat-radius-control);
  background: transparent;
  color: rgb(var(--text-muted, 147 158 176));
  cursor: pointer;
  font-size: 1.2rem;
}
.dnd-thia-module-form textarea,
.dnd-thia-module-form input {
  min-width: 0;
  width: 100%;
  border: 1px solid rgb(167 139 250 / 0.42);
  border-radius: var(--agent-chat-radius-card);
  background: rgb(var(--elev-01, 15 18 25) / 0.72);
  color: rgb(var(--text-01, 244 247 251));
  padding: 0.7rem 0.78rem;
  font: inherit;
  font-size: 0.82rem;
}
.dnd-thia-module-form textarea {
  min-height: 18rem;
  resize: vertical;
}
.dnd-thia-md-preview {
  min-height: 18rem;
  overflow: auto;
  border: 1px solid rgb(167 139 250 / 0.42);
  border-radius: var(--agent-chat-radius-card);
  background: rgb(var(--elev-01, 15 18 25) / 0.72);
  color: rgb(var(--text-02, 205 213 225));
  padding: 0.78rem;
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-wrap;
}
.dnd-thia-file-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.52rem;
  align-items: center;
}
.dnd-thia-file-list {
  color: rgb(var(--text-muted, 147 158 176));
  font-size: 0.74rem;
}
.dnd-thia-module-tools {
  justify-content: flex-end;
}
.dnd-thia-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.58rem;
}
.dnd-thia-check {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  color: rgb(var(--text-02, 205 213 225));
  font-size: 0.78rem;
}
.dnd-thia-module-foot {
  justify-content: space-between;
}
.dnd-thia-module-submit {
  min-height: 2.35rem;
  border-radius: var(--agent-chat-radius-control);
  cursor: pointer;
  font-weight: 800;
  padding: 0 0.8rem;
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
  .dnd-thia-intake {
    display: flex;
    flex-direction: column;
  }
  .dnd-thia-intake-chat {
    border-right: 0;
  }
  .dnd-thia-intake-splitter {
    display: none;
  }
  .dnd-thia-module-form {
    padding: 0.85rem;
  }
  .dnd-thia-module-head,
  .dnd-thia-form-grid {
    grid-template-columns: 1fr;
  }
  .dnd-thia-module-head {
    display: grid;
  }
  .dnd-thia-kind-row {
    justify-content: flex-start;
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

function nearValue(value: number, target: number, tolerance = CHAT_NATURAL_HOME_TOLERANCE): boolean {
  return Math.abs(value - target) <= tolerance;
}

function compactDragWidthThreshold(intakeMode: boolean): number {
  return intakeMode ? CHAT_READABLE_DRAG_WIDTH : CHAT_READABLE_DRAG_WIDTH;
}

function isNaturalChatHome(size: Frame['size'], position: Frame['position']): boolean {
  if (typeof window === 'undefined') return false;
  const home = defaultFrame();
  const nearDefaultHome = nearValue(position.x, home.position.x)
    && nearValue(position.y, home.position.y)
    && size.width <= compactDragWidthThreshold(false);
  const nearLowerLeftHome = position.x <= CHAT_NATURAL_HOME_TOLERANCE
    && nearValue(position.y + size.height, window.innerHeight - 84, 90)
    && size.width <= compactDragWidthThreshold(false);
  return nearDefaultHome || nearLowerLeftHome;
}

function expandReadableFrameOnDrag(
  pointer: { x: number; y: number },
  current: Frame,
  intakeMode: boolean,
): Frame {
  const target = intakeMode
    ? intakeFrame()
    : {
        size: {
          width: Math.max(CHAT_READABLE_DRAG_WIDTH, current.size.width * 1.45),
          height: Math.max(560, current.size.height),
        },
        position: {
          x: pointer.x - 130,
          y: current.position.y,
        },
      };
  const size = clampFrameSize(target.size);
  return {
    size,
    position: clampFramePosition({
      x: Math.min(current.position.x, target.position.x),
      y: intakeMode ? Math.min(current.position.y, target.position.y) : target.position.y,
    }, size),
  };
}

function intakeFrame(): Frame {
  if (typeof window === 'undefined') {
    return { size: { width: 960, height: 640 }, position: { x: 24, y: 24 } };
  }
  const width = Math.min(1200, Math.max(960, window.innerWidth * 0.68));
  const height = Math.min(760, Math.max(640, window.innerHeight * 0.78));
  const size = clampFrameSize({ width, height });
  return {
    size,
    position: clampFramePosition({
      x: Math.round((window.innerWidth - size.width) / 2),
      y: Math.round((window.innerHeight - size.height) / 2),
    }, size),
  };
}

function fullPageFrame(): Frame {
  if (typeof window === 'undefined') return defaultFrame();
  const margin = 8;
  return {
    size: {
      width: Math.max(320, window.innerWidth - margin * 2),
      height: Math.max(360, window.innerHeight - margin * 2),
    },
    position: { x: margin, y: margin },
  };
}

function undockFrameForDrag(pointer: { x: number; y: number }, intakeMode: boolean): Frame {
  const target = intakeMode ? intakeFrame() : defaultFrame();
  const size = clampFrameSize(target.size);
  const headerGripX = Math.min(Math.max(160, size.width * 0.24), size.width - 72);
  return {
    size,
    position: clampFramePosition({
      x: pointer.x - headerGripX,
      y: pointer.y - 24,
    }, size),
  };
}

function shrinkReadableFrameOnDrag(pointer: { x: number; y: number }): Frame {
  const target = defaultFrame();
  const size = clampFrameSize(target.size);
  return {
    size,
    position: clampFramePosition({
      x: pointer.x - Math.min(180, size.width * 0.5),
      y: pointer.y - 32,
    }, size),
  };
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

function initialChatMessages(
  initialMessages: ThiaChatMessage[] | undefined,
  starterPrompts: string[],
): ThiaChatMessage[] {
  return initialMessages || [{
    role: 'assistant',
    text: 'I can orient on the open surface, visible panels and focused design element.',
    quickPrompts: starterPrompts,
  }];
}

function plainMarkdownPreview(value: string): string {
  return value.trim() || 'Write the trace, doubt, correction, source, or useful detail.';
}

function resolveFeedbackConfig(feedback: ThiaChatSeedProps['feedback']): Required<ThiaChatFeedbackConfig> {
  const base = {
    enabled: true,
    label: 'Help us improve',
    tabLabel: 'Help us improve',
    tabPosition: 'left' as const,
    title: 'Submit Module',
    description: 'THIA keeps Lab context and classifies what is useful.',
    moduleTitle: 'Submit Module',
    moduleSubtitle: 'THIA collects the question and prepares a clear trace to send.',
    categories: DEFAULT_FEEDBACK_CATEGORIES,
    messagePlaceholder: 'Write the trace, doubt, correction, source, or useful detail.',
    namePlaceholder: 'Name, optional',
    emailPlaceholder: 'Email, optional',
    contactPlaceholder: 'Email, optional',
    newsletterLabel: 'Keep me updated by email',
    clearLabel: 'Clear form',
    previewLabel: 'Preview .md',
    editLabel: 'Edit .md',
    downloadLabel: 'Download',
    attachLabel: 'Attach file',
    closeLabel: 'Close',
    submitLabel: 'Submit module',
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
  managerLabel = 'Manager',
  onSend,
  onFeedbackSubmit,
  onManagerClick,
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
    return initialChatMessages(initialMessages, starterPrompts);
  });
  const [input, setInput] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mobileIntakePane, setMobileIntakePane] = useState<'chat' | 'form'>('form');
  const [feedbackCategory, setFeedbackCategory] = useState(() => feedbackConfig.categories[0] || 'Feedback');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [feedbackNewsletter, setFeedbackNewsletter] = useState(false);
  const [feedbackPreview, setFeedbackPreview] = useState(false);
  const [feedbackAttachments, setFeedbackAttachments] = useState<{ name: string; size: number; type: string }[]>([]);
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [resetConfirming, setResetConfirming] = useState(false);
  const [intakeSplitPct, setIntakeSplitPct] = useState(DEFAULT_INTAKE_SPLIT_PCT);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef(frame);
  const restoreFrameRef = useRef<Frame | null>(null);
  const readableExpandedFromHomeRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<number | null>(null);

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

  useEffect(() => () => {
    if (resetTimerRef.current != null) window.clearTimeout(resetTimerRef.current);
  }, []);

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
      name: feedbackName.trim() || undefined,
      email: feedbackContact.trim() || undefined,
      newsletter: feedbackNewsletter,
      attachments: feedbackAttachments.length ? feedbackAttachments : undefined,
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
      setFeedbackName('');
      setFeedbackContact('');
      setFeedbackNewsletter(false);
      setFeedbackAttachments([]);
      setFeedbackPreview(false);
      setFeedbackStatus(response ? 'Module submitted.' : 'Module submitted. The trace was recorded for review.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Feedback submit failed.';
      setFeedbackStatus(message);
    }
  }, [activeFocus, feedbackAttachments, feedbackCategory, feedbackContact, feedbackMessage, feedbackName, feedbackNewsletter, onFeedbackSubmit, surfaceId]);

  const clearResetConfirm = useCallback(() => {
    if (resetTimerRef.current != null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setResetConfirming(false);
    setFeedbackStatus(status => (status === 'Click reset again to clear the chat.' ? '' : status));
  }, []);

  const resetChat = useCallback(() => {
    clearResetConfirm();
    setInput('');
    setMessages(initialChatMessages(initialMessages, starterPrompts));
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(`${resolvedStorageKey}:messages`);
    }
  }, [clearResetConfirm, initialMessages, resolvedStorageKey, starterPrompts]);

  const requestResetChat = useCallback(() => {
    if (resetConfirming) {
      resetChat();
      return;
    }
    setResetConfirming(true);
    setFeedbackStatus('Click reset again to clear the chat.');
    if (resetTimerRef.current != null) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(clearResetConfirm, RESET_CONFIRM_TIMEOUT_MS);
  }, [clearResetConfirm, resetChat, resetConfirming]);

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
        setExpanded(false);
        restoreFrameRef.current = null;
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
    const intakeMode = feedbackOpen;
    let current = frameRef.current;
    const canExpandFromNaturalHome = !intakeMode
      && !readableExpandedFromHomeRef.current
      && isNaturalChatHome(current.size, current.position);
    if (canExpandFromNaturalHome) {
      const expandedFrame = expandReadableFrameOnDrag(
        { x: event.clientX, y: event.clientY },
        current,
        false,
      );
      readableExpandedFromHomeRef.current = true;
      restoreFrameRef.current = null;
      setExpanded(false);
      applyFrame(expandedFrame, true);
      current = expandedFrame;
    }
    dragRef.current = {
      kind: 'move',
      offsetX: event.clientX - current.position.x,
      offsetY: event.clientY - current.position.y,
      startX: event.clientX,
      startY: event.clientY,
      startSize: current.size,
      pendingUndock: expanded,
      didShrink: false,
    };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }, [applyFrame, expanded, feedbackOpen, isMobile]);

  const onResizePointerDown = useCallback((event: React.PointerEvent) => {
    if (isMobile || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setExpanded(false);
    restoreFrameRef.current = null;
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
      if (drag.kind === 'split') {
        const rect = windowRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pct = ((event.clientX - rect.left) / rect.width) * 100;
        const maxByForm = ((Math.max(1, rect.width) - INTAKE_FORM_MIN_WIDTH) / Math.max(1, rect.width)) * 100;
        setIntakeSplitPct(Math.min(54, Math.max(28, Math.min(pct, maxByForm))));
        return;
      }
      if (drag.kind === 'resize') {
        const current = frameRef.current;
        applyFrame({
          size: {
            width: event.clientX - current.position.x,
            height: event.clientY - current.position.y,
          },
          position: current.position,
        });
        if (frameRef.current.size.width <= compactDragWidthThreshold(feedbackOpen)) {
          readableExpandedFromHomeRef.current = false;
        }
        return;
      }

      const current = frameRef.current;
      const deltaX = drag.startX == null ? 0 : event.clientX - drag.startX;
      const deltaY = drag.startY == null ? 0 : event.clientY - drag.startY;
      if (drag.pendingUndock) {
        if (deltaY > 28 && deltaY > Math.abs(deltaX) * 0.7) {
          const undocked = undockFrameForDrag({ x: event.clientX, y: event.clientY }, feedbackOpen);
          drag.pendingUndock = false;
          drag.didShrink = true;
          restoreFrameRef.current = null;
          readableExpandedFromHomeRef.current = true;
          setExpanded(false);
          drag.offsetX = event.clientX - undocked.position.x;
          drag.offsetY = event.clientY - undocked.position.y;
          applyFrame(undocked, true);
          return;
        }
        return;
      }
      const startSize = drag.startSize || current.size;
      const canShrink = !feedbackOpen && !drag.didShrink
        && (startSize.width >= 820 || startSize.height >= 680)
        && deltaY > CHAT_SHRINK_DRAG_DELTA;
      if (canShrink) {
        const shrunk = shrinkReadableFrameOnDrag({ x: event.clientX, y: event.clientY });
        drag.didShrink = true;
        restoreFrameRef.current = null;
        readableExpandedFromHomeRef.current = false;
        setExpanded(false);
        drag.offsetX = event.clientX - shrunk.position.x;
        drag.offsetY = event.clientY - shrunk.position.y;
        applyFrame(shrunk, true);
        return;
      }
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
  }, [applyFrame, feedbackOpen, saveFrame]);

  const toggleExpanded = useCallback(() => {
    if (isMobile) return;
    if (expanded) {
      const restore = restoreFrameRef.current || (feedbackOpen ? intakeFrame() : defaultFrame());
      restoreFrameRef.current = null;
      setExpanded(false);
      applyFrame(restore, true);
      return;
    }
    restoreFrameRef.current = frameRef.current;
    setExpanded(true);
    applyFrame(fullPageFrame(), true);
  }, [applyFrame, expanded, feedbackOpen, isMobile]);

  const openChatHome = useCallback(() => {
    setOpen(true);
    setFeedbackOpen(false);
    setMobileIntakePane('chat');
    setExpanded(false);
    restoreFrameRef.current = null;
    readableExpandedFromHomeRef.current = false;
    if (!isMobile) applyFrame(defaultFrame(), true);
  }, [applyFrame, isMobile]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendPrompt(input);
  };

  const openFeedbackPanel = useCallback(() => {
    setOpen(true);
    setFeedbackOpen(true);
    setMobileIntakePane('form');
    setIntakeSplitPct(DEFAULT_INTAKE_SPLIT_PCT);
    setExpanded(false);
    restoreFrameRef.current = null;
    readableExpandedFromHomeRef.current = true;
    if (!isMobile) applyFrame(intakeFrame(), true);
    setFeedbackStatus('');
  }, [applyFrame, isMobile]);

  const handleManagerClick = useCallback(() => {
    if (onManagerClick) {
      onManagerClick();
      return;
    }
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: 'Manager hook is available for the host app. This seed keeps it inert unless onManagerClick is provided.',
      transientFocus: true,
    }]);
  }, [onManagerClick]);

  const onIntakeSplitPointerDown = useCallback((event: React.PointerEvent) => {
    if (isMobile || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { kind: 'split', offsetX: 0, offsetY: 0 };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }, [isMobile]);

  const clearFeedbackForm = useCallback(() => {
    setFeedbackMessage('');
    setFeedbackName('');
    setFeedbackContact('');
    setFeedbackNewsletter(false);
    setFeedbackAttachments([]);
    setFeedbackPreview(false);
    setFeedbackStatus('');
  }, []);

  const downloadFeedbackMarkdown = useCallback(() => {
    if (typeof document === 'undefined') return;
    const body = [
      `# ${feedbackConfig.moduleTitle}`,
      '',
      `- category: ${feedbackCategory}`,
      feedbackName.trim() ? `- name: ${feedbackName.trim()}` : '',
      feedbackContact.trim() ? `- email: ${feedbackContact.trim()}` : '',
      `- newsletter: ${feedbackNewsletter ? 'yes' : 'no'}`,
      feedbackAttachments.length ? `- attachments: ${feedbackAttachments.map(file => file.name).join(', ')}` : '',
      '',
      feedbackMessage.trim(),
    ].filter(Boolean).join('\n');
    const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thia-submit-module.md';
    link.click();
    URL.revokeObjectURL(url);
  }, [feedbackAttachments, feedbackCategory, feedbackConfig.moduleTitle, feedbackContact, feedbackMessage, feedbackName, feedbackNewsletter]);

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

  const chatMessages = (
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
  );

  const chatComposer = (
    <form className="dnd-thia-composer" onSubmit={onSubmit}>
      {feedbackConfig.enabled && !feedbackOpen && (
        <div className="dnd-thia-composer-tools">
          <button
            type="button"
            className="dnd-thia-feedback-toggle"
            onClick={openFeedbackPanel}
            aria-expanded={feedbackOpen ? 'true' : 'false'}
          >
            {feedbackConfig.label}
          </button>
        </div>
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
  );

  const intakeTitle = `${feedbackConfig.moduleTitle} · ${activeFocus.focus || surfaceTitle || activeFocus.surface || resolvedTitle}`;
  const attachmentLabel = feedbackAttachments.length
    ? `${feedbackAttachments.length} file${feedbackAttachments.length === 1 ? '' : 's'} ready in the module.`
    : '';

  const feedbackForm = (
    <form className="dnd-thia-module-form" onSubmit={(event) => { event.preventDefault(); void submitFeedback(); }}>
      <div className="dnd-thia-module-head">
        <div>
          <div className="dnd-thia-module-title">{intakeTitle}</div>
          <div className="dnd-thia-module-subtitle">{feedbackConfig.moduleSubtitle}</div>
        </div>
        <div className="dnd-thia-kind-row">
          {feedbackConfig.categories.map(category => (
            <button
              key={category}
              type="button"
              className={category === feedbackCategory ? 'is-active' : ''}
              onClick={() => setFeedbackCategory(category)}
            >
              {category}
            </button>
          ))}
          <button type="button" className="dnd-thia-module-close" onClick={() => setFeedbackOpen(false)} aria-label={feedbackConfig.closeLabel}>
            ×
          </button>
        </div>
      </div>

      {feedbackPreview ? (
        <div className="dnd-thia-md-preview">{plainMarkdownPreview(feedbackMessage)}</div>
      ) : (
        <textarea
          value={feedbackMessage}
          maxLength={6000}
          placeholder={feedbackConfig.messagePlaceholder}
          onChange={event => setFeedbackMessage(event.target.value)}
        />
      )}

      <div className="dnd-thia-file-row">
        <button type="button" className="dnd-thia-file-button" onClick={() => fileInputRef.current?.click()}>
          + {feedbackConfig.attachLabel}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={event => {
            const files = Array.from(event.target.files || []).slice(0, 6).map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
            }));
            setFeedbackAttachments(files);
            event.currentTarget.value = '';
          }}
        />
        {attachmentLabel && <div className="dnd-thia-file-list">{attachmentLabel}</div>}
      </div>

      <div className="dnd-thia-module-tools">
        <button type="button" className="dnd-thia-module-mini" onClick={clearFeedbackForm}>{feedbackConfig.clearLabel}</button>
        <button type="button" className="dnd-thia-module-mini" onClick={() => setFeedbackPreview(value => !value)}>
          {feedbackPreview ? feedbackConfig.editLabel : feedbackConfig.previewLabel}
        </button>
        <button type="button" className="dnd-thia-module-mini" onClick={downloadFeedbackMarkdown}>{feedbackConfig.downloadLabel}</button>
      </div>

      <div className="dnd-thia-form-grid">
        <input
          value={feedbackName}
          placeholder={feedbackConfig.namePlaceholder}
          autoComplete="name"
          onChange={event => setFeedbackName(event.target.value)}
        />
        <input
          value={feedbackContact}
          placeholder={feedbackConfig.emailPlaceholder}
          autoComplete="email"
          type="email"
          onChange={event => setFeedbackContact(event.target.value)}
        />
      </div>

      <label className="dnd-thia-check">
        <input type="checkbox" checked={feedbackNewsletter} onChange={event => setFeedbackNewsletter(event.target.checked)} />
        <span>{feedbackConfig.newsletterLabel}</span>
      </label>

      <div className="dnd-thia-module-foot">
        <div className="dnd-thia-feedback-status">{feedbackStatus || feedbackCategory}</div>
        <button type="submit" className="dnd-thia-module-submit">{feedbackConfig.submitLabel}</button>
      </div>
    </form>
  );

  const windowStyle = isMobile ? undefined : ({
    left: frame.position.x,
    top: frame.position.y,
    width: frame.size.width,
    height: frame.size.height,
    '--dnd-thia-intake-split': `${intakeSplitPct}%`,
  } as React.CSSProperties & Record<'--dnd-thia-intake-split', string>);
  const isIntakeCompact = feedbackOpen && (isMobile || frame.size.width < INTAKE_COMPACT_WIDTH);

  if (!open) {
    return (
      <>
        {feedbackTab}
        <div className={`dnd-thia dnd-thia-bubble-wrap${className ? ` ${className}` : ''}`} data-brand={brand}>
          <div className="dnd-thia-greeting">I can orient you on what is open here.</div>
          <button type="button" className="dnd-thia-avatar" aria-label={`Open ${resolvedTitle}`} onClick={openChatHome} />
        </div>
      </>
    );
  }

  return (
    <>
      {feedbackTab}
      <section
        ref={windowRef}
        className={`dnd-thia dnd-thia-window${className ? ` ${className}` : ''}`}
        data-brand={brand}
        data-expanded={expanded ? 'true' : 'false'}
        data-intake={feedbackOpen ? 'true' : 'false'}
        data-intake-compact={isIntakeCompact ? 'true' : 'false'}
        data-pane={mobileIntakePane}
        style={windowStyle}
        aria-label={`${resolvedTitle} chat seed`}
      >
      <header className="dnd-thia-head" onPointerDown={onHeaderPointerDown}>
        <span className="dnd-thia-mark" aria-hidden="true" />
        <span>
          <span className="dnd-thia-title">{resolvedTitle}</span>
          <span className="dnd-thia-subtitle">{resolvedSubtitle}</span>
        </span>
        <span className="dnd-thia-actions" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" className="dnd-thia-manager" onClick={handleManagerClick}>
            {managerLabel}
          </button>
          <button
            type="button"
            className="dnd-thia-icon"
            data-action="reset"
            data-confirming={resetConfirming ? 'true' : 'false'}
            onClick={requestResetChat}
            aria-label="Reset chat"
            title="Reset chat"
          >
            <span className="dnd-thia-icon-glyph" aria-hidden="true">↻</span>
          </button>
          <button type="button" className="dnd-thia-icon" data-action="expand" onClick={toggleExpanded} aria-label={expanded ? 'Restore chat' : 'Full page'} title={expanded ? 'Restore chat' : 'Full page'}>
            <span className="dnd-thia-icon-glyph" aria-hidden="true">{expanded ? '↙' : '⛶'}</span>
          </button>
          <button type="button" className="dnd-thia-icon" data-action="close" onClick={() => setOpen(false)} aria-label="Close chat" title="Close chat">
            <span className="dnd-thia-icon-glyph" aria-hidden="true">×</span>
          </button>
        </span>
      </header>

        {feedbackOpen ? (
          <div className="dnd-thia-intake">
            <div className="dnd-thia-mobile-tabs" role="tablist" aria-label="Submit Module panes">
              {([
                ['chat', 'Chat'],
                ['form', 'Form'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  className={mobileIntakePane === key ? 'is-active' : ''}
                  aria-selected={mobileIntakePane === key ? 'true' : 'false'}
                  onClick={() => setMobileIntakePane(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="dnd-thia-intake-chat">
              {chatMessages}
              <div className="dnd-thia-intake-starters">
                {['What is useful?', 'Clarify my idea', 'Guide me'].map(prompt => (
                  <button key={prompt} type="button" onClick={() => void sendPrompt(prompt)}>{prompt}</button>
                ))}
              </div>
              {chatComposer}
            </div>
            <button
              type="button"
              className="dnd-thia-intake-splitter"
              aria-label="Resize panels"
              onPointerDown={onIntakeSplitPointerDown}
            >
              <span aria-hidden="true" />
            </button>
            <div className="dnd-thia-intake-form-wrap">
              {feedbackForm}
            </div>
          </div>
        ) : (
          <>
            <div className="dnd-thia-context">
              <p>{activeFocus.focus || surfaceTitle || 'No focused surface selected yet.'}</p>
              <div className="dnd-thia-context-chips" aria-label="Current awareness">
                {Object.entries(activeFocus).filter(([, value]) => value).map(([key, value]) => (
                  <span key={key} className="dnd-thia-chip">{key}: {value}</span>
                ))}
              </div>
            </div>
            {chatMessages}
            {chatComposer}
          </>
        )}

        {!expanded && <button type="button" className="dnd-thia-resize" aria-label="Resize chat" onPointerDown={onResizePointerDown} />}
      </section>
    </>
  );
};

export default ThiaChatSeed;
