import React, { useEffect, useId, useRef } from 'react';

export const DND_RADII = {
  none: '0',
  hairline: '2px',
  control: '4px',
  panel: '6px',
  card: '8px',
  modal: '8px',
  pill: '999px',
} as const;

export type DndButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type DndButtonSize = 'sm' | 'md';
export type DndCardTone = 'default' | 'active' | 'warning' | 'danger';

export type AgentButtonVariant = DndButtonVariant;
export type AgentButtonSize = DndButtonSize;
export type AgentCardTone = DndCardTone;

export interface DndButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DndButtonVariant;
  size?: DndButtonSize;
  fullWidth?: boolean;
}

export interface DndCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: DndCardTone;
  interactive?: boolean;
}

export interface DndModalProps {
  open: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  closeLabel?: string;
}

export type AgentButtonProps = DndButtonProps;
export type AgentCardProps = DndCardProps;
export type AgentModalProps = DndModalProps;

const DESIGN_CSS = `
:root {
  --dnd-radius-hairline: ${DND_RADII.hairline};
  --dnd-radius-control: ${DND_RADII.control};
  --dnd-radius-panel: ${DND_RADII.panel};
  --dnd-radius-card: ${DND_RADII.card};
  --dnd-radius-modal: ${DND_RADII.modal};
  --dnd-radius-pill: ${DND_RADII.pill};
  --dnd-focus-ring: 0 0 0 2px rgb(34 211 238 / 0.42);
  --dnd-shadow-panel: 0 18px 50px rgb(0 0 0 / 0.46);
}

.dnd-ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 2.25rem;
  min-height: 2.25rem;
  padding: 0 0.78rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--dnd-radius-control);
  background: rgb(var(--elev-01, 15 18 25) / 0.86);
  color: rgb(var(--text-02, 205 213 225));
  font: inherit;
  font-size: 0.85rem;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, color 150ms ease, transform 150ms ease;
}
.dnd-ui-button:hover {
  border-color: var(--c-primary-border-hover, rgb(34 211 238 / 0.48));
  color: rgb(var(--text-01, 244 247 251));
  background: rgb(var(--elev-02, 23 28 38) / 0.92);
}
.dnd-ui-button:active {
  transform: translateY(1px);
}
.dnd-ui-button:focus-visible {
  outline: none;
  box-shadow: var(--dnd-focus-ring);
}
.dnd-ui-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
.dnd-ui-button[data-size="sm"] {
  min-height: 1.9rem;
  padding: 0 0.58rem;
  font-size: 0.75rem;
}
.dnd-ui-button[data-variant="primary"] {
  border-color: rgb(34 211 238 / 0.45);
  background: rgb(8 145 178 / 0.2);
  color: var(--c-primary-text, rgb(103 232 249));
}
.dnd-ui-button[data-variant="ghost"] {
  border-color: transparent;
  background: transparent;
}
.dnd-ui-button[data-variant="danger"] {
  border-color: rgb(248 113 113 / 0.35);
  background: rgb(127 29 29 / 0.18);
  color: rgb(252 165 165);
}
.dnd-ui-button[data-full-width="true"] {
  width: 100%;
}

.dnd-ui-card {
  min-width: 0;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  border-radius: var(--dnd-radius-card);
  background: rgb(var(--elev-01, 15 18 25) / 0.68);
  color: rgb(var(--text-02, 205 213 225));
}
.dnd-ui-card[data-interactive="true"] {
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
}
.dnd-ui-card[data-interactive="true"]:hover {
  border-color: var(--c-primary-border-hover, rgb(34 211 238 / 0.48));
  background: var(--c-primary-bg, rgb(8 145 178 / 0.16));
}
.dnd-ui-card:focus-visible {
  outline: none;
  box-shadow: var(--dnd-focus-ring);
}
.dnd-ui-card[data-tone="active"] {
  border-color: rgb(34 211 238 / 0.5);
  background: rgb(8 145 178 / 0.14);
}
.dnd-ui-card[data-tone="warning"] {
  border-color: rgb(245 158 11 / 0.42);
  background: rgb(120 53 15 / 0.16);
}
.dnd-ui-card[data-tone="danger"] {
  border-color: rgb(248 113 113 / 0.38);
  background: rgb(127 29 29 / 0.14);
}

.dnd-ui-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(0 0 0 / 0.58);
}
.dnd-ui-modal {
  width: min(100%, 34rem);
  max-height: min(42rem, calc(100dvh - 2rem));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: var(--dnd-radius-modal);
  background: rgb(var(--elev-01, 15 18 25) / 0.98);
  box-shadow: var(--dnd-shadow-panel);
}
.dnd-ui-modal:focus-visible {
  outline: none;
  box-shadow: var(--dnd-shadow-panel), var(--dnd-focus-ring);
}
.dnd-ui-modal-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: start;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
}
.dnd-ui-modal-title {
  margin: 0;
  color: rgb(var(--text-01, 244 247 251));
  font-size: 1rem;
  line-height: 1.2;
}
.dnd-ui-modal-subtitle {
  margin: 0.35rem 0 0;
  color: rgb(var(--text-muted, 147 158 176));
  font-size: 0.86rem;
  line-height: 1.45;
}
.dnd-ui-modal-body {
  min-height: 0;
  overflow: auto;
  padding: 1rem;
}
.dnd-ui-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-top: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
}
`;

let designCssInjected = false;
function injectDesignCSS() {
  if (designCssInjected || typeof document === 'undefined') return;
  const id = 'dnd-design-primitives-css';
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.textContent !== DESIGN_CSS) existing.textContent = DESIGN_CSS;
    designCssInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = DESIGN_CSS;
  document.head.appendChild(style);
  designCssInjected = true;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((node) => {
    if (node.hasAttribute('disabled')) return false;
    if (node.getAttribute('aria-hidden') === 'true') return false;
    const style = window.getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

export function DndButton({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: DndButtonProps) {
  useEffect(() => { injectDesignCSS(); }, []);
  return (
    <button
      {...props}
      className={`dnd-ui-button ${className}`.trim()}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth ? 'true' : undefined}
    />
  );
}

export function DndCard({
  tone = 'default',
  interactive = false,
  className = '',
  tabIndex,
  onKeyDown,
  ...props
}: DndCardProps) {
  useEffect(() => { injectDesignCSS(); }, []);
  return (
    <div
      {...props}
      className={`dnd-ui-card ${className}`.trim()}
      data-tone={tone}
      data-interactive={interactive ? 'true' : undefined}
      tabIndex={interactive && tabIndex === undefined ? 0 : tabIndex}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!interactive || event.defaultPrevented) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    />
  );
}

export function DndModal({
  open,
  title,
  subtitle,
  children,
  footer,
  onClose,
  closeLabel = 'Close',
}: DndModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => { injectDesignCSS(); }, []);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusable(modalRef.current);
      (focusable[0] || modalRef.current)?.focus();
    }, 0);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusable(modalRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        modalRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="dnd-ui-modal-backdrop" onPointerDown={onClose}>
      <section
        ref={modalRef}
        className="dnd-ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="dnd-ui-modal-head">
          <div>
            <h2 className="dnd-ui-modal-title" id={titleId}>{title}</h2>
            {subtitle && <p className="dnd-ui-modal-subtitle">{subtitle}</p>}
          </div>
          <DndButton type="button" variant="ghost" size="sm" onClick={onClose} aria-label={closeLabel}>
            ×
          </DndButton>
        </header>
        <div className="dnd-ui-modal-body">{children}</div>
        {footer && <footer className="dnd-ui-modal-foot">{footer}</footer>}
      </section>
    </div>
  );
}

export const AgentButton = DndButton;
export const AgentCard = DndCard;
export const AgentModal = DndModal;

export default {
  DND_RADII,
  DndButton,
  DndCard,
  DndModal,
  AgentButton,
  AgentCard,
  AgentModal,
};
