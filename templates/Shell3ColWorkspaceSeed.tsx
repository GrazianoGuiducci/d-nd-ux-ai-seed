import React from 'react';
import Shell3Col from '../src/Shell3Col';
import './Shell3ColWorkspaceSeed.css';

type WorkspaceSeedProps = {
  en?: boolean;
  activeItem?: {
    id: string;
    title: string;
    relation?: string;
  };
};

/**
 * Copy this seed when creating a dense agentic workspace.
 *
 * Keep the behavior in Shell3Col. Put domain-specific content only in
 * leftPanel, mainPanel and rightPanel.
 */
export default function Shell3ColWorkspaceSeed({ en = false, activeItem }: WorkspaceSeedProps) {
  const labels = {
    left: en ? 'Field' : 'Campo',
    right: en ? 'Detail' : 'Dettaglio',
    tab: en ? 'Workspace' : 'Workspace',
  };

  const leftPanel = (
    <div className="workspace-seed-panel">
      <div className="workspace-seed-section">
        <div className="workspace-seed-label">
          {en ? 'context' : 'contesto'}
        </div>
        <h3>
          {en ? 'Current field' : 'Campo corrente'}
        </h3>
        <p>
          {en
            ? 'What the user must keep in working memory while reading the main field.'
            : 'Cio che l utente deve tenere in memoria operativa mentre legge il campo centrale.'}
        </p>
      </div>

      <div className="workspace-seed-metrics">
        <div>
          <span>{en ? 'items' : 'oggetti'}</span>
          <strong>0</strong>
        </div>
        <div>
          <span>{en ? 'mode' : 'modo'}</span>
          <strong>read-only</strong>
        </div>
      </div>
    </div>
  );

  const mainPanel = (
    <section className="workspace-seed-main">
      <div className="workspace-seed-canvas-wrap">
        <div className="workspace-seed-canvas">
          <span>
            {en ? 'main field' : 'campo centrale'}
          </span>
        </div>
      </div>
    </section>
  );

  const rightPanel = (
    <div className="workspace-seed-panel">
      <div className="workspace-seed-section">
        <div className="workspace-seed-label">
          {en ? 'selected item' : 'oggetto selezionato'}
        </div>
        <h4>
          {activeItem?.title || (en ? 'Nothing selected' : 'Nessuna selezione')}
        </h4>
        {activeItem?.relation && (
          <div className="workspace-seed-relation">
            {activeItem.relation}
          </div>
        )}
      </div>

      <div className="workspace-seed-note">
        {en
          ? 'Put consequences, constraints and next likely actions here.'
          : 'Inserire qui conseguenze, vincoli e prossime azioni probabili.'}
      </div>
    </div>
  );

  return (
    <div
      className="workspace-seed-root"
      data-thia-marker="workspace-seed"
      data-thia-active="true"
      data-thia-tab={labels.tab}
      data-thia-focus={activeItem?.title || 'workspace'}
      data-thia-item={activeItem?.id || 'none'}
      data-thia-relation={activeItem?.relation || 'none'}
      data-thia-count="0 items"
    >
      <Shell3Col
        flat
        leftTitle={labels.left}
        rightTitle={labels.right}
        leftStorage="replace_surface_left"
        rightStorage="replace_surface_right"
        defaultLeft="open"
        defaultRight="open"
        minHeight="100%"
        leftOpenWidth={300}
        rightOpenWidth={340}
        minOpenWidth={220}
        maxOpenWidth={520}
        left={{
          body: leftPanel,
          closedTooltip: {
            title: labels.left,
            body: en
              ? <>Context, filters and recent signals for the active field.</>
              : <>Contesto, filtri e segnali recenti per il campo attivo.</>,
            related: [
              { label: en ? 'Main field' : 'Campo centrale' },
              { label: en ? 'Details' : 'Dettagli' },
            ],
          },
        }}
        main={mainPanel}
        right={{
          body: rightPanel,
          closedTooltip: {
            title: labels.right,
            body: en
              ? <>Selection detail, consequences, constraints and next action boundary.</>
              : <>Dettaglio selezione, conseguenze, vincoli e confine della prossima azione.</>,
          },
        }}
      />
    </div>
  );
}
