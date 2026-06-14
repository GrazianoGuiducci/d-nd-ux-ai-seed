import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * HoverPopover — primitivo tooltip condiviso.
 *
 * Tre implementazioni duplicate (Shell3Col TipPortal, LabGraph StatTip,
 * Tooltip.tsx) sono state consolidate qui. Un solo componente = un solo
 * comportamento = un solo posto da sistemare.
 *
 * Caratteristiche:
 *  - Smart placement: sceglie auto il lato con piu spazio nel viewport
 *    (top/bottom/left/right) e flippa al bordo. Il popup converge sempre
 *    verso il centro del viewport rispetto all'anchor.
 *  - Hover-intent con delay (default 200ms close / 0 open).
 *  - Portal in document.body: zero clipping da overflow/transform ancestors.
 *  - pointer-events: auto sul popup (permette mouse-enter e click sui link
 *    interni — errore frequente: pointer-events:none blocca entrambi).
 *  - Mouse-enter sul popup cancella il close timer.
 *  - Scroll sul viewport → dismiss (evita popup "orfani" durante pan).
 *  - ESC → dismiss.
 *  - Keyboard friendly (focus/blur come enter/leave).
 *
 * Smart placement logic:
 *  - Stima popup size (maxW=320, maxH=280 default override via prop).
 *  - Calcola spaceTop/Bottom/Left/Right dall'anchor.
 *  - Se placement='auto': priorita bottom > top > right > left > (forza max).
 *  - Clamp coordinate in [gap, viewport - gap - popupSize].
 */

export type PopoverPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export interface HoverPopoverProps {
  /** Contenuto del tooltip (jsx libero). */
  content: ReactNode;
  /** Elemento anchor (viene wrappato da uno span per avere un bounding rect). */
  children: ReactNode;
  /** Placement preferito. 'auto' sceglie il lato con piu spazio. */
  placement?: PopoverPlacement;
  /** Gap tra anchor e popup (px). Default 8. */
  gap?: number;
  /** Max width stima usata per flipping decisions. Default 320. */
  estimatedWidth?: number;
  /** Max height stima usata per flipping decisions. Default 280. */
  estimatedHeight?: number;
  /** Open delay (ms). Default 0. */
  openDelay?: number;
  /** Close delay (ms). Default 200 — permette attraversamento anchor→popup. */
  closeDelay?: number;
  /** Classe extra da applicare al popup (oltre a .hover-popover). */
  className?: string;
  /** Disable il popover (anchor si comporta come normale contenuto). */
  enabled?: boolean;
  /** Classe extra per lo span anchor wrapper. */
  anchorClassName?: string;
  /** tabIndex dell'anchor (default 0 per keyboard a11y). */
  anchorTabIndex?: number;
  /** Dismiss on scroll globale. Default true. */
  dismissOnScroll?: boolean;
  /** aria-label per anchor (se il contenuto anchor non e testo semplice). */
  ariaLabel?: string;
}

interface Placement {
  side: 'top' | 'bottom' | 'left' | 'right';
  style: React.CSSProperties;
}

function computePlacement(
  anchor: DOMRect,
  preferred: PopoverPlacement,
  gap: number,
  popW: number,
  popH: number,
): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceTop = anchor.top;
  const spaceBottom = vh - anchor.bottom;
  const spaceLeft = anchor.left;
  const spaceRight = vw - anchor.right;

  // Auto: priorita alto/basso (leggibilita), fallback destra/sinistra.
  // Se nessun lato ha abbastanza spazio, sceglie quello con max disponibile.
  let side: Placement['side'];
  if (preferred !== 'auto') {
    side = preferred;
  } else {
    const candidates: Array<[Placement['side'], number, number]> = [
      ['bottom', spaceBottom, popH + gap],
      ['top', spaceTop, popH + gap],
      ['right', spaceRight, popW + gap],
      ['left', spaceLeft, popW + gap],
    ];
    const fit = candidates.find(([, space, need]) => space >= need);
    if (fit) side = fit[0];
    else {
      // Nessun side soddisfa → prendi il max
      candidates.sort((a, b) => b[1] - a[1]);
      side = candidates[0][0];
    }
  }

  // Flip: se il side scelto manualmente non ci sta, ribalta.
  if (preferred !== 'auto') {
    const fits = {
      top: spaceTop >= popH + gap,
      bottom: spaceBottom >= popH + gap,
      left: spaceLeft >= popW + gap,
      right: spaceRight >= popW + gap,
    };
    if (!fits[side]) {
      const flip: Record<Placement['side'], Placement['side']> = {
        top: 'bottom', bottom: 'top', left: 'right', right: 'left',
      };
      if (fits[flip[side]]) side = flip[side];
    }
  }

  // Computa coordinate + clamp nel viewport
  const style: React.CSSProperties = { position: 'fixed' };
  const edgePad = 12;

  if (side === 'top' || side === 'bottom') {
    // Allinea centro orizzontale dell'anchor, clamp viewport
    const anchorCenterX = anchor.left + anchor.width / 2;
    let left = anchorCenterX - popW / 2;
    left = Math.max(edgePad, Math.min(vw - popW - edgePad, left));
    style.left = left;
    if (side === 'top') style.top = anchor.top - gap;
    else style.top = anchor.bottom + gap;
    // transform: side=top vuole bottom del popup a anchor.top; usiamo translateY(-100%)
    if (side === 'top') style.transform = 'translateY(-100%)';
  } else {
    // left/right: allinea centro verticale anchor, clamp viewport
    const anchorCenterY = anchor.top + anchor.height / 2;
    let top = anchorCenterY - popH / 2;
    top = Math.max(edgePad, Math.min(vh - popH - edgePad, top));
    style.top = top;
    if (side === 'right') style.left = anchor.right + gap;
    else style.left = anchor.left - gap;
    if (side === 'left') style.transform = 'translateX(-100%)';
  }

  return { side, style };
}

let cssInjected = false;
const POPOVER_CSS = `
.hover-popover {
  min-width: 220px;
  max-width: 320px;
  background: rgb(var(--elev-01, 16 16 22));
  /* Dark theme: bordo visibile senza gridare. Precedente era 0.14 alpha
     (invisibile su nero). 0.32 + outline tenue = "presente ma discreto". */
  border: 1px solid rgba(255, 255, 255, 0.32);
  outline: 1px solid rgba(34, 211, 238, 0.10);
  outline-offset: -2px;
  border-radius: 0.625rem;
  padding: 0.85rem 0.95rem;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.6);
  z-index: 9999;
  color: rgb(var(--text-primary, 241 245 249));
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: normal;
  text-align: left;
  cursor: default;
  pointer-events: auto; /* CRITICO: permette mouse-enter + click su link interni */
  opacity: 0;
  animation: hoverPopoverFadeIn 180ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}
@keyframes hoverPopoverFadeIn { to { opacity: 1; } }
.hover-popover a {
  color: var(--c-primary-text, rgb(103, 232, 249));
  text-decoration: none;
}
.hover-popover a:hover { color: rgb(241, 245, 249); }
.hover-popover-anchor {
  display: inline;
  cursor: help;
}
.lab-tip-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(148, 163, 184);
  display: block;
  margin-bottom: 0.45rem;
}
.lab-tip-body {
  font-size: 0.88rem;
  color: rgb(241, 245, 249);
  line-height: 1.5;
  margin-bottom: 0.55rem;
}
.lab-tip-logic {
  font-size: 0.8rem;
  color: rgb(203, 213, 225);
  font-style: italic;
  padding-top: 0.5rem;
  margin-bottom: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.lab-tip-link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  color: rgb(103, 232, 249);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  padding-top: 0.5rem;
  padding-bottom: 0.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.2rem;
}
.lab-tip-link:hover { color: rgb(241, 245, 249); }
.lab-tip-related {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-top: 0.45rem;
  margin-bottom: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.lab-tip-related a, .lab-tip-related span {
  font-size: 0.8rem;
  color: rgb(148, 163, 184);
  text-decoration: none;
}
.lab-tip-related a { color: rgb(103, 232, 249); }
.lab-tip-related a:hover { color: rgb(241, 245, 249); }
.lab-tip-funnel {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: rgb(148, 163, 184);
}
.lab-tip-funnel a { color: rgb(103, 232, 249); text-decoration: none; }
.lab-tip-funnel a:hover { color: rgb(241, 245, 249); }
`;

function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  if (document.getElementById('hover-popover-css')) { cssInjected = true; return; }
  const style = document.createElement('style');
  style.id = 'hover-popover-css';
  style.textContent = POPOVER_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

export const HoverPopover: React.FC<HoverPopoverProps> = ({
  content,
  children,
  placement = 'auto' as PopoverPlacement,
  gap = 8,
  estimatedWidth = 320,
  estimatedHeight = 280,
  openDelay = 0,
  closeDelay = 200,
  className = '',
  enabled = true,
  anchorClassName = 'hover-popover-anchor',
  anchorTabIndex = 0,
  dismissOnScroll = true,
  ariaLabel,
}) => {
  useEffect(() => { injectCSS(); }, []);

  const anchorRef = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cancelTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    cancelTimers();
    if (!enabled) return;
    const open = () => {
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
    };
    if (openDelay <= 0) open();
    else openTimerRef.current = window.setTimeout(open, openDelay);
  }, [cancelTimers, enabled, openDelay]);

  const scheduleClose = useCallback(() => {
    cancelTimers();
    closeTimerRef.current = window.setTimeout(() => {
      setRect(null);
      closeTimerRef.current = null;
    }, closeDelay);
  }, [cancelTimers, closeDelay]);

  // Dismiss on scroll/esc — popup stale altrimenti
  useEffect(() => {
    if (!rect) return;
    const onScroll = () => setRect(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setRect(null); };
    if (dismissOnScroll) window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKey);
    return () => {
      if (dismissOnScroll) window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [rect, dismissOnScroll]);

  useEffect(() => () => cancelTimers(), [cancelTimers]);

  const placementResult = rect ? computePlacement(rect, placement, gap, estimatedWidth, estimatedHeight) : null;

  return (
    <>
      <span
        ref={anchorRef}
        className={anchorClassName}
        tabIndex={enabled ? anchorTabIndex : -1}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
        aria-label={ariaLabel}
      >
        {children}
      </span>
      {rect && placementResult && typeof document !== 'undefined' && createPortal(
        <div
          className={`hover-popover ${className}`}
          role="tooltip"
          data-side={placementResult.side}
          style={placementResult.style}
          onMouseEnter={cancelTimers}
          onMouseLeave={scheduleClose}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
};

export default HoverPopover;
