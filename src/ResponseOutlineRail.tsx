import React, { useMemo } from 'react';

export type ResponseOutlineKind =
  | 'section'
  | 'turn'
  | 'step'
  | 'claim'
  | 'action'
  | 'warning'
  | 'result';

export interface ResponseOutlineItem {
  id: string;
  label: string;
  kind?: ResponseOutlineKind;
  meta?: string;
  active?: boolean;
  muted?: boolean;
  targetId?: string;
  onSelect?: (item: ResponseOutlineItem) => void;
}

export interface ResponseOutlineRailProps {
  items: ResponseOutlineItem[];
  title?: string;
  activeId?: string;
  mode?: 'rail' | 'panel' | 'inline';
  side?: 'left' | 'right';
  className?: string;
  onSelect?: (item: ResponseOutlineItem) => void;
}

const KIND_CLASS: Record<ResponseOutlineKind, string> = {
  section: 'ro-kind-section',
  turn: 'ro-kind-turn',
  step: 'ro-kind-step',
  claim: 'ro-kind-claim',
  action: 'ro-kind-action',
  warning: 'ro-kind-warning',
  result: 'ro-kind-result',
};

function scrollToItem(item: ResponseOutlineItem) {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(item.targetId || item.id);
  if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

const RESPONSE_OUTLINE_CSS = `
.ro-rail {
  --ro-c-section: rgb(34 211 238);
  --ro-c-turn: rgb(167 139 250);
  --ro-c-step: rgb(45 212 191);
  --ro-c-claim: rgb(250 204 21);
  --ro-c-action: rgb(16 185 129);
  --ro-c-warning: rgb(251 113 133);
  --ro-c-result: rgb(96 165 250);
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: rgb(var(--text-01, 241 245 249));
}
.ro-rail.ro-panel,
.ro-rail.ro-inline {
  width: 100%;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
  background: rgb(var(--elev-01, 16 16 22) / 0.74);
}
.ro-rail.ro-panel {
  max-width: 320px;
}
.ro-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
}
.ro-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  line-height: 1.1;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(var(--text-muted, 170 175 190));
}
.ro-count {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: var(--c-primary-text, rgb(103 232 249));
}
.ro-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  padding: 0.7rem;
  min-width: 0;
}
.ro-rail.ro-rail-only {
  align-items: center;
  width: 42px;
}
.ro-rail.ro-rail-only .ro-list {
  align-items: center;
  gap: 0;
  padding: 0.35rem 0;
}
.ro-item {
  --ro-accent: var(--ro-c-section);
  appearance: none;
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 0.55rem;
  align-items: start;
  padding: 0.45rem 0.45rem;
  border-radius: 0.375rem;
  text-align: left;
  cursor: pointer;
}
.ro-kind-section { --ro-accent: var(--ro-c-section); }
.ro-kind-turn { --ro-accent: var(--ro-c-turn); }
.ro-kind-step { --ro-accent: var(--ro-c-step); }
.ro-kind-claim { --ro-accent: var(--ro-c-claim); }
.ro-kind-action { --ro-accent: var(--ro-c-action); }
.ro-kind-warning { --ro-accent: var(--ro-c-warning); }
.ro-kind-result { --ro-accent: var(--ro-c-result); }
.ro-item:hover {
  background: rgb(var(--elev-02, 24 24 32) / 0.82);
}
.ro-item:focus-visible {
  outline: 2px solid var(--ro-accent);
  outline-offset: 1px;
}
.ro-item.is-active {
  background: color-mix(in srgb, var(--ro-accent) 14%, transparent);
}
.ro-item.is-muted {
  opacity: 0.48;
}
.ro-marker {
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 28px;
}
.ro-marker::before {
  content: '';
  position: absolute;
  top: -0.45rem;
  bottom: -0.45rem;
  width: 1px;
  background: rgb(var(--border-02, 255 255 255 / 0.16));
}
.ro-dot {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 0.35rem;
  border-radius: 999px;
  border: 1px solid var(--ro-accent);
  background: rgb(var(--elev-01, 16 16 22));
  box-shadow: 0 0 0 2px rgb(var(--elev-01, 16 16 22));
}
.ro-item.is-active .ro-dot {
  background: var(--ro-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ro-accent) 24%, transparent);
}
.ro-text {
  min-width: 0;
}
.ro-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.86rem;
  line-height: 1.35;
  font-weight: 600;
}
.ro-meta {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.15rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: rgb(var(--text-muted, 170 175 190));
}
.ro-rail-only .ro-item {
  width: 36px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.ro-rail-only .ro-text {
  display: none;
}
.ro-rail-only .ro-marker {
  min-height: 34px;
}
.ro-empty {
  padding: 0.8rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: rgb(var(--text-muted, 170 175 190));
}
`;

function StyleOnce() {
  return <style>{RESPONSE_OUTLINE_CSS}</style>;
}

export function ResponseOutlineRail({
  items,
  title = 'Outline',
  activeId,
  mode = 'rail',
  side = 'right',
  className = '',
  onSelect,
}: ResponseOutlineRailProps) {
  const safeItems = useMemo(() => items.filter((item) => item.id && item.label), [items]);
  const railOnly = mode === 'rail';

  const handleSelect = (item: ResponseOutlineItem) => {
    if (item.onSelect) item.onSelect(item);
    else if (onSelect) onSelect(item);
    else scrollToItem(item);
  };

  return (
    <nav
      className={[
        'ro-rail',
        railOnly ? 'ro-rail-only' : `ro-${mode}`,
        side === 'left' ? 'ro-left' : 'ro-right',
        className,
      ].join(' ')}
      aria-label={title}
      data-thia-marker="response-outline"
      data-thia-count={safeItems.length}
    >
      <StyleOnce />
      {!railOnly && (
        <div className="ro-head">
          <span className="ro-title">{title}</span>
          <span className="ro-count">{safeItems.length}</span>
        </div>
      )}
      <div className="ro-list">
        {safeItems.length === 0 && !railOnly ? (
          <div className="ro-empty">No outline yet</div>
        ) : (
          safeItems.map((item) => {
            const kind = item.kind || 'section';
            const isActive = item.active || activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={[
                  'ro-item',
                  KIND_CLASS[kind],
                  isActive ? 'is-active' : '',
                  item.muted ? 'is-muted' : '',
                ].join(' ')}
                title={railOnly ? item.label : undefined}
                aria-current={isActive ? 'true' : undefined}
                aria-label={railOnly ? item.label : undefined}
                onClick={() => handleSelect(item)}
                data-thia-item={item.id}
                data-thia-focus={isActive ? 'active' : undefined}
              >
                <span className="ro-marker" aria-hidden="true">
                  <span className="ro-dot" />
                </span>
                <span className="ro-text">
                  <span className="ro-label">{item.label}</span>
                  {item.meta && <span className="ro-meta">{item.meta}</span>}
                </span>
              </button>
            );
          })
        )}
      </div>
    </nav>
  );
}

export default ResponseOutlineRail;
