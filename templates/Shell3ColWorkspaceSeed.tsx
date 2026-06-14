import React from 'react';
import Shell3Col from '../src/Shell3Col';

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
    <div className="min-w-0 p-4 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <div className="mb-2 font-mono text-xs uppercase tracking-wider text-slate-500">
          {en ? 'context' : 'contesto'}
        </div>
        <h3 className="text-lg font-light text-slate-50">
          {en ? 'Current field' : 'Campo corrente'}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          {en
            ? 'What the user must keep in working memory while reading the main field.'
            : 'Cio che l utente deve tenere in memoria operativa mentre legge il campo centrale.'}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center font-mono text-xs">
        <div className="border border-slate-800 bg-slate-950/50 px-3 py-2">
          <div className="text-slate-500">{en ? 'items' : 'oggetti'}</div>
          <div className="mt-1 text-cyan-300">0</div>
        </div>
        <div className="border border-slate-800 bg-slate-950/50 px-3 py-2">
          <div className="text-slate-500">{en ? 'mode' : 'modo'}</div>
          <div className="mt-1 text-emerald-300">read-only</div>
        </div>
      </div>
    </div>
  );

  const mainPanel = (
    <section className="relative flex h-full min-w-0 items-center justify-center overflow-auto bg-slate-950">
      <div className="w-full max-w-5xl p-6">
        <div className="flex aspect-[16/9] items-center justify-center border border-slate-800 bg-slate-950/80">
          <span className="font-mono text-sm uppercase tracking-wider text-cyan-300">
            {en ? 'main field' : 'campo centrale'}
          </span>
        </div>
      </div>
    </section>
  );

  const rightPanel = (
    <div className="min-w-0 p-4 text-slate-100">
      <div className="mb-4">
        <div className="mb-2 font-mono text-xs uppercase tracking-wider text-slate-500">
          {en ? 'selected item' : 'oggetto selezionato'}
        </div>
        <h4 className="text-base font-medium text-slate-50">
          {activeItem?.title || (en ? 'Nothing selected' : 'Nessuna selezione')}
        </h4>
        {activeItem?.relation && (
          <div className="mt-2 rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 font-mono text-xs text-cyan-300">
            {activeItem.relation}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-4 text-sm text-slate-400">
        {en
          ? 'Put consequences, constraints and next likely actions here.'
          : 'Inserire qui conseguenze, vincoli e prossime azioni probabili.'}
      </div>
    </div>
  );

  return (
    <div
      className="h-full overflow-hidden bg-slate-950 text-slate-100"
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
