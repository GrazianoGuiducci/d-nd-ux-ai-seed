import React, { useMemo } from 'react';
import { agentOrientationAttributes } from './agentOrientation';

export type TaxonomyNodeStatus =
  | 'canonical'
  | 'candidate'
  | 'alias'
  | 'ambiguous'
  | 'scaffold'
  | 'rejected';

export interface TaxonomyNode {
  id: string;
  label: string;
  type?: string;
  description?: string;
  tags?: string[];
  status?: TaxonomyNodeStatus;
  parents?: string[];
  children?: string[];
  related?: string[];
}

export interface TaxonomyEdge {
  from: string;
  to: string;
  relation: string;
  weight?: number;
}

export interface TaxonomyMapProps {
  nodes: TaxonomyNode[];
  edges?: TaxonomyEdge[];
  selectedId?: string;
  title?: string;
  layout?: 'list' | 'compact';
  className?: string;
  onSelect?: (node: TaxonomyNode) => void;
}

const STATUS_CLASS: Record<TaxonomyNodeStatus, string> = {
  canonical: 'tx-status-canonical',
  candidate: 'tx-status-candidate',
  alias: 'tx-status-alias',
  ambiguous: 'tx-status-ambiguous',
  scaffold: 'tx-status-scaffold',
  rejected: 'tx-status-rejected',
};

const TAXONOMY_MAP_CSS = `
.tx-map {
  color: rgb(var(--text-01, 241 245 249));
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
  background: rgb(var(--elev-01, 16 16 22) / 0.58);
}
.tx-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
}
.tx-title,
.tx-count,
.tx-type,
.tx-tag,
.tx-edge {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.tx-title {
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(var(--text-muted, 170 175 190));
}
.tx-count {
  font-size: 0.68rem;
  color: var(--c-primary-text, rgb(103 232 249));
}
.tx-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.7rem;
}
.tx-node {
  --tx-accent: rgb(34 211 238);
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
  background: rgb(var(--elev-02, 24 24 32) / 0.45);
}
.tx-map.tx-compact .tx-node {
  background: transparent;
}
.tx-status-canonical { --tx-accent: rgb(34 211 238); }
.tx-status-candidate { --tx-accent: rgb(250 204 21); }
.tx-status-alias { --tx-accent: rgb(167 139 250); }
.tx-status-ambiguous { --tx-accent: rgb(251 146 60); }
.tx-status-scaffold { --tx-accent: rgb(45 212 191); }
.tx-status-rejected { --tx-accent: rgb(148 163 184); }
.tx-button {
  appearance: none;
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0.72rem;
  cursor: pointer;
  font: inherit;
}
.tx-button:focus-visible {
  outline: 2px solid var(--tx-accent);
  outline-offset: 2px;
}
.tx-node.is-selected {
  border-color: color-mix(in srgb, var(--tx-accent) 58%, transparent);
  background: color-mix(in srgb, var(--tx-accent) 10%, transparent);
}
.tx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  min-width: 0;
}
.tx-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}
.tx-type {
  flex-shrink: 0;
  font-size: 0.66rem;
  color: var(--tx-accent);
}
.tx-desc {
  margin-top: 0.45rem;
  font-size: 0.86rem;
  line-height: 1.45;
  color: rgb(var(--text-02, 203 213 225));
}
.tx-tags,
.tx-edges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.32rem;
  margin-top: 0.55rem;
}
.tx-tag,
.tx-edge {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.22rem 0.42rem;
  border: 1px solid rgb(var(--border-01, 255 255 255 / 0.08));
  background: rgb(var(--elev-01, 16 16 22) / 0.72);
  font-size: 0.64rem;
  color: rgb(var(--text-muted, 170 175 190));
}
.tx-empty {
  padding: 0.8rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: rgb(var(--text-muted, 170 175 190));
}
`;

function StyleOnce() {
  return <style>{TAXONOMY_MAP_CSS}</style>;
}

export function TaxonomyMap({
  nodes,
  edges = [],
  selectedId,
  title = 'Taxonomy',
  layout = 'list',
  className = '',
  onSelect,
}: TaxonomyMapProps) {
  const edgeMap = useMemo(() => {
    const map = new Map<string, TaxonomyEdge[]>();
    edges.forEach((edge) => {
      map.set(edge.from, [...(map.get(edge.from) || []), edge]);
    });
    return map;
  }, [edges]);

  const safeNodes = nodes.filter((node) => node.id && node.label);

  return (
    <section
      className={['tx-map', `tx-${layout}`, className].join(' ')}
      {...agentOrientationAttributes({
        surface: 'taxonomy-map',
        count: `${safeNodes.length}`,
      })}
    >
      <StyleOnce />
      <div className="tx-head">
        <span className="tx-title">{title}</span>
        <span className="tx-count">{safeNodes.length}</span>
      </div>
      <div className="tx-list">
        {safeNodes.length === 0 ? (
          <div className="tx-empty">No taxonomy nodes</div>
        ) : (
          safeNodes.map((node) => {
            const status = node.status || 'canonical';
            const outgoing = edgeMap.get(node.id) || [];
            const content = (
              <>
                <span className="tx-row">
                  <span className="tx-label">{node.label}</span>
                  <span className="tx-type">{node.type || status}</span>
                </span>
                {node.description && layout !== 'compact' && (
                  <span className="tx-desc">{node.description}</span>
                )}
                {node.tags && node.tags.length > 0 && layout !== 'compact' && (
                  <span className="tx-tags">
                    {node.tags.map((tag) => (
                      <span key={tag} className="tx-tag">{tag}</span>
                    ))}
                  </span>
                )}
                {outgoing.length > 0 && layout !== 'compact' && (
                  <span className="tx-edges">
                    {outgoing.map((edge) => (
                      <span key={`${edge.from}-${edge.relation}-${edge.to}`} className="tx-edge">
                        {edge.relation}: {edge.to}
                      </span>
                    ))}
                  </span>
                )}
              </>
            );

            return (
              <div
                key={node.id}
                className={[
                  'tx-node',
                  STATUS_CLASS[status],
                  selectedId === node.id ? 'is-selected' : '',
                ].join(' ')}
                {...agentOrientationAttributes({
                  item: node.id,
                  relation: node.type,
                  focus: selectedId === node.id ? 'active' : undefined,
                })}
              >
                {onSelect ? (
                  <button type="button" className="tx-button" onClick={() => onSelect(node)}>
                    {content}
                  </button>
                ) : (
                  <div className="tx-button">{content}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default TaxonomyMap;
