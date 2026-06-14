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
 *  - Book collapse: il secondo pannello collassa in gutter se scende sotto soglia
 *  - Mobile: lo split orizzontale diventa sopra/sotto con resizer orizzontale;
 *    drawer opzionale via mobileBehavior
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
  /** Back-compat alias: se true e mobileBehavior non e definito usa il drawer. */
  stackOnMobile?: boolean;
  /** Mobile default: resta ridimensionabile, passando da lato/lato a sopra/sotto. */
  mobileBehavior?: 'resizable' | 'drawer';
  /** Collassa il primo pannello quando la sua dimensione scende sotto questa soglia. */
  collapseFirstBelow?: number;
  /** Collassa il secondo pannello quando la sua dimensione scende sotto questa soglia. */
  collapseSecondBelow?: number;
  /** Dimensione gutter del primo pannello chiuso. */
  collapsedFirstSize?: number;
  /** Dimensione gutter del secondo pannello chiuso. */
  collapsedSecondSize?: number;
}

const RESIZER_PX = 8;
const DEFAULT_COLLAPSE_SECOND_BELOW = 220;
const DEFAULT_COLLAPSED_SECOND_SIZE = 44;
const REOPEN_DELTA = 56;

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
.split-panel-pane.is-collapsed {
  position: relative;
  z-index: 3;
  overflow: hidden;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  background: rgb(var(--elev-02, 24 24 32) / 0.42);
}
.split-panel-pane-eyebrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
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
.split-panel-mobile-close,
.split-panel-pane-collapse {
  display: none;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
  background: transparent;
  color: rgb(var(--text-muted, 170 175 190));
  cursor: pointer;
}
.split-panel-pane-collapse {
  display: inline-flex;
}
.split-panel-mobile-close:hover,
.split-panel-mobile-close:focus-visible,
.split-panel-pane-collapse:hover,
.split-panel-pane-collapse:focus-visible {
  border-color: var(--c-primary-border-hover, rgb(34 211 238 / 0.5));
  color: var(--c-primary-text, rgb(103 232 249));
  outline: none;
}
.split-panel-pane.is-collapsed .split-panel-pane-eyebrow,
.split-panel-pane.is-collapsed .split-panel-pane-body {
  display: none;
}
.split-panel-book-gutter {
  display: none;
  position: relative;
  z-index: 4;
  width: 100%;
  height: 100%;
  min-height: 100%;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  background: transparent;
  color: rgb(var(--text-muted, 170 175 190));
  cursor: pointer;
  touch-action: manipulation;
}
.split-panel-book-gutter.is-first {
  order: -1;
}
.split-panel-pane.is-collapsed .split-panel-book-gutter {
  display: flex;
}
.split-panel-book-gutter:hover,
.split-panel-book-gutter:focus-visible {
  color: var(--c-primary-text, rgb(103 232 249));
  background: var(--c-primary-bg, rgb(6 58 78 / 0.35));
  outline: none;
}
.split-panel[data-orientation="horizontal"] .split-panel-book-gutter {
  flex-direction: column;
}
.split-panel[data-orientation="vertical"] .split-panel-book-gutter {
  flex-direction: row;
}
.split-panel[data-orientation="vertical"] .split-panel-pane.is-collapsed,
.split-panel[data-orientation="vertical"] .split-panel-book-gutter {
  width: 100%;
}
.split-panel-book-icon {
  width: 24px;
  height: 24px;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}
.split-panel-book-label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: inherit;
}
.split-panel[data-orientation="horizontal"] .split-panel-book-label {
  writing-mode: vertical-rl;
  max-height: 11rem;
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
.split-panel[data-first-state="closed"] .split-panel-resizer,
.split-panel[data-second-state="closed"] .split-panel-resizer {
  background: transparent;
}
.split-panel[data-first-state="closed"] .split-panel-resizer .split-panel-resizer-grip,
.split-panel[data-second-state="closed"] .split-panel-resizer .split-panel-resizer-grip {
  opacity: 1;
  background: var(--c-primary-border-hover, rgb(34 211 238 / 0.5));
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

/* Optional legacy mobile drawer. Default mobile behavior remains resizable. */
@media (max-width: 900px) {
  .split-panel-pane,
  .split-panel-pane-body {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .split-panel-pane::-webkit-scrollbar,
  .split-panel-pane-body::-webkit-scrollbar {
    display: none;
  }
  .split-panel.mobile-resizable .split-panel-pane-collapse {
    display: none;
  }
  .split-panel.mobile-resizable[data-orientation="vertical"] .split-panel-resizer-grip {
    display: none;
  }
  .split-panel.mobile-resizable[data-orientation="vertical"] .split-panel-book-icon {
    display: none;
  }
  .split-panel.mobile-resizable[data-orientation="vertical"] .split-panel-book-gutter {
    min-height: 44px;
  }
  .split-panel.mobile-drawer {
    position: relative;
  }
  .split-panel.mobile-drawer .split-panel-resizer {
    display: none;
  }
  .split-panel.mobile-drawer .split-panel-pane {
    flex: none !important;
    min-height: 200px;
  }
  .split-panel.mobile-drawer[data-orientation="horizontal"] {
    display: block;
  }
  .split-panel.mobile-drawer[data-orientation="horizontal"] > .split-panel-pane:first-child {
    width: 100% !important;
    height: 100%;
  }
  .split-panel.mobile-drawer[data-orientation="horizontal"] > .split-panel-pane:last-of-type {
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
  .split-panel.mobile-drawer[data-orientation="horizontal"][data-mobile-second-open="true"] > .split-panel-pane:last-of-type {
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
  .split-panel.mobile-drawer[data-mobile-second-open="true"] .split-panel-mobile-backdrop {
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
  .split-panel.mobile-drawer[data-mobile-second-open="true"] .split-panel-mobile-peek {
    opacity: 0;
    pointer-events: none;
  }
  .split-panel.mobile-drawer .split-panel-mobile-close {
    display: inline-flex !important;
  }
}
.split-panel-mobile-backdrop,
.split-panel-mobile-peek {
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
  stackOnMobile = false,
  mobileBehavior,
  collapseFirstBelow = DEFAULT_COLLAPSE_SECOND_BELOW,
  collapseSecondBelow = DEFAULT_COLLAPSE_SECOND_BELOW,
  collapsedFirstSize = DEFAULT_COLLAPSED_SECOND_SIZE,
  collapsedSecondSize = DEFAULT_COLLAPSED_SECOND_SIZE,
}) => {
  useEffect(() => { injectCSS(); }, []);

  const [ratio, setRatio] = useState<number>(() => readRatio(storageKey, defaultRatio));
  const [dragging, setDragging] = useState(false);
  const [mobileSecondOpen, setMobileSecondOpen] = useState(false);
  const [firstState, setFirstState] = useState<'open' | 'closed'>('open');
  const [secondState, setSecondState] = useState<'open' | 'closed'>('open');
  const [isMobileResizable, setIsMobileResizable] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const skipAutoCollapseRef = useRef(false);
  const capturedResizerPointerRef = useRef<{ element: HTMLElement; pointerId: number } | null>(null);
  const dragStartRef = useRef<{
    pos: number;
    firstSize: number;
    secondSize: number;
    firstState: 'open' | 'closed';
    secondState: 'open' | 'closed';
  } | null>(null);
  const resolvedMobileBehavior = mobileBehavior || (stackOnMobile ? 'drawer' : 'resizable');
  const effectiveOrientation =
    resolvedMobileBehavior === 'resizable' && isMobileResizable && orientation === 'horizontal'
      ? 'vertical'
      : orientation;

  // Persist
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try { window.localStorage.setItem(storageKey, String(ratio)); } catch { /* noop */ }
  }, [ratio, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobileResizable(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return;

    const checkSize = () => {
      if (skipAutoCollapseRef.current) {
        skipAutoCollapseRef.current = false;
        return;
      }
      const rect = el.getBoundingClientRect();
      const total = effectiveOrientation === 'horizontal' ? rect.width : rect.height;
      if (!total) return;
      const canAutoCollapse = total >= collapseFirstBelow + collapseSecondBelow + RESIZER_PX;
      if (!canAutoCollapse) return;
      const firstSize = total * ratio - RESIZER_PX;
      const secondSize = total * (1 - ratio) - RESIZER_PX;
      if (firstState === 'open' && firstSize < collapseFirstBelow && secondState === 'open') {
        setSecondState('open');
        setFirstState('closed');
      } else if (secondState === 'open' && secondSize < collapseSecondBelow && firstState === 'open') {
        setFirstState('open');
        setSecondState('closed');
      }
    };

    checkSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(checkSize);
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [collapseFirstBelow, collapseSecondBelow, effectiveOrientation, firstState, ratio, secondState]);

  const onResizerPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture?.(e.pointerId);
    capturedResizerPointerRef.current = { element: target, pointerId: e.pointerId };
    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    const total = effectiveOrientation === 'horizontal' ? rect?.width : rect?.height;
    const firstSize = total ? Math.max(collapsedFirstSize, total * ratio - RESIZER_PX) : collapsedFirstSize;
    const secondSize = total ? Math.max(collapsedSecondSize, total * (1 - ratio) - RESIZER_PX) : collapsedSecondSize;
    dragStartRef.current = {
      pos: effectiveOrientation === 'horizontal' ? e.clientX : e.clientY,
      firstSize: firstState === 'open' ? firstSize : collapsedFirstSize,
      secondSize: secondState === 'open' ? secondSize : collapsedSecondSize,
      firstState,
      secondState,
    };
    setDragging(true);
  }, [collapsedFirstSize, collapsedSecondSize, effectiveOrientation, firstState, ratio, secondState]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (ev: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = effectiveOrientation === 'horizontal' ? rect.width : rect.height;
      if (!total) return;

      const pointerPos = effectiveOrientation === 'horizontal' ? ev.clientX : ev.clientY;
      const start = dragStartRef.current;
      if (start?.firstState === 'closed') {
        const deltaToOpen = pointerPos - start.pos;
        if (deltaToOpen > REOPEN_DELTA) {
          const openFirst = Math.max(collapseFirstBelow, collapsedFirstSize + deltaToOpen);
          const nextRatio = Math.max(minRatio, Math.min(maxRatio, (openFirst + RESIZER_PX) / total));
          setRatio(nextRatio);
          setFirstState('open');
          dragStartRef.current = { ...start, pos: pointerPos, firstSize: openFirst, firstState: 'open' };
        }
        return;
      }

      if (start?.secondState === 'closed') {
        const deltaToOpen = start.pos - pointerPos;
        if (deltaToOpen > REOPEN_DELTA) {
          const openSecond = Math.max(collapseSecondBelow, collapsedSecondSize + deltaToOpen);
          const nextRatio = Math.max(minRatio, Math.min(maxRatio, 1 - (openSecond + RESIZER_PX) / total));
          setRatio(nextRatio);
          setSecondState('open');
          dragStartRef.current = { ...start, pos: pointerPos, secondSize: openSecond, secondState: 'open' };
        }
        return;
      }

      const rawRatio = effectiveOrientation === 'horizontal'
        ? (ev.clientX - rect.left) / rect.width
        : (ev.clientY - rect.top) / rect.height;
      let r = rawRatio;
      r = Math.max(minRatio, Math.min(maxRatio, r));
      const firstSize = total * r - RESIZER_PX;
      const secondSize = total * (1 - r) - RESIZER_PX;
      if (rawRatio <= minRatio || firstSize < collapseFirstBelow) {
        setSecondState('open');
        setFirstState('closed');
      } else if (rawRatio >= maxRatio || secondSize < collapseSecondBelow) {
        setFirstState('open');
        setSecondState('closed');
      } else {
        setFirstState('open');
        setSecondState('open');
        setRatio(r);
      }
    };
    const onUp = () => {
      const captured = capturedResizerPointerRef.current;
      if (captured?.element.hasPointerCapture?.(captured.pointerId)) {
        captured.element.releasePointerCapture?.(captured.pointerId);
      }
      capturedResizerPointerRef.current = null;
      dragStartRef.current = null;
      setDragging(false);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = effectiveOrientation === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = '';
    };
  }, [dragging, effectiveOrientation, minRatio, maxRatio, collapseFirstBelow, collapseSecondBelow, collapsedFirstSize, collapsedSecondSize]);

  const onResizerKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 0.05;
    const dec = effectiveOrientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const inc = effectiveOrientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSecondState(state => state === 'open' ? 'closed' : 'open');
      setFirstState('open');
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setSecondState('open');
      setRatio(minRatio);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setSecondState('closed');
      return;
    }
    if (e.key === dec) { e.preventDefault(); setRatio(r => Math.max(minRatio, r - step)); }
    if (e.key === inc) { e.preventDefault(); setRatio(r => Math.min(maxRatio, r + step)); }
  }, [effectiveOrientation, minRatio, maxRatio]);

  const collapseFirst = useCallback(() => {
    setSecondState('open');
    setFirstState('closed');
  }, []);

  const collapseSecond = useCallback(() => {
    setFirstState('open');
    setSecondState('closed');
  }, []);

  const pct = Math.round(ratio * 10000) / 100;
  const firstStyle: React.CSSProperties = firstState === 'closed'
    ? effectiveOrientation === 'horizontal'
      ? { width: collapsedFirstSize, flex: 'none' }
      : { height: collapsedFirstSize, flex: 'none' }
    : secondState === 'closed'
    ? { flex: '1 1 0' }
    : effectiveOrientation === 'horizontal'
    ? { width: `${pct}%`, flex: 'none' }
    : { height: `${pct}%`, flex: 'none' };
  const secondStyle: React.CSSProperties = secondState === 'closed'
    ? effectiveOrientation === 'horizontal'
      ? { width: collapsedSecondSize, flex: 'none' }
      : { height: collapsedSecondSize, flex: 'none' }
    : firstState === 'closed'
    ? { flex: '1 1 0' }
    : { flex: '1 1 0' };

  const reopenFirst = useCallback(() => {
    const el = containerRef.current;
    skipAutoCollapseRef.current = true;
    if (el) {
      const rect = el.getBoundingClientRect();
      const total = effectiveOrientation === 'horizontal' ? rect.width : rect.height;
      if (total) {
        const desiredFirst = Math.max(collapseFirstBelow + REOPEN_DELTA, collapsedFirstSize + REOPEN_DELTA);
        const maxFirst = Math.max(collapsedFirstSize, total - collapseSecondBelow - RESIZER_PX);
        const targetFirst = Math.min(total * maxRatio - RESIZER_PX, maxFirst, desiredFirst);
        const nextRatio = Math.max(minRatio, Math.min(maxRatio, (targetFirst + RESIZER_PX) / total));
        setRatio(nextRatio);
      }
    }
    setFirstState('open');
    setSecondState('open');
  }, [collapseFirstBelow, collapsedFirstSize, effectiveOrientation, maxRatio, minRatio]);

  const reopenSecond = useCallback(() => {
    const el = containerRef.current;
    skipAutoCollapseRef.current = true;
    if (el) {
      const rect = el.getBoundingClientRect();
      const total = effectiveOrientation === 'horizontal' ? rect.width : rect.height;
      if (total) {
        const desiredSecond = Math.max(collapseSecondBelow + REOPEN_DELTA, collapsedSecondSize + REOPEN_DELTA);
        const maxSecond = Math.max(collapsedSecondSize, total - collapseFirstBelow - RESIZER_PX);
        const targetSecond = Math.min(total * (1 - minRatio) - RESIZER_PX, maxSecond, desiredSecond);
        const nextRatio = Math.max(minRatio, Math.min(maxRatio, 1 - (targetSecond + RESIZER_PX) / total));
        setRatio(nextRatio);
      }
    }
    setFirstState('open');
    setSecondState('open');
  }, [collapseSecondBelow, collapsedSecondSize, effectiveOrientation, maxRatio, minRatio]);

  return (
    <div
      ref={containerRef}
      className={`split-panel ${resolvedMobileBehavior === 'drawer' ? 'mobile-drawer' : 'mobile-resizable'}`}
      data-orientation={effectiveOrientation}
      data-base-orientation={orientation}
      data-first-state={firstState}
      data-second-state={secondState}
      data-mobile-second-open={mobileSecondOpen ? 'true' : undefined}
    >
      <div className={`split-panel-pane${firstState === 'closed' ? ' is-collapsed' : ''}`} style={firstStyle}>
        {firstLabel && (
          <div className="split-panel-pane-eyebrow">
            <span>{firstLabel}</span>
            <button
              type="button"
              className="split-panel-pane-collapse"
              onClick={collapseFirst}
              aria-label={`Collapse ${firstLabel}`}
            >
              ‹
            </button>
          </div>
        )}
        <div className="split-panel-pane-body">{first}</div>
        <button
          type="button"
          className="split-panel-book-gutter is-first"
          onClick={reopenFirst}
          aria-label={`Open ${firstLabel || 'context'}`}
        >
          <span className="split-panel-book-icon" aria-hidden="true">▦</span>
          <span className="split-panel-book-label">{firstLabel || 'Context'}</span>
        </button>
      </div>
      <div
        className={`split-panel-resizer${dragging ? ' dragging' : ''}`}
        role="separator"
        aria-orientation={effectiveOrientation === 'horizontal' ? 'vertical' : 'horizontal'}
        aria-valuenow={pct}
        aria-valuemin={minRatio * 100}
        aria-valuemax={maxRatio * 100}
        tabIndex={0}
        onPointerDown={onResizerPointerDown}
        onKeyDown={onResizerKeyDown}
      >
        <span className="split-panel-resizer-grip" />
      </div>
      <div className={`split-panel-pane${secondState === 'closed' ? ' is-collapsed' : ''}`} style={secondStyle}>
        {secondLabel && (
          <div className="split-panel-pane-eyebrow">
            <span>{secondLabel}</span>
            <button
              type="button"
              className="split-panel-pane-collapse"
              onClick={collapseSecond}
              aria-label={`Collapse ${secondLabel}`}
            >
              ›
            </button>
            <button
              type="button"
              className="split-panel-mobile-close"
              onClick={() => setMobileSecondOpen(false)}
              aria-label={`Close ${secondLabel}`}
            >
              ×
            </button>
          </div>
        )}
        <div className="split-panel-pane-body">{second}</div>
        <button
          type="button"
          className="split-panel-book-gutter"
          onClick={reopenSecond}
          aria-label={`Open ${secondLabel || 'detail'}`}
        >
          <span className="split-panel-book-icon" aria-hidden="true">▦</span>
          <span className="split-panel-book-label">{secondLabel || 'Detail'}</span>
        </button>
      </div>
      {resolvedMobileBehavior === 'drawer' && (
        <>
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
        </>
      )}
    </div>
  );
};

export default SplitPanel;
