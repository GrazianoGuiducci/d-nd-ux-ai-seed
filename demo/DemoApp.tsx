import React, { useMemo, useState } from 'react';
import {
  ArticleDiagramRail,
  AgentButton,
  AgentCard,
  AgentContextChatSeed,
  AgentModal,
  LiveBadge,
  MegaMenuSeed,
  Shell3Col,
  SplitPanel,
  TaxonomyMap,
  Tooltip,
  dispatchAgentContextAsk,
  type ArticleDiagramNode,
  type MegaMenuSeedGroup,
  type TaxonomyEdge,
  type TaxonomyNode,
} from '../src';

type DemoSurface = {
  id: string;
  title: string;
  kind: string;
  state: 'ready' | 'candidate' | 'review';
  description: string;
  owner: string;
  boundary: string;
  next: string;
};

type DemoLivePayload = {
  label: string;
  count: number;
  updated: string;
};

const surfaces: DemoSurface[] = [
  {
    id: 'workspace',
    title: 'Three-column workspace',
    kind: 'layout',
    state: 'ready',
    description: 'Keeps context, active field and consequences visible while the user inspects and acts.',
    owner: 'shared UX',
    boundary: 'layout and orientation only',
    next: 'Copy the shell and replace panel bodies with domain content.',
  },
  {
    id: 'navigation',
    title: 'Navigation model',
    kind: 'public surface',
    state: 'candidate',
    description: 'Turns page families into a visible contract before copy, routing or CMS metadata change.',
    owner: 'site teams',
    boundary: 'no deploy side effect',
    next: 'Map route, intent, adjacent surfaces and safe transition.',
  },
  {
    id: 'agent',
    title: 'Agent response outline',
    kind: 'assistant UI',
    state: 'ready',
    description: 'Gives long responses a scannable map of sections, claims, actions, warnings and results.',
    owner: 'AI products',
    boundary: 'orientation, not hidden reasoning',
    next: 'Generate outline from response metadata when available.',
  },
  {
    id: 'taxonomy',
    title: 'Taxonomy inspector',
    kind: 'concept system',
    state: 'review',
    description: 'Shows canonical, candidate and ambiguous terms without promoting uncertain concepts.',
    owner: 'knowledge systems',
    boundary: 'visible status before authority',
    next: 'Attach edges and preserve rejected/ambiguous residue.',
  },
];

const taxonomyNodes: TaxonomyNode[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    type: 'surface',
    status: 'canonical',
    description: 'Dense working area where multiple live contexts must remain visible.',
    tags: ['layout', 'orientation'],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    type: 'model',
    status: 'candidate',
    description: 'Route and intent structure that can be reused across public pages and tools.',
    tags: ['public UI', 'routes'],
  },
  {
    id: 'agent',
    label: 'Agentic UI',
    type: 'mode',
    status: 'canonical',
    description: 'Interfaces designed for human work and machine-readable orientation.',
    tags: ['data-agent', 'assistant'],
  },
  {
    id: 'taxonomy',
    label: 'Concept taxonomy',
    type: 'contract',
    status: 'ambiguous',
    description: 'Shared concept map with explicit candidate and rejected states.',
    tags: ['knowledge', 'review'],
  },
];

const taxonomyEdges: TaxonomyEdge[] = [
  { from: 'workspace', to: 'agent', relation: 'exposes' },
  { from: 'navigation', to: 'workspace', relation: 'uses' },
  { from: 'taxonomy', to: 'navigation', relation: 'stabilizes' },
];

const processNodes: ArticleDiagramNode[] = [
  {
    id: 'source',
    label: 'Source',
    meta: 'existing UI',
    kind: 'source',
    body: 'Extract the behavior without carrying private project content.',
  },
  {
    id: 'contract',
    label: 'Contract',
    meta: 'seed API',
    kind: 'field',
    body: 'Name props, data attributes, storage keys and responsive behavior.',
  },
  {
    id: 'verify',
    label: 'Verify',
    meta: 'browser',
    kind: 'test',
    body: 'Check desktop, mobile, overflow, drawers, focus and resize.',
  },
  {
    id: 'promote',
    label: 'Promote',
    meta: 'shared model',
    kind: 'result',
    body: 'Use it across projects only after the contract is documented.',
  },
];

function stateLabel(state: DemoSurface['state']) {
  if (state === 'ready') return 'ready';
  if (state === 'candidate') return 'candidate';
  return 'review';
}

export default function DemoApp() {
  const [selectedId, setSelectedId] = useState(surfaces[0].id);
  const [mode, setMode] = useState<'patterns' | 'taxonomy'>('patterns');
  const [modalOpen, setModalOpen] = useState(false);

  const selected = useMemo(
    () => surfaces.find((surface) => surface.id === selectedId) || surfaces[0],
    [selectedId],
  );

  const megaGroups = useMemo<MegaMenuSeedGroup[]>(() => [
    {
      id: 'patterns',
      title: 'Workspace tabs',
      summary: 'Surfaces that can become tabs or routed panels.',
      items: surfaces.map(surface => ({
        id: surface.id,
        label: surface.title,
        description: surface.boundary,
        status: surface.state,
        meta: surface.kind,
      })),
    },
    {
      id: 'templates',
      title: 'Templates',
      summary: 'Copyable starts for new domains.',
      items: [
        {
          id: 'template-shell',
          label: 'Three-column shell',
          description: 'Context, active field and consequence panels.',
          status: 'seed',
        },
        {
          id: 'template-domain',
          label: 'Domain page',
          description: 'Public page structure with diagram and menu contract.',
          status: 'candidate',
        },
        {
          id: 'template-chat',
          label: 'Agent context assistant',
          description: 'Assistant surface aware of open panels and focus.',
          status: 'seed',
        },
      ],
    },
    {
      id: 'integration',
      title: 'Integration',
      summary: 'What coders should carry together.',
      items: [
        {
          id: 'guide',
          label: 'Adoption guide',
          description: 'Checklist, awareness attributes, storage keys and responsive checks.',
          status: 'doc',
          href: './docs/ADOPTION_GUIDE.md',
        },
        {
          id: 'inventory',
          label: 'Template inventory',
          description: 'Subdomain and public-site patterns to extract next.',
          status: 'doc',
          href: './docs/TEMPLATE_SOURCE_INVENTORY.md',
        },
      ],
    },
  ], []);

  const leftPanel = (
    <div className="demo-panel">
      <div className="demo-panel-head">
        <p className="demo-kicker">Agentic UX Seed</p>
        <h1>Reusable interface patterns for agentic workspaces.</h1>
        <LiveBadge<DemoLivePayload>
          endpoint="/demo-live.json"
          pollInterval={45000}
          staleAfter={90000}
          fallback={<span className="demo-muted">loading local signal</span>}
          render={(data, status) => `${data.count} patterns / ${status}`}
        />
      </div>

      <div className="demo-segmented" aria-label="Demo mode">
        <button type="button" className={mode === 'patterns' ? 'is-active' : ''} onClick={() => setMode('patterns')}>
          Patterns
        </button>
        <button type="button" className={mode === 'taxonomy' ? 'is-active' : ''} onClick={() => setMode('taxonomy')}>
          Taxonomy
        </button>
      </div>

      <div className="demo-list" aria-label="Seed surfaces">
        {surfaces.map((surface) => (
          <button
            key={surface.id}
            type="button"
            className={`demo-surface ${selectedId === surface.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedId(surface.id)}
          >
            <span>
              <strong>{surface.title}</strong>
              <em>{surface.kind}</em>
            </span>
            <small data-state={surface.state}>{stateLabel(surface.state)}</small>
          </button>
        ))}
      </div>
    </div>
  );

  const mainPanel = (
    <main className="demo-main-field">
      <div className="demo-main-top">
        <div className="demo-main-copy">
          <p className="demo-kicker">selected pattern</p>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
        </div>
        <MegaMenuSeed
          className="demo-top-menu"
          label="Seed menu"
          align="right"
          groups={megaGroups}
          activeId={selected.id}
          onSelect={(item, group) => {
            if (group.id === 'patterns') setSelectedId(item.id);
            if (item.id === 'template-chat') setMode('patterns');
            if (item.id === 'guide' || item.id === 'inventory') {
              dispatchAgentContextAsk({
                source: 'seed-menu',
                focus: item.label,
                relation: group.title,
                prompt: `Explain how to integrate ${item.label} without losing related elements.`,
              });
            }
          }}
        />
      </div>

      <SplitPanel
        storageKey="dnd_seed_demo_split"
        firstLabel="Interface contract"
        secondLabel="Reusable process"
        first={
          <div className="demo-contract">
            <div className="demo-contract-grid">
              <div>
                <span>Owner</span>
                <strong>{selected.owner}</strong>
              </div>
              <div>
                <span>Boundary</span>
                <strong>{selected.boundary}</strong>
              </div>
              <div>
                <span>Next use</span>
                <strong>{selected.next}</strong>
              </div>
              <div>
                <span>Awareness</span>
                <strong>orientation attributes preserved</strong>
              </div>
            </div>

            <div className="demo-canvas" data-state={selected.state}>
              <div className="demo-route-map" aria-label="Route model">
                <span>context</span>
                <i />
                <span className="is-active">{selected.kind}</span>
                <i />
                <span>consequence</span>
              </div>
              <div className="demo-preview-grid">
                {surfaces.map((surface) => (
                  <button
                    key={surface.id}
                    type="button"
                    className={surface.id === selected.id ? 'is-active' : ''}
                    onClick={() => setSelectedId(surface.id)}
                  >
                    <span>{surface.title}</span>
                    <small>{surface.boundary}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        second={
          <div className="demo-process">
            {mode === 'patterns' ? (
              <ArticleDiagramRail nodes={processNodes} title="Promotion path" />
            ) : (
              <TaxonomyMap
                nodes={taxonomyNodes}
                edges={taxonomyEdges}
                selectedId={selected.id}
                title="Concept contract"
                onSelect={(node) => setSelectedId(node.id)}
              />
            )}
          </div>
        }
        mobileBehavior="resizable"
        collapseFirstBelow={260}
        collapseSecondBelow={220}
        collapsedFirstSize={48}
        collapsedSecondSize={48}
      />
    </main>
  );

  const rightPanel = (
    <aside className="demo-panel">
      <div className="demo-panel-head">
        <p className="demo-kicker">detail</p>
        <h2>{selected.title}</h2>
        <p>{selected.description}</p>
      </div>

      <dl className="demo-detail-list">
        <div>
          <dt>State</dt>
          <dd>{stateLabel(selected.state)}</dd>
        </div>
        <div>
          <dt>Boundary</dt>
          <dd>{selected.boundary}</dd>
        </div>
        <div>
          <dt>First safe action</dt>
          <dd>{selected.next}</dd>
        </div>
      </dl>

      <div className="demo-inspector-block">
        <span>Pattern contract</span>
        <p>
          Keep visible state, storage keys, awareness attributes and side-effect boundary aligned
          before copying this seed into another project.
        </p>
      </div>

      <div className="demo-primitive-stack" aria-label="Design primitives">
        <AgentCard className="demo-primitive-card" tone="active">
          <span>Radius contract</span>
          <p>Cards and modals stop at 8px; controls use 4px; pills are explicit.</p>
        </AgentCard>
        <div className="demo-button-row">
          <AgentButton type="button" variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            Open modal
          </AgentButton>
          <AgentButton type="button" variant="ghost" size="sm">
            Ghost
          </AgentButton>
        </div>
      </div>

      <Tooltip
        content={{
          function: 'This marker shows the machine-readable orientation contract used by agentic UI.',
          mechanism: 'Keep the attributes stable while changing visible copy or component internals.',
          expectation: 'Related seeds: Workspace seed, Taxonomy map.',
        }}
      >
        <button type="button" className="demo-action">
          Inspect awareness marker
        </button>
      </Tooltip>

      <AgentModal
        open={modalOpen}
        title="Modal primitive"
        subtitle="A focused overlay with explicit close, backdrop close, Escape close and stable radius."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <AgentButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </AgentButton>
            <AgentButton type="button" variant="primary" onClick={() => setModalOpen(false)}>
              Accept
            </AgentButton>
          </>
        }
      >
        <p className="demo-modal-copy">
          Use this for bounded decisions, confirmations or focused editing. Do not use it for
          ordinary side-panel inspection when a drawer or inspector can preserve context.
        </p>
      </AgentModal>
    </aside>
  );

  return (
    <div className="demo-app">
      <Shell3Col
        flat
        orientation={{
          surface: 'ux-ai-seed-demo',
          active: true,
          tab: mode,
          focus: selected.title,
          item: selected.id,
          relation: selected.kind,
          count: `${surfaces.length} patterns`,
          boundary: selected.boundary,
        }}
        leftTitle="Patterns"
        rightTitle="Inspector"
        leftStorage="dnd_seed_demo_left"
        rightStorage="dnd_seed_demo_right"
        minHeight="100dvh"
        leftOpenWidth={300}
        rightOpenWidth={320}
        minOpenWidth={240}
        maxOpenWidth={560}
        left={{
          body: leftPanel,
          closedTooltip: {
            title: 'Patterns',
            body: <>Reusable seeds, candidate patterns and current design-system signals.</>,
            related: [{ label: 'Main field' }, { label: 'Inspector' }],
          },
        }}
        main={mainPanel}
        right={{
          body: rightPanel,
          closedTooltip: {
            title: 'Inspector',
            body: <>Selected pattern, boundary and next safe action.</>,
            related: [{ label: selected.title }],
          },
        }}
      />
      <a className="demo-powered" href="https://d-nd.com" target="_blank" rel="noreferrer">
        Agentic UX Seed
      </a>
      <AgentContextChatSeed
        title="Agent"
        subtitle="Context assistant"
        surfaceId="dnd-ux-ai-seed"
        surfaceTitle={selected.title}
        focus={{
          tab: mode,
          focus: selected.title,
          item: selected.id,
          relation: selected.kind,
          boundary: selected.boundary,
          count: `${surfaces.length} patterns`,
        }}
        starterPrompts={[
          'What is open now?',
          'Which elements must travel together?',
          'What changes on mobile?',
        ]}
      />
    </div>
  );
}
