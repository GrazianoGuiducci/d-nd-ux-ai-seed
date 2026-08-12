# Portable Agentic Chat System

Status: implemented public transfer source, package `0.2.0`.

This repository now contains both the portable THIA interaction surface and the
generalized situated chat system behind it. They are two layers of one product,
not two competing chats.

```text
AgentContextChatSeed              interaction layer only
AgenticChatSystem                 interaction + situated cognitive turn
runAgenticChatTurn                situated cognitive turn without this UI
```

Use `AgenticChatSystem` when a site needs a complete assistant comparable to
THIA. Use `AgentContextChatSeed` only when the host already owns context,
knowledge, reasoning and transport and needs the established interaction layer.
Use `runAgenticChatTurn` when the host has its own chat UI.

## What travels in the complete system

```text
active surface + question + conversation
-> host context adapter
-> host knowledge adapter
-> neutral situated kernel
-> competence composition + attention receipt
-> host transport adapter
-> response
```

The system preserves these generalized properties:

- the active surface is a signal, not a boundary on what can be understood;
- competences may follow the topic across pages and compose in the same turn;
- explicit unknowns and retained relations survive routing;
- available evidence that did not activate a competence remains reachable;
- missing evidence does not automatically become a missing capability;
- a host-gated action does not remove the ability to understand or propose;
- no applicable competence produces `truthful_non_application`, not a fabricated route;
- the cognitive turn does not acquire command, publication or runtime authority;
- benefit starts as `UNOBSERVED` and can be compared later through a stable key;
- the receipt exposes routing and source use, not private chain-of-thought.

These are operating relations, not a terminal list of what future hosts may
become. Each host supplies its own sources and competences without changing the
neutral kernel.

## Public ownership and synchronization

This repository is the public transfer source for the generalized system.
THIA/d-nd.com remains the owner of its live context, knowledge and runtime
adapter; MAIOS remains the owner of its equivalent parts. A host may temporarily
carry an exact copy of the neutral core, but the transfer manifest records its
source hash so drift is visible.

Future generalized improvements should return here with a host-neutral test.
Host copy, credentials, sources, provider choices and operational effects stay
in the host. This lets TM2 consume a public revision for MAIOS without following
private VPS paths or importing THIA state.

## Recommended integration

Install the package from this public repository, then create one host adapter:

```tsx
import {
  AgenticChatSystem,
  type AgenticChatHostAdapter,
} from 'd-nd-ux-ai-seed';

const host: AgenticChatHostAdapter = {
  id: 'research-site',
  name: 'Research Assistant',
  adapterVersion: '1.0.0',
  competences: [
    {
      id: 'situated-dialogue',
      version: '1.0.0',
      lifecycle: 'stable',
      name: { it: 'Dialogo situato', en: 'Situated dialogue' },
      purpose: {
        it: 'Mantiene domanda, contesto e ignoto insieme.',
        en: 'Keeps question, context and unknowns together.',
      },
      activation: { always: true },
      responseOperations: [{
        it: 'Rispondi usando il contesto presente.',
        en: 'Answer from the present context.',
      }],
      effectClass: 'cognitive',
    },
  ],
  context: {
    observe: ({ question, focus }) => ({
      surface: {
        slug: focus.surface,
        path: window.location.pathname,
        scenario: focus.relation,
        focus: focus.focus,
      },
      intent: { signal: question, source: 'observed_question', status: 'observed' },
      access: { mode: 'public', effectRequested: false },
      topics: inferTopics(question, focus),
      possibilities: {
        retainedRelations: readOpenRelations(),
        unknowns: readDeclaredUnknowns(),
      },
    }),
  },
  knowledge: {
    read: async ({ question }, observation) => ({
      sections: await readRelevantSources(question, observation),
    }),
  },
  transport: {
    complete: request => postAssistantTurn(request),
  },
};

export function SiteAssistant() {
  return (
    <AgenticChatSystem
      host={host}
      language="it"
      storageKey="research-site:assistant"
      onReceipt={(receipt) => storeTurnReceipt(receipt)}
    />
  );
}
```

`readRelevantSources` returns structured sections:

```ts
{
  id: 'paper-figure-3',
  type: 'paper',
  content: 'Source text or a source-near summary owned by the host.',
  provenance: 'paper-id:page:figure',
  status: 'source',
}
```

The content remains owned by the host. The kernel only receives section IDs
for activation and passes the structured knowledge snapshot to the transport.

## Three adoption paths

### 1. Complete portable assistant

Import `AgenticChatSystem` and provide the four host relations:

- context;
- knowledge;
- competence manifests;
- transport.

This is the default path for a new website.

### 2. Existing runtime, portable interaction layer

Import `AgentContextChatSeed` when the application already composes its own
cognitive turn:

```tsx
<AgentContextChatSeed
  language="en"
  storageKey="existing-runtime:chat"
  onSend={(question, focus, turn) => existingRuntime.ask({
    question,
    focus,
    conversation: turn.messages,
  })}
/>
```

The component keeps bubble, window, drag, resize, mobile, Submit Module,
orientation and storage behavior. It does not pretend to supply knowledge or
reasoning by itself.

### 3. Existing UI, portable cognitive turn

Import `runAgenticChatTurn` and connect its result to the host UI:

```ts
const result = await runAgenticChatTurn(host, {
  question,
  language: 'en',
  focus,
  messages,
});

render(result.text);
store(result.receipt);
```

## Effects remain a separate movement

An optional `effects` adapter can describe or perform host-owned actions. The
normal chat turn never invokes it. A host must make a separate, explicit call
and retain the returned effect receipt. This keeps a useful answer available
even where commands are unavailable, without silently granting authority.

## Language

`AgenticChatSystem` and `AgentContextChatSeed` accept `language="it"` or
`language="en"`. Default UI copy, starter prompts, accessibility labels and the
Submit Module follow that language. Hosts can override individual strings with
the `copy` and `feedback` props. Knowledge content is not translated by the
kernel; source language and translation policy remain host-owned.

## Receipts and benefit

Every cognitive turn returns:

- situation fingerprint;
- competences used and why they activated;
- evidence selected and other evidence still available;
- retained relations, unknowns and declared capability gaps;
- effect availability without effect authority;
- `comparisonKey` with benefit status `UNOBSERVED`.

The host may later connect corrections, source loss, continuity, turn count,
noise or completed effects to the comparison key. The kernel does not collapse
those observations into a universal score or claim that it improved itself.

## Transfer to MAIOS or another agentic application

TM2 or another integrator can consume the public source without importing the
D-ND website:

1. import the package or copy `src/chat-kernel/situatedChatKernel.ts` unchanged;
2. map the target application's current context into `context.observe`;
3. expose the target's existing sources through `knowledge.read`;
4. express target competences as small manifests;
5. map the existing model endpoint into `transport.complete`;
6. use `AgenticChatSystem` only if the target also wants this UI;
7. store receipts in the target's existing conversation state, not in a second
   hidden memory;
8. connect effects separately where the target already owns their authority.

The target keeps its own identity, ontology, provider credentials and runtime.
Only the generalized movement is transferred.

## Source map

| File | Role |
|---|---|
| `src/chat-kernel/situatedChatKernel.ts` | neutral routing, composition, receipt and context compiler |
| `src/AgenticChatSystem.tsx` | host adapters, complete headless turn and React composition |
| `src/ThiaChatSeed.tsx` | reusable interaction layer and IT/EN interface copy |
| `src/agentOrientation.ts` | active surface and focus bridge |
| `tests/agentic-chat-system.test.mjs` | behavioral invariants and no-effect proof |
| `docs/AGENTIC_CHAT_SYSTEM_MANIFEST.v0.2.json` | machine-readable transfer and lineage manifest |
| `docs/THIA_CHAT_PORT_PARITY_CONTRACT.md` | complete interaction behavior contract |

## Verification

```bash
npm ci
npm run verify
git diff --check
```

The package is licensed under PolyForm Noncommercial 1.0.0. External
commercial use requires permission from the repository owner.
