import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import HoverPopover from './ui/HoverPopover';

// Render inline helper — mantiene il vecchio shape closedTooltip
// (title/body/link/related/funnelHook) dentro il primitivo HoverPopover.
function renderClosedTooltipContent(tip: NonNullable<SidebarContent['closedTooltip']>): React.ReactNode {
  return (
    <>
      {tip.title && <span className="tp-title">{tip.title}</span>}
      {tip.body && <div className="tp-body">{tip.body}</div>}
      {tip.link && <a href={tip.link.href} className="tp-link">{tip.link.label} →</a>}
      {tip.related && tip.related.length > 0 && (
        <div className="tp-related">
          {tip.related.map((r, i) =>
            r.href ? <a key={i} href={r.href}>→ {r.label}</a> : <span key={i}>· {r.label}</span>
          )}
        </div>
      )}
      {tip.funnelHook && (
        <div className="tp-funnel">
          <a href={tip.funnelHook.href}>{tip.funnelHook.label} →</a>
        </div>
      )}
    </>
  );
}

/**
 * Shell3Col v3 — shell a 3 colonne allineato al pattern
 * design-playground.html data-type="single": solo 2 stati open ↔ closed,
 * closed mostra un gutter 44px con icon + label verticale, intero gutter
 * cliccabile per riaprire. Drag del resizer verso il centro riapre.
 *
 * Tooltip rich via portal al body (position: fixed) — evita clipping
 * da ancestor overflow.
 *
 * Fonte del pattern: /opt/d-nd_com/public/design-playground.html §APPLAYOUT
 * (use-note: "data-type='single' (Oggi · destra): open ↔ closed (44px
 *  gutter 'a libro'). Gutter intera colonna cliccabile → riapre.").
 */

type ColState = 'open' | 'closed';

interface SidebarContent {
  body: ReactNode;
  /** Icona per il gutter (closed). Default: libro aperto. */
  closedIcon?: ReactNode;
  /** Tooltip rich mostrato on-hover sul gutter o sul titolo (portal body).
   *  Descrizione, logica sottostante, link diretto al contenuto completo,
   *  pagine correlate (grafo tassonomico), funnel hook (ricerca). */
  closedTooltip?: {
    title?: string;
    body?: ReactNode;
    link?: { label: string; href: string };
    related?: Array<{ label: string; href?: string }>;
    funnelHook?: { label: string; href: string };
  };
}

interface Shell3ColProps {
  left: ReactNode | SidebarContent;
  main: ReactNode;
  right: ReactNode | SidebarContent;
  leftStorage?: string;
  rightStorage?: string;
  defaultLeft?: ColState;
  defaultRight?: ColState;
  minHeight?: string | number;
  leftTitle?: string;
  rightTitle?: string;
  leftOpenWidth?: number;
  rightOpenWidth?: number;
  minOpenWidth?: number;
  maxOpenWidth?: number;
  /** flat: rimuove border + border-radius outer (pattern workspace tecnico
   *  a tutta larghezza, senza card-container). */
  flat?: boolean;
}

const GUTTER_W = 44;
const RESIZER_W = 16;
const DRAG_REOPEN_THRESHOLD = 60;
const AUTO_CLOSE_UNDER = 180;
const KEYBOARD_RESIZE_STEP = 24;

function isSidebarContent(x: ReactNode | SidebarContent): x is SidebarContent {
  return !!x && typeof x === 'object' && !React.isValidElement(x) && 'body' in (x as any);
}

function readState(key: string | undefined, fallback: ColState): ColState {
  if (!key || typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(`${key}_state`);
    if (saved === 'open' || saved === 'closed') return saved;
  } catch { /* noop */ }
  return fallback;
}

function readWidth(key: string | undefined, fallback: number): number {
  if (!key || typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(`${key}_w`);
    if (saved) {
      const n = parseInt(saved, 10);
      if (!isNaN(n) && n >= 160 && n <= 600) return n;
    }
  } catch { /* noop */ }
  return fallback;
}

function widthFor(state: ColState, manualW: number): number {
  return state === 'open' ? manualW : GUTTER_W;
}

const SHELL_CSS = `
.s3c-shell {
  display: flex;
  flex-direction: column;
  border-radius: 0.875rem;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.07));
  background: rgb(var(--elev-01, 16 16 22));
  overflow: hidden;
  min-height: 0;
}
/* Flat variant — workspace a tutta larghezza, nessuna card-container.
   Le 3 colonne vivono piatte come un dashboard tecnico; separatori
   verticali tra aside e main restano (gestiti da .s3c-side-*).
   Riempie il parent flex (viewport-fit): niente scroll sul canvas centrale. */
.s3c-shell.s3c-flat {
  border-radius: 0;
  border: none;
  background: transparent;
  flex: 1 1 auto;
  height: 100%;
}
.s3c-body {
  display: grid;
  grid-template-columns: var(--s3c-left-w) ${RESIZER_W}px minmax(0, 1fr) ${RESIZER_W}px var(--s3c-right-w);
  flex: 1;
  min-height: 0;
  overflow: hidden;
  transition: grid-template-columns 280ms cubic-bezier(0.4, 0, 0.2, 1);
}
.s3c-body.dragging { transition: none; }

.s3c-side {
  display: flex; flex-direction: column; min-width: 0; overflow: hidden;
  background: rgb(var(--elev-01, 16 16 22) / 0.6);
}
.s3c-side-left { border-right: 1px solid rgb(var(--border-01, 255 255 255 / 0.07)); }
.s3c-side-right { border-left: 1px solid rgb(var(--border-01, 255 255 255 / 0.07)); }

.s3c-sb-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.75rem;
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.07));
  background: rgb(var(--elev-02, 24 24 32) / 0.4);
  min-height: 44px; flex-shrink: 0;
}
.s3c-sb-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgb(var(--text-muted, 170 175 190));
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
}
.s3c-shell[data-left-state="closed"] .s3c-side-left .s3c-sb-header,
.s3c-shell[data-right-state="closed"] .s3c-side-right .s3c-sb-header { display: none; }

.s3c-collapse-btn {
  width: 28px; height: 28px; flex-shrink: 0;
  border-radius: 0.375rem; background: transparent;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.07));
  color: rgb(var(--text-muted, 170 175 190));
  cursor: pointer; font: inherit;
  display: flex; align-items: center; justify-content: center;
  transition: all 220ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
.s3c-collapse-btn:hover {
  background: rgb(var(--elev-03, 34 34 44));
  color: var(--c-primary-text, rgb(103 232 249));
  border-color: rgb(var(--border-02, 255 255 255 / 0.12));
}
.s3c-collapse-btn:focus-visible { outline: 2px solid var(--c-primary-solid, rgb(34 211 238)); outline-offset: 1px; }

/* Body open */
.s3c-sb-body { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; display: none; }
.s3c-shell[data-left-state="open"] .s3c-side-left .s3c-sb-body,
.s3c-shell[data-right-state="open"] .s3c-side-right .s3c-sb-body { display: block; }

/* Gutter (closed) — pattern playground data-type="single":
   intera colonna cliccabile, icon 28x28 con border + label verticale */
.s3c-sb-gutter {
  display: none;
  flex-direction: column; align-items: center;
  padding: 0.75rem 0; flex: 1;
  gap: 0.75rem;
  cursor: pointer;
  background: transparent;
  border: 0; width: 100%;
  font: inherit; color: inherit;
  transition: background 220ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
.s3c-gutter-anchor {
  display: none !important;
  min-height: 0;
  align-self: stretch;
  width: 100%;
}
.s3c-gutter-anchor > .s3c-sb-gutter {
  height: 100%;
}
.s3c-shell[data-left-state="closed"] .s3c-side-left,
.s3c-shell[data-right-state="closed"] .s3c-side-right {
  position: relative;
}
.s3c-shell[data-left-state="closed"] .s3c-side-left .s3c-gutter-anchor,
.s3c-shell[data-right-state="closed"] .s3c-side-right .s3c-gutter-anchor {
  display: flex !important;
  flex: 1 1 auto;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.s3c-shell[data-left-state="closed"] .s3c-side-left .s3c-gutter-anchor > .s3c-sb-gutter,
.s3c-shell[data-right-state="closed"] .s3c-side-right .s3c-gutter-anchor > .s3c-sb-gutter {
  min-height: 100%;
}
.s3c-shell[data-left-state="closed"] .s3c-side-left .s3c-sb-gutter,
.s3c-shell[data-right-state="closed"] .s3c-side-right .s3c-sb-gutter { display: flex; }
.s3c-sb-gutter:hover { background: var(--c-primary-bg, rgb(6 58 78 / 0.35)); }
.s3c-sb-gutter:hover .s3c-gutter-icon {
  border-color: var(--c-primary-border-hover, rgb(34 211 238 / 0.5));
  color: var(--c-primary-text, rgb(103 232 249));
  background: rgb(var(--elev-02, 24 24 32));
}
.s3c-sb-gutter:hover .s3c-gutter-label { color: var(--c-primary-text, rgb(103 232 249)); }
.s3c-sb-gutter:focus-visible { outline: 2px solid var(--c-primary-solid, rgb(34 211 238)); outline-offset: -4px; }

.s3c-gutter-icon {
  width: 28px; height: 28px;
  border-radius: 0.375rem;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
  color: rgb(var(--text-muted, 170 175 190));
  transition: all 220ms cubic-bezier(0.25, 0.1, 0.25, 1);
  pointer-events: none;  /* parent .s3c-sb-gutter captures click */
  flex-shrink: 0;
}
.s3c-gutter-label {
  writing-mode: vertical-rl;
  background: transparent; border: 0;
  color: rgb(var(--text-muted, 170 175 190));
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase;
  padding: 0.75rem 0.25rem;
  border-radius: 0.375rem;
  transition: color 220ms cubic-bezier(0.25, 0.1, 0.25, 1);
  white-space: nowrap;
  pointer-events: none;
}

/* Resizer — attivo in tutti gli stati. In closed: drag verso il centro
   oltre DRAG_REOPEN_THRESHOLD riapre la sidebar. In open: sotto AUTO_CLOSE_UNDER
   auto-collapse a closed. */
.s3c-resizer {
  position: relative; cursor: col-resize; user-select: none;
  display: flex; align-items: center; justify-content: center;
  background: transparent; touch-action: none;
  transition: background 120ms ease;
}
.s3c-resizer:hover { background: var(--c-primary-bg, rgb(6 58 78 / 0.35)); }
.s3c-resizer .s3c-rz-line {
  width: 2px; height: 100%;
  background: rgb(var(--border-02, 255 255 255 / 0.12));
  transition: all 120ms ease;
}
.s3c-resizer:hover .s3c-rz-line,
.s3c-resizer.active .s3c-rz-line {
  background: var(--c-primary-solid, rgb(34 211 238));
  box-shadow: 0 0 10px var(--c-primary-ring, rgb(34 211 238 / 0.32));
}
.s3c-resizer .s3c-rz-grip {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 22px; height: 40px;
  border-radius: 9999px;
  background: rgb(var(--elev-03, 34 34 44));
  border: 1px solid rgb(var(--border-03, 255 255 255 / 0.22));
  display: flex; align-items: center; justify-content: center; gap: 2px;
  opacity: 0; pointer-events: none;
  transition: opacity 220ms ease;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.4);
}
.s3c-resizer:hover .s3c-rz-grip,
.s3c-resizer.active .s3c-rz-grip { opacity: 1; }
.s3c-resizer .s3c-rz-grip::before,
.s3c-resizer .s3c-rz-grip::after {
  content: ''; width: 2px; height: 16px;
  background: rgb(var(--text-muted, 170 175 190));
  border-radius: 1px;
}

.s3c-main { overflow: hidden; min-width: 0; display: flex; flex-direction: column; scrollbar-gutter: stable; }

/* ─── Tooltip portal (nel body · position: fixed, zero clipping) ─── */
.s3c-tip-portal {
  position: fixed;
  min-width: 260px;
  max-width: 340px;
  background: rgb(var(--elev-01, 16 16 22));
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.14));
  border-radius: 0.625rem;
  padding: 0.85rem 0.95rem;
  box-shadow: 0 12px 34px rgb(0 0 0 / 0.55);
  z-index: 9999;
  opacity: 0;
  transition: opacity 180ms cubic-bezier(0.25, 0.1, 0.25, 1);
  pointer-events: none;
  color: rgb(var(--text-body, 215 218 230));
  font-size: 0.875rem; line-height: 1.45;
  text-align: left;
}
.s3c-tip-portal.visible { opacity: 1; pointer-events: auto; }
.s3c-tip-portal .tp-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgb(var(--text-muted, 170 175 190));
  display: block; margin-bottom: 0.4rem;
}
.s3c-tip-portal .tp-body {
  font-size: 0.88rem; color: rgb(var(--text-primary, 241 245 249));
  line-height: 1.5; margin-bottom: 0.5rem;
}
.s3c-tip-portal .tp-link {
  display: inline-flex; align-items: baseline; gap: 0.3rem;
  color: var(--c-primary-text, rgb(103 232 249)); text-decoration: none;
  font-size: 0.82rem; font-weight: 500;
  padding-top: 0.5rem; padding-bottom: 0.2rem;
  border-top: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
  margin-bottom: 0.2rem;
}
.s3c-tip-portal .tp-link:hover { color: rgb(var(--text-primary, 241 245 249)); }
.s3c-tip-portal .tp-related {
  display: flex; flex-direction: column; gap: 0.3rem;
  padding-top: 0.45rem; margin-bottom: 0.45rem;
  border-top: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
}
.s3c-tip-portal .tp-related a, .s3c-tip-portal .tp-related span {
  font-size: 0.8rem; color: rgb(var(--text-muted, 170 175 190)); text-decoration: none;
}
.s3c-tip-portal .tp-related a { color: var(--c-primary-text, rgb(103 232 249)); }
.s3c-tip-portal .tp-related a:hover { color: rgb(var(--text-primary, 241 245 249)); }
.s3c-tip-portal .tp-funnel {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem; letter-spacing: 0.04em;
  padding-top: 0.45rem;
  border-top: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
  color: rgb(var(--text-muted, 170 175 190));
}
.s3c-tip-portal .tp-funnel a { color: var(--c-primary-text, rgb(103 232 249)); text-decoration: none; }
.s3c-tip-portal .tp-funnel a:hover { color: rgb(var(--text-primary, 241 245 249)); }

@media (max-width: 900px) {
  /* Su mobile il grid degrada a flex column: main occupa tutto, sidebar
     escono dal flusso e tornano come drawer overlay quando aperte. */
  .s3c-body { grid-template-columns: 1fr; display: flex; flex-direction: column; }
  .s3c-body > .s3c-resizer { display: none; }
  .s3c-body > .s3c-main {
    position: relative;
    z-index: 1;
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    background: transparent;
  }

  /* Sidebar in modalita drawer — fixed overlay laterale.
     Pattern dal design-playground (app-shell ctx-sidebar-mobile). */
  .s3c-body > .s3c-side {
    position: fixed;
    top: 0;
    bottom: 0;
    height: 100dvh;
    max-height: 100dvh;
    width: min(320px, 85vw);
    z-index: 90;
    background: rgb(var(--elev-01, 16 16 22));
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    transition: transform 360ms cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0;
  }
  .s3c-body > .s3c-side-left {
    left: 0;
    transform: translateX(-100%);
    visibility: hidden;
    pointer-events: none;
    border-right: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
  }
  .s3c-body > .s3c-side-right {
    right: 0;
    transform: translateX(100%);
    visibility: hidden;
    pointer-events: none;
    border-left: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
  }
  .s3c-shell[data-mobile-drawer="left"] .s3c-body > .s3c-side-left {
    transform: translateX(0);
    visibility: visible;
    pointer-events: auto;
  }
  .s3c-shell[data-mobile-drawer="right"] .s3c-body > .s3c-side-right {
    transform: translateX(0);
    visibility: visible;
    pointer-events: auto;
  }

  /* Dentro il drawer: body sempre visibile, gutter/collapse nascosti */
  .s3c-shell .s3c-body > .s3c-side .s3c-sb-body { display: block !important; }
  .s3c-shell .s3c-body > .s3c-side .s3c-sb-gutter { display: none !important; }
  .s3c-shell .s3c-body > .s3c-side .s3c-sb-header { display: flex !important; }
  .s3c-shell .s3c-body > .s3c-side .s3c-sb-body {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .s3c-shell .s3c-body > .s3c-side .s3c-sb-body::-webkit-scrollbar {
    display: none;
  }
  .s3c-shell .s3c-body > .s3c-side .s3c-gutter-anchor {
    position: static !important;
    display: none !important;
    height: auto !important;
  }

  /* Backdrop cliccabile per chiudere */
  .s3c-mobile-backdrop {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 85;
    opacity: 0; pointer-events: none;
    transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .s3c-shell[data-mobile-drawer] .s3c-mobile-backdrop {
    opacity: 1; pointer-events: auto;
  }

  /* Peek edge buttons — trigger fisso sui bordi del main per aprire i drawer.
     Appaiono solo su mobile quando il drawer non e aperto (backdrop off). */
  .s3c-peek {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 70;
    width: 28px;
    height: 72px;
    padding: 0;
    background: rgb(var(--elev-02, 24 24 32) / 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid rgb(var(--border-02, 255 255 255 / 0.12));
    color: rgb(var(--text-body, 226 230 240));
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    font-family: inherit;
    transition: all 220ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .s3c-peek-left {
    left: 0;
    border-left: none;
    border-radius: 0 10px 10px 0;
  }
  .s3c-peek-right {
    right: 0;
    border-right: none;
    border-radius: 10px 0 0 10px;
  }
  .s3c-peek:hover { background: rgb(var(--elev-03, 34 34 44)); }
  .s3c-shell[data-mobile-drawer] .s3c-peek { opacity: 0; pointer-events: none; }

  /* Close button — visibile dentro il drawer header su mobile */
  .s3c-mobile-close {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    border-radius: 0.375rem;
    background: transparent;
    border: 1px solid rgb(var(--border-01, 255 255 255 / 0.07));
    color: rgb(var(--text-muted, 170 175 190));
    cursor: pointer; font: inherit; font-size: 16px;
    margin-left: auto;
  }
  .s3c-mobile-close:hover {
    background: rgb(var(--elev-03, 34 34 44));
    color: var(--c-primary-text, rgb(103 232 249));
  }
}

/* Peek button visibili solo su mobile/narrow browser (display: none by default) */
.s3c-peek { display: none; }
.s3c-mobile-close { display: none; }
@media (max-width: 900px) {
  .s3c-peek { display: flex; }
  /* Swap collapse-btn (chiude il drawer desktop) con mobile-close (× drawer) */
  .s3c-shell .s3c-body > .s3c-side .s3c-collapse-btn { display: none !important; }
  .s3c-shell .s3c-body > .s3c-side .s3c-mobile-close { display: flex !important; }
}
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  const id = 'shell3col-css';
  if (document.getElementById(id)) { cssInjected = true; return; }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = SHELL_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

// Nota: TipPortal legacy rimosso — ora il tooltip del gutter closed usa
// il primitivo condiviso ui/HoverPopover (smart placement + hover-intent).

const Shell3Col: React.FC<Shell3ColProps> = ({
  left,
  main,
  right,
  leftStorage = 'shell3col_left',
  rightStorage = 'shell3col_right',
  defaultLeft = 'open' as ColState,
  defaultRight = 'open' as ColState,
  minHeight = '600px',
  leftTitle = 'Contesto',
  rightTitle = 'Dettaglio',
  leftOpenWidth = 260,
  rightOpenWidth = 300,
  minOpenWidth = 180,
  maxOpenWidth = 480,
  flat = false,
}) => {
  useEffect(() => { injectCSS(); }, []);

  const [leftState, setLeftState] = useState<ColState>(() => readState(leftStorage, defaultLeft));
  const [rightState, setRightState] = useState<ColState>(() => readState(rightStorage, defaultRight));
  const [leftManualW, setLeftManualW] = useState<number>(() => readWidth(leftStorage, leftOpenWidth));
  const [rightManualW, setRightManualW] = useState<number>(() => readWidth(rightStorage, rightOpenWidth));
  const [dragging, setDragging] = useState<null | 'left' | 'right'>(null);
  const mobileOverflowRef = useRef<string | null>(null);

  // Mobile drawer state — quale drawer è aperto come overlay (solo narrow/mobile).
  // null = nessuno (main libero con 2 peek edge button visibili).
  const [mobileDrawer, setMobileDrawer] = useState<null | 'left' | 'right'>(null);

  // ESC chiude il drawer; lock body scroll quando aperto
  useEffect(() => {
    if (!mobileDrawer) {
      if (mobileOverflowRef.current !== null) {
        document.body.style.overflow = mobileOverflowRef.current;
        mobileOverflowRef.current = null;
      }
      return;
    }
    if (mobileOverflowRef.current === null) mobileOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileDrawer(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (mobileOverflowRef.current !== null) {
        document.body.style.overflow = mobileOverflowRef.current;
        mobileOverflowRef.current = null;
      }
    };
  }, [mobileDrawer]);

  // Contenuto del main puo richiedere apertura drawer (es. click su nodo):
  // ascolta custom event 'shell3col:open-mobile-drawer' con detail 'left'|'right'.
  // Apre solo su mobile/narrow: su desktop le sidebar sono gia visibili.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const side = (e as CustomEvent<'left' | 'right'>).detail;
      if (side !== 'left' && side !== 'right') return;
      if (window.matchMedia('(max-width: 900px)').matches) {
        setMobileDrawer(side);
      }
    };
    window.addEventListener('shell3col:open-mobile-drawer', onOpen);
    return () => window.removeEventListener('shell3col:open-mobile-drawer', onOpen);
  }, []);

  // Tooltip state — dismantled: gestito ora da HoverPopover sul gutter (vedi render).

  // Persist
  useEffect(() => { if (leftStorage) try { window.localStorage.setItem(`${leftStorage}_state`, leftState); } catch { /* */ } }, [leftState, leftStorage]);
  useEffect(() => { if (rightStorage) try { window.localStorage.setItem(`${rightStorage}_state`, rightState); } catch { /* */ } }, [rightState, rightStorage]);
  useEffect(() => { if (leftStorage) try { window.localStorage.setItem(`${leftStorage}_w`, String(leftManualW)); } catch { /* */ } }, [leftManualW, leftStorage]);
  useEffect(() => { if (rightStorage) try { window.localStorage.setItem(`${rightStorage}_w`, String(rightManualW)); } catch { /* */ } }, [rightManualW, rightStorage]);

  // Drag resize — in closed: drag toward center past threshold riapre (to open).
  // In open: sotto AUTO_CLOSE_UNDER snap a closed.
  const dragStartRef = useRef<{ x: number; startW: number; side: 'left' | 'right'; startState: ColState } | null>(null);

  const onResizerPointerDown = useCallback((side: 'left' | 'right') => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const startState = side === 'left' ? leftState : rightState;
    const currentW = widthFor(startState, side === 'left' ? leftManualW : rightManualW);
    dragStartRef.current = { x: e.clientX, startW: currentW, side, startState };
    setDragging(side);
  }, [leftState, rightState, leftManualW, rightManualW]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (ev: PointerEvent) => {
      const d = dragStartRef.current;
      if (!d) return;
      const delta = d.side === 'left' ? (ev.clientX - d.x) : (d.x - ev.clientX);
      const newW = d.startW + delta;

      if (d.startState === 'closed') {
        if (newW >= DRAG_REOPEN_THRESHOLD + GUTTER_W) {
          const openW = Math.max(minOpenWidth, Math.min(maxOpenWidth, newW));
          if (d.side === 'left') { setLeftState('open'); setLeftManualW(openW); }
          else { setRightState('open'); setRightManualW(openW); }
          dragStartRef.current = { x: ev.clientX, startW: openW, side: d.side, startState: 'open' };
        }
      } else {
        if (newW < AUTO_CLOSE_UNDER) {
          if (d.side === 'left') setLeftState('closed'); else setRightState('closed');
          dragStartRef.current = { ...d, startState: 'closed', startW: GUTTER_W };
        } else {
          const clamped = Math.max(minOpenWidth, Math.min(maxOpenWidth, newW));
          if (d.side === 'left') setLeftManualW(clamped); else setRightManualW(clamped);
        }
      }
    };
    const stop = () => setDragging(null);
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setDragging(null); };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('blur', stop);
    window.addEventListener('keydown', onKey);
    const prevSel = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('blur', stop);
      window.removeEventListener('keydown', onKey);
      document.body.style.userSelect = prevSel;
      document.body.style.cursor = '';
    };
  }, [dragging, minOpenWidth, maxOpenWidth]);

  const onResizerKeyDown = useCallback((side: 'left' | 'right') => (e: React.KeyboardEvent) => {
    const isLeft = side === 'left';
    const state = isLeft ? leftState : rightState;
    const setState = isLeft ? setLeftState : setRightState;
    const setWidth = isLeft ? setLeftManualW : setRightManualW;
    const currentWidth = isLeft ? leftManualW : rightManualW;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setState(state === 'open' ? 'closed' : 'open');
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      setState('closed');
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      setState('open');
      setWidth(maxOpenWidth);
      return;
    }

    const direction =
      e.key === 'ArrowRight'
        ? 1
        : e.key === 'ArrowLeft'
        ? -1
        : 0;

    if (!direction) return;
    e.preventDefault();
    const signedDelta = side === 'left' ? direction : -direction;
    const nextWidth = Math.max(minOpenWidth, Math.min(maxOpenWidth, currentWidth + signedDelta * KEYBOARD_RESIZE_STEP));
    setState('open');
    setWidth(nextWidth);
  }, [leftManualW, leftState, maxOpenWidth, minOpenWidth, rightManualW, rightState]);

  // Normalize content
  const leftContent: SidebarContent = isSidebarContent(left) ? left : { body: left };
  const rightContent: SidebarContent = isSidebarContent(right) ? right : { body: right };

  const leftW = widthFor(leftState, leftManualW);
  const rightW = widthFor(rightState, rightManualW);

  const DefaultBookIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" />
      <path d="M8 4h11a1 1 0 0 1 1 1v15" />
      <path d="M8 4v16" />
      <path d="M12 8h5M12 12h5M12 16h3" />
    </svg>
  );

  // Hover-intent + smart placement ora vivono in HoverPopover (primitivo
  // condiviso). Qui nessun timer manuale: basta wrappare il gutter button.

  return (
    <div
      className={`s3c-shell${flat ? ' s3c-flat' : ''}`}
      data-left-state={leftState}
      data-right-state={rightState}
      {...(mobileDrawer ? { 'data-mobile-drawer': mobileDrawer } : {})}
      style={{
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        ['--s3c-left-w' as any]: `${leftW}px`,
        ['--s3c-right-w' as any]: `${rightW}px`,
      }}
    >
      <div className={`s3c-body ${dragging ? 'dragging' : ''}`}>
        {/* LEFT SIDEBAR */}
        <aside className="s3c-side s3c-side-left">
          <div className="s3c-sb-header">
            <span className="s3c-sb-title">{leftTitle}</span>
            <button
              className="s3c-collapse-btn"
              onClick={() => setLeftState('closed')}
              title={`Chiudi ${leftTitle}`}
              aria-label={`Close ${leftTitle}`}
            >‹</button>
            <button
              className="s3c-mobile-close"
              onClick={() => setMobileDrawer(null)}
              aria-label={`Chiudi ${leftTitle}`}
            >×</button>
          </div>
          <div className="s3c-sb-body">{leftContent.body}</div>
          <HoverPopover
            enabled={leftState === 'closed' && !!leftContent.closedTooltip}
            placement="right"
            anchorClassName="s3c-gutter-anchor"
            content={leftContent.closedTooltip ? renderClosedTooltipContent(leftContent.closedTooltip) : null}
          >
            <button
              type="button"
              className="s3c-sb-gutter"
              onClick={() => setLeftState('open')}
              aria-label={`Riapri ${leftTitle}`}
            >
              <span className="s3c-gutter-icon">{leftContent.closedIcon || DefaultBookIcon}</span>
              <span className="s3c-gutter-label">{leftTitle}</span>
            </button>
          </HoverPopover>
        </aside>

        {/* LEFT RESIZER */}
        <div
          className={`s3c-resizer ${dragging === 'left' ? 'active' : ''}`}
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${leftTitle}`}
          aria-valuemin={minOpenWidth}
          aria-valuemax={maxOpenWidth}
          aria-valuenow={leftState === 'open' ? leftManualW : GUTTER_W}
          tabIndex={0}
          onPointerDown={onResizerPointerDown('left')}
          onKeyDown={onResizerKeyDown('left')}
        >
          <span className="s3c-rz-line" />
          <span className="s3c-rz-grip" />
        </div>

        {/* MAIN */}
        <main className="s3c-main">{main}</main>

        {/* RIGHT RESIZER */}
        <div
          className={`s3c-resizer ${dragging === 'right' ? 'active' : ''}`}
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${rightTitle}`}
          aria-valuemin={minOpenWidth}
          aria-valuemax={maxOpenWidth}
          aria-valuenow={rightState === 'open' ? rightManualW : GUTTER_W}
          tabIndex={0}
          onPointerDown={onResizerPointerDown('right')}
          onKeyDown={onResizerKeyDown('right')}
        >
          <span className="s3c-rz-line" />
          <span className="s3c-rz-grip" />
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="s3c-side s3c-side-right">
          <div className="s3c-sb-header">
            <button
              className="s3c-mobile-close"
              onClick={() => setMobileDrawer(null)}
              aria-label={`Chiudi ${rightTitle}`}
              style={{ marginLeft: 0, marginRight: 'auto' }}
            >×</button>
            <button
              className="s3c-collapse-btn"
              onClick={() => setRightState('closed')}
              title={`Chiudi ${rightTitle}`}
              aria-label={`Close ${rightTitle}`}
            >›</button>
            <span className="s3c-sb-title">{rightTitle}</span>
          </div>
          <div className="s3c-sb-body">{rightContent.body}</div>
          <HoverPopover
            enabled={rightState === 'closed' && !!rightContent.closedTooltip}
            placement="left"
            anchorClassName="s3c-gutter-anchor"
            content={rightContent.closedTooltip ? renderClosedTooltipContent(rightContent.closedTooltip) : null}
          >
            <button
              type="button"
              className="s3c-sb-gutter"
              onClick={() => setRightState('open')}
              aria-label={`Riapri ${rightTitle}`}
            >
              <span className="s3c-gutter-icon">{rightContent.closedIcon || DefaultBookIcon}</span>
              <span className="s3c-gutter-label">{rightTitle}</span>
            </button>
          </HoverPopover>
        </aside>
      </div>

      {/* Mobile — peek edge buttons + backdrop (CSS only visibili < 640px).
          Pattern dal design-playground: tap peek → drawer slide in overlay. */}
      <button
        type="button"
        className="s3c-peek s3c-peek-left"
        onClick={() => setMobileDrawer('left')}
        aria-label={`Apri ${leftTitle}`}
      >‹</button>
      <button
        type="button"
        className="s3c-peek s3c-peek-right"
        onClick={() => setMobileDrawer('right')}
        aria-label={`Apri ${rightTitle}`}
      >›</button>
      <div className="s3c-mobile-backdrop" onClick={() => setMobileDrawer(null)} aria-hidden="true" />

      {/* Tooltip ora e wrappato su ciascun gutter con HoverPopover. */}
    </div>
  );
};

export default Shell3Col;
