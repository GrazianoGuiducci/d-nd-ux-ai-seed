import React, { useEffect, useMemo, useRef, useState } from 'react';

export type MegaMenuSeedItem = {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  status?: string;
  href?: string;
};

export type MegaMenuSeedGroup = {
  id: string;
  title: string;
  summary?: string;
  items: MegaMenuSeedItem[];
};

export interface MegaMenuSeedProps {
  groups: MegaMenuSeedGroup[];
  activeId?: string;
  label?: string;
  align?: 'left' | 'right';
  className?: string;
  onSelect?: (item: MegaMenuSeedItem, group: MegaMenuSeedGroup) => void;
}

let megaMenuCssInjected = false;
const MEGA_MENU_CSS = `
.dnd-mega {
  position: relative;
  display: inline-flex;
  min-width: 0;
  z-index: 30;
}
.dnd-mega-trigger {
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  background: rgb(var(--elev-01, 15 18 25) / 0.84);
  color: var(--c-primary-text, rgb(103 232 249));
  padding: 0 0.75rem;
  cursor: pointer;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.dnd-mega-trigger:hover,
.dnd-mega-trigger:focus-visible,
.dnd-mega[data-open="true"] .dnd-mega-trigger {
  outline: none;
  border-color: var(--c-primary-border-hover, rgb(34 211 238 / 0.48));
  background: var(--c-primary-bg, rgb(8 145 178 / 0.16));
}
.dnd-mega-trigger-mark {
  display: grid;
  width: 1rem;
  gap: 0.18rem;
}
.dnd-mega-trigger-mark span {
  display: block;
  height: 1px;
  width: 100%;
  background: currentColor;
}
.dnd-mega-panel {
  position: absolute;
  top: calc(100% + 0.55rem);
  left: 0;
  width: min(62rem, calc(100vw - 3rem));
  max-height: min(32rem, calc(100dvh - 7rem));
  overflow: auto;
  padding: 1rem;
  border: 1px solid rgb(var(--border-02, 255 255 255 / 0.16));
  border-radius: 10px;
  background:
    radial-gradient(circle at 72% 22%, rgb(34 211 238 / 0.08), transparent 17rem),
    radial-gradient(circle at 88% 18%, rgb(250 204 21 / 0.08), transparent 15rem),
    rgb(var(--elev-01, 15 18 25) / 0.96);
  box-shadow: 0 24px 70px rgb(0 0 0 / 0.48);
  backdrop-filter: blur(18px);
  scrollbar-width: none;
}
.dnd-mega-panel::-webkit-scrollbar {
  display: none;
}
.dnd-mega[data-align="right"] .dnd-mega-panel {
  left: auto;
  right: 0;
}
.dnd-mega-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(12rem, 1fr));
  gap: 0.8rem;
}
.dnd-mega-group {
  min-width: 0;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
  border-radius: 8px;
  background: rgb(var(--elev-00, 7 9 13) / 0.5);
  overflow: hidden;
}
.dnd-mega-group-head {
  padding: 0.75rem;
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.09));
}
.dnd-mega-group-title {
  margin: 0;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-primary-text, rgb(103 232 249));
}
.dnd-mega-group-summary {
  margin: 0.35rem 0 0;
  color: rgb(var(--text-muted, 147 158 176));
  font-size: 0.78rem;
  line-height: 1.35;
}
.dnd-mega-items {
  display: grid;
  gap: 0.3rem;
  padding: 0.5rem;
}
.dnd-mega-item {
  min-width: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: start;
  border: 1px solid transparent;
  background: transparent;
  color: rgb(var(--text-02, 205 213 225));
  padding: 0.62rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  border-radius: 6px;
}
.dnd-mega-item:hover,
.dnd-mega-item:focus-visible,
.dnd-mega-item.is-active {
  outline: none;
  border-color: var(--c-primary-border-hover, rgb(34 211 238 / 0.48));
  background: var(--c-primary-bg, rgb(8 145 178 / 0.16));
}
.dnd-mega-item-label,
.dnd-mega-item-description {
  display: block;
  min-width: 0;
}
.dnd-mega-item-label {
  color: rgb(var(--text-01, 244 247 251));
  font-weight: 700;
  line-height: 1.2;
}
.dnd-mega-item-description {
  margin-top: 0.28rem;
  color: rgb(var(--text-muted, 147 158 176));
  font-size: 0.78rem;
  line-height: 1.34;
}
.dnd-mega-item-status,
.dnd-mega-item-meta {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.62rem;
  color: rgb(196 181 253);
  text-transform: uppercase;
}
.dnd-mega-item-meta {
  grid-column: 1 / -1;
  color: rgb(var(--text-muted, 147 158 176));
  text-transform: none;
}
@media (max-width: 820px) {
  .dnd-mega-trigger {
    width: 2.45rem;
    min-height: 2.25rem;
    padding: 0;
  }
  .dnd-mega-trigger-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .dnd-mega-panel {
    left: 0;
    right: auto;
    width: min(26rem, calc(100vw - 1.25rem));
    max-height: 68dvh;
    scrollbar-width: none;
  }
  .dnd-mega-panel::-webkit-scrollbar {
    display: none;
  }
  .dnd-mega[data-align="right"] .dnd-mega-panel {
    left: auto;
    right: 0;
  }
  .dnd-mega-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;

function injectMegaMenuCss() {
  if (megaMenuCssInjected || typeof document === 'undefined') return;
  if (document.getElementById('dnd-mega-menu-seed-css')) {
    megaMenuCssInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = 'dnd-mega-menu-seed-css';
  style.textContent = MEGA_MENU_CSS;
  document.head.appendChild(style);
  megaMenuCssInjected = true;
}

export const MegaMenuSeed: React.FC<MegaMenuSeedProps> = ({
  groups,
  activeId,
  label = 'Menu',
  align = 'left',
  className,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemCount = useMemo(() => groups.reduce((sum, group) => sum + group.items.length, 0), [groups]);

  useEffect(() => { injectMegaMenuCss(); }, []);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`dnd-mega${className ? ` ${className}` : ''}`}
      data-open={open ? 'true' : 'false'}
      data-align={align}
    >
      <button
        type="button"
        className="dnd-mega-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="dnd-mega-trigger-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="dnd-mega-trigger-label">{label}</span>
      </button>

      {open && (
        <div className="dnd-mega-panel" role="menu" aria-label={`${label}: ${itemCount} items`}>
          <div className="dnd-mega-grid">
            {groups.map(group => (
              <section key={group.id} className="dnd-mega-group">
                <div className="dnd-mega-group-head">
                  <p className="dnd-mega-group-title">{group.title}</p>
                  {group.summary && <p className="dnd-mega-group-summary">{group.summary}</p>}
                </div>
                <div className="dnd-mega-items">
                  {group.items.map(item => {
                    const isActive = item.id === activeId;
                    const content = (
                      <>
                        <span>
                          <span className="dnd-mega-item-label">{item.label}</span>
                          {item.description && <span className="dnd-mega-item-description">{item.description}</span>}
                        </span>
                        {item.status && <span className="dnd-mega-item-status">{item.status}</span>}
                        {item.meta && <span className="dnd-mega-item-meta">{item.meta}</span>}
                      </>
                    );
                    if (item.href && !onSelect) {
                      return (
                        <a
                          key={item.id}
                          className={`dnd-mega-item${isActive ? ' is-active' : ''}`}
                          href={item.href}
                          role="menuitem"
                        >
                          {content}
                        </a>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`dnd-mega-item${isActive ? ' is-active' : ''}`}
                        role="menuitem"
                        onClick={() => {
                          onSelect?.(item, group);
                          setOpen(false);
                        }}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenuSeed;
