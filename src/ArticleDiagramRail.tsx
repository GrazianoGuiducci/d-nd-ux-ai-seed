import React from 'react';
import { agentOrientationAttributes } from './agentOrientation';

export type ArticleDiagramNodeKind =
  | 'source'
  | 'field'
  | 'question'
  | 'test'
  | 'direction'
  | 'result'
  | 'void';

export interface ArticleDiagramNode {
  id: string;
  label: string;
  body?: React.ReactNode;
  meta?: string;
  kind?: ArticleDiagramNodeKind;
  active?: boolean;
  href?: string;
  onSelect?: (node: ArticleDiagramNode) => void;
}

export interface ArticleDiagramRailProps {
  nodes: ArticleDiagramNode[];
  title?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  onSelect?: (node: ArticleDiagramNode) => void;
}

const KIND_CLASS: Record<ArticleDiagramNodeKind, string> = {
  source: 'adr-kind-source',
  field: 'adr-kind-field',
  question: 'adr-kind-question',
  test: 'adr-kind-test',
  direction: 'adr-kind-direction',
  result: 'adr-kind-result',
  void: 'adr-kind-void',
};

const ARTICLE_DIAGRAM_CSS = `
.adr {
  --adr-c-source: rgb(96 165 250);
  --adr-c-field: rgb(139 92 246);
  --adr-c-question: rgb(251 113 133);
  --adr-c-test: rgb(34 211 238);
  --adr-c-direction: rgb(74 222 128);
  --adr-c-result: rgb(250 204 21);
  --adr-c-void: rgb(148 163 184);
  color: rgb(var(--text-01, 241 245 249));
}
.adr-head {
  margin-bottom: 0.65rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(var(--text-muted, 170 175 190));
}
.adr-list {
  display: flex;
  gap: 0;
}
.adr-vertical .adr-list {
  flex-direction: column;
}
.adr-horizontal .adr-list {
  flex-direction: row;
  align-items: stretch;
  overflow-x: auto;
  padding-bottom: 0.3rem;
}
.adr-node {
  --adr-accent: var(--adr-c-field);
  position: relative;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  min-width: 0;
  gap: 0.7rem;
  padding: 0.4rem 0;
}
.adr-horizontal .adr-node {
  grid-template-columns: minmax(116px, 1fr);
  grid-template-rows: 42px minmax(0, 1fr);
  min-width: 150px;
  padding: 0 0.35rem;
}
.adr-kind-source { --adr-accent: var(--adr-c-source); }
.adr-kind-field { --adr-accent: var(--adr-c-field); }
.adr-kind-question { --adr-accent: var(--adr-c-question); }
.adr-kind-test { --adr-accent: var(--adr-c-test); }
.adr-kind-direction { --adr-accent: var(--adr-c-direction); }
.adr-kind-result { --adr-accent: var(--adr-c-result); }
.adr-kind-void { --adr-accent: var(--adr-c-void); }
.adr-axis {
  position: relative;
  display: flex;
  justify-content: center;
}
.adr-axis::before {
  content: '';
  position: absolute;
  top: -0.45rem;
  bottom: -0.45rem;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--adr-accent), transparent);
  opacity: 0.55;
}
.adr-horizontal .adr-axis::before {
  top: 50%;
  bottom: auto;
  left: -0.5rem;
  right: -0.5rem;
  width: auto;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--adr-accent), transparent);
}
.adr-dot {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  margin-top: 0.15rem;
  border-radius: 999px;
  border: 1px solid var(--adr-accent);
  background: rgb(var(--elev-01, 16 16 22));
  box-shadow: inset 0 0 18px color-mix(in srgb, var(--adr-accent) 18%, transparent);
}
.adr-dot::after {
  content: '';
  position: absolute;
  inset: 9px;
  border-radius: inherit;
  background: var(--adr-accent);
}
.adr-node.is-active .adr-dot {
  box-shadow:
    inset 0 0 18px color-mix(in srgb, var(--adr-accent) 24%, transparent),
    0 0 18px color-mix(in srgb, var(--adr-accent) 45%, transparent);
}
.adr-card {
  min-width: 0;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
  background: rgb(var(--elev-01, 16 16 22) / 0.48);
  padding: 0.75rem;
}
.adr-button {
  appearance: none;
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
.adr-button:focus-visible {
  outline: 2px solid var(--adr-accent);
  outline-offset: 3px;
}
.adr-label {
  display: block;
  font-weight: 700;
  line-height: 1.25;
}
.adr-meta {
  display: block;
  margin-top: 0.18rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: var(--adr-accent);
}
.adr-body {
  margin-top: 0.55rem;
  font-size: 0.88rem;
  line-height: 1.5;
  color: rgb(var(--text-02, 203 213 225));
}
`;

function StyleOnce() {
  return <style>{ARTICLE_DIAGRAM_CSS}</style>;
}

function nodeContent(node: ArticleDiagramNode, onSelect?: (node: ArticleDiagramNode) => void) {
  const body = (
    <>
      <span className="adr-label">{node.label}</span>
      {node.meta && <span className="adr-meta">{node.meta}</span>}
      {node.body && <div className="adr-body">{node.body}</div>}
    </>
  );

  if (node.href) {
    return (
      <a className="adr-button" href={node.href}>
        {body}
      </a>
    );
  }

  if (node.onSelect || onSelect) {
    return (
      <button
        type="button"
        className="adr-button"
        onClick={() => (node.onSelect ? node.onSelect(node) : onSelect?.(node))}
      >
        {body}
      </button>
    );
  }

  return body;
}

export function ArticleDiagramRail({
  nodes,
  title,
  orientation = 'vertical',
  className = '',
  onSelect,
}: ArticleDiagramRailProps) {
  const safeNodes = nodes.filter((node) => node.id && node.label);

  return (
    <section
      className={['adr', `adr-${orientation}`, className].join(' ')}
      {...agentOrientationAttributes({
        surface: 'article-diagram',
        count: `${safeNodes.length}`,
      })}
    >
      <StyleOnce />
      {title && <div className="adr-head">{title}</div>}
      <div className="adr-list">
        {safeNodes.map((node) => {
          const kind = node.kind || 'field';
          return (
            <div
              key={node.id}
              className={[
                'adr-node',
                KIND_CLASS[kind],
                node.active ? 'is-active' : '',
              ].join(' ')}
              {...agentOrientationAttributes({
                item: node.id,
                relation: kind,
                focus: node.active ? 'active' : undefined,
              })}
            >
              <div className="adr-axis" aria-hidden="true">
                <span className="adr-dot" />
              </div>
              <div className="adr-card">{nodeContent(node, onSelect)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ArticleDiagramRail;
