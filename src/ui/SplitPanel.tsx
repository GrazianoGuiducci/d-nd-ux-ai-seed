import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

/**
 * SplitPanel — 2 pannelli con resizer draggabile.
 *
 * Primitivo riutilizzabile (come HoverPopover). Gestisce:
 *  - Orientation horizontal (lato-lato) o vertical (sopra-sotto)
 *  - Ratio persisted in localStorage (se storageKey fornita)
 *  - Min/max clamp
 *  - Pointer events (mouse + touch unificati)
 *  - Keyboard a11y (frecce su resizer spostano ±5%)
 *  - Responsive: sotto 900px il secondo pannello diventa drawer laterale
 *
 * Usage:
 *   <SplitPanel
 *     orientation="horizontal"
 *     first={<LabFeed />}
 *     second={<LabLiveResults />}
 *     defaultRatio={0.5}
 *     storageKey="lab_agente_split"
 *   />
 */

export interface SplitPanelProps {
  first: ReactNode;
  second: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  defaultRatio?: number; // 0..1, porzione del primo pannello
  minRatio?: number;     // default 0.15
  maxRatio?: number;     // default 0.85
  storageKey?: string;   // localStorage key per persistenza
  firstLabel?: string;   // mostrato come eyebrow sopra first
  secondLabel?: string;  // mostrato come eyebrow sopra second
  /** Sotto 900px il secondo pannello diventa drawer invece di split. Default true. */
  stackOnMobile?: boolean;
}

const RESIZER_PX = 8;

let cssInjected = false;
const SPLIT_CSS = `
.split-panel {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.split-panel[data-orientation="horizontal"] { flex-direction: row; }
.split-panel[data-orientation="vertical"] { flex-direction: column; }
.split-panel-pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.split-panel-pane-eyebrow {
  flex-shrink: 0;
  padding: 0.5rem 0.95rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--text-muted, 170 175 190));
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.07));
  background: rgb(var(--elev-02, 24 24 32) / 0.4);
}
.split-panel-pane-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.split-panel-resizer {
  flex-shrink: 0;
  position: relative;
  background: rgb(var(--border-01, 255 255 255 / 0.07));
  transition: background 120ms ease;
  z-index: 2;
}
.split-panel-resizer:hover, .split-panel-resizer.dragging,
.split-panel-resizer:focus-visible {
  background: var(--c-primary-border-hover, rgb(34 211 238 / 0.5));
  outline: none;
}
.split-panel[data-orientation="horizontal"] .split-panel-resizer {
  width: ${RESIZER_PX}px;
  cursor: col-resize;
}
.split-panel[data-orientation="vertical"] .split-panel-resizer {
  height: ${RESIZER_PX}px;
  cursor: row-resize;
}
.split-panel-resizer-grip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgb(var(--text-muted, 170 175 190) / 0.5);
  border-radius: 2px;
}
.split-panel[data-orientation="horizontal"] .split-panel-resizer-grip {
  width: 2px;
  height: 24px;
}
.split-panel[data-orientation="vertical"] .split-panel-resizer-grip {
  width: 24px;
  height: 2px;
}

/* Mobile and narrow browser windows: second pane as side drawer, resizer hidden */
@media (max-width: 900px) {
  .split-panel.stack-mobile {
    position: relative;
  }
  .split-panel.stack-mobile .split-panel-resizer {
    display: none;
  }
  .split-panel.stack-mobile .split-panel-pane {
    flex: none !important;
    min-height: 200px;
  }
  .split-panel.stack-mobile[data-orientation="horizontal"] {
    display: block;
  }
  .split-panel.stack-mobile[data-orientation="horizontal"] > .split-panel-pane:first-child {
    width: 100% !important;
    height: 100%;
  }
  .split-panel.stack-mobile[data-orientation="horizontal"] > .split-panel-pane:last-of-type {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 86vw) !important;
    height: 100%;
    z-index: 90;
    background: rgb(var(--elev-01, 16 16 22) / 0.98);
    border-left: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    transform: translateX(100%);
    transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .split-panel.stack-mobile[data-orientation="horizontal"][data-mobile-second-open="true"] > .split-panel-pane:last-of-type {
    transform: translateX(0);
  }
  .split-panel-mobile-backdrop {
    position: fixed;
    inset: 0;
    z-index: 85;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease;
  }
  .split-panel.stack-mobile[data-mobile-second-open="true"] .split-panel-mobile-backdrop {
    opacity: 1;
    pointer-events: auto;
  }
  .split-panel-mobile-peek {
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 70;
    width: 30px;
    height: 76px;
    border: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
    border-right: 0;
    border-radius: 10px 0 0 10px;
    background: rgb(var(--elev-02, 24 24 32) / 0.92);
    color: var(--c-primary-text, rgb(103 232 249));
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    writing-mode: vertical-rl;
    cursor: pointer;
  }
  .split-panel-mobile-peek:hover {
    background: rgb(var(--elev-03, 34 34 44));
  }
  .split-panel.stack-mobile[data-mobile-second-open="true"] .split-panel-mobile-peek {
    opacity: 0;
    pointer-events: none;
  }
  .split-panel-mobile-close {
    display: inline-flex !important;
  }
}
.split-panel-mobile-backdrop,
.split-panel-mobile-peek,
.split-panel-mobile-close {
  display: none;
}
`;

function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  if (document.getElementById('split-panel-css')) { cssInjected = true; return; }
  const style = document.createElement('style');
  style.id = 'split-panel-css';
  style.textContent = SPLIT_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

function readRatio(key: string | undefined, fallback: number): number {
  if (!key || typeof window === 'undefined') return fallback;
  try {
    const v = parseFloat(window.localStorage.getItem(key) || '');
    if (Number.isFinite(v) && v > 0 && v < 1) return v;
  } catch { /* noop */ }
  return fallback;
}

export const SplitPanel: React.FC<SplitPanelProps> = ({
  first,
  second,
  orientation = 'horizontal',
  defaultRatio = 0.5,
  minRatio = 0.15,
  maxRatio = 0.85,
  storageKey,
  firstLabel,
  secondLabel,
  stackOnMobile = true,
}) => {
  useEffect(() => { injectCSS(); }, []);

  const [ratio, setRatio] = useState<number>(() => readRatio(storageKey, defaultRatio));
  const [dragging, setDragging] = useState(false);
  const [mobileSecondOpen, setMobileSecondOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try { window.localStorage.setItem(storageKey, String(ratio)); } catch { /* noop */ }
  }, [ratio, storageKey]);

  const onResizerPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (ev: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let r: number;
      if (orientation === 'horizontal') {
        r = (ev.clientX - rect.left) / rect.width;
      } else {
        r = (ev.clientY - rect.top) / rect.height;
      }
      r = Math.max(minRatio, Math.min(maxRatio, r));
      setRatio(r);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = orientation === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = '';
    };
  }, [dragging, orientation, minRatio, maxRatio]);

  const onResizerKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 0.05;
    const dec = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const inc = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    if (e.key === dec) { e.preventDefault(); setRatio(r => Math.max(minRatio, r - step)); }
    if (e.key === inc) { e.preventDefault(); setRatio(r => Math.min(maxRatio, r + step)); }
  }, [orientation, minRatio, maxRatio]);

  const pct = Math.round(ratio * 10000) / 100;
  const firstStyle: React.CSSProperties = orientation === 'horizontal'
    ? { width: `${pct}%`, flex: 'none' }
    : { height: `${pct}%`, flex: 'none' };
  const secondStyle: React.CSSProperties = { flex: '1 1 0' };

  return (
    <div
      ref={containerRef}
      className={`split-panel${stackOnMobile ? ' stack-mobile' : ''}`}
      data-orientation={orientation}
      data-mobile-second-open={mobileSecondOpen ? 'true' : undefined}
    >
      <div className="split-panel-pane" style={firstStyle}>
        {firstLabel && <div className="split-panel-pane-eyebrow">{firstLabel}</div>}
        <div className="split-panel-pane-body">{first}</div>
      </div>
      <div
        className={`split-panel-resizer${dragging ? ' dragging' : ''}`}
        role="separator"
        aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        aria-valuenow={pct}
        aria-valuemin={minRatio * 100}
        aria-valuemax={maxRatio * 100}
        tabIndex={0}
        onPointerDown={onResizerPointerDown}
        onKeyDown={onResizerKeyDown}
      >
        <span className="split-panel-resizer-grip" />
      </div>
      <div className="split-panel-pane" style={secondStyle}>
        {secondLabel && (
          <div className="split-panel-pane-eyebrow flex items-center justify-between gap-2">
            <span>{secondLabel}</span>
            <button
              type="button"
              className="split-panel-mobile-close hidden h-7 w-7 items-center justify-center rounded border border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-200"
              onClick={() => setMobileSecondOpen(false)}
              aria-label={`Close ${secondLabel}`}
            >
              ×
            </button>
          </div>
        )}
        <div className="split-panel-pane-body">{second}</div>
      </div>
      <button
        type="button"
        className="split-panel-mobile-peek"
        onClick={() => setMobileSecondOpen(true)}
        aria-label={`Open ${secondLabel || 'detail'}`}
      >
        {secondLabel || 'Detail'}
      </button>
      <div
        className="split-panel-mobile-backdrop"
        onClick={() => setMobileSecondOpen(false)}
        aria-hidden="true"
      />
    </div>
  );
};

export default SplitPanel;
