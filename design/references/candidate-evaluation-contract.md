# Candidate Evaluation Contract

Status: public adoption and evaluation contract.

`candidate` does not mean private, blocked or unusable. It means that the
competence is available for scoped use and evaluation, while the repository
has not yet granted it the status of a generally promoted baseline.

An external product, agent or evaluation system may therefore adopt a
candidate immediately when its license and operating boundaries permit it.
That system owns the decision about validity in its own target context.

## Status And Authority

Use these distinctions:

```text
candidate:
  available for scoped adoption and evaluation;
  no repository-wide guarantee has been granted.

locally validated:
  an adopting system has evaluated an exact candidate version against a named
  target, evidence set and conditions.

promoted:
  the Seed repository has accepted the competence as a reusable baseline
  through its separate promotion gate.
```

Local validation authorizes the adopting system to rely on the candidate only
inside the recorded scope. It does not transfer authority over the upstream
registry and does not silently change `candidate` to `promoted`.

## Evaluation Outcomes

An evaluating system returns exactly one outcome:

- `adopt`: the tested clauses are sufficient for the named target;
- `adopt_with_conditions`: use is allowed only while the recorded conditions
  remain true;
- `needs_evidence`: the system cannot determine validity yet;
- `reject`: the candidate is not suitable for the named target or evidence.

`reject` is contextual. It does not prove that the candidate is invalid for
other systems or surfaces.

## Evaluation Method

1. Bind the evaluation to the exact seed id and version or commit.
2. Name the target product, surface and environment.
3. Select the clauses and acceptance checks that govern that target.
4. Mark each clause `passed`, `failed`, `not_tested` or `not_applicable`.
5. Attach inspectable evidence such as tests, screenshots, accessibility
   results, task observations or failure receipts.
6. Record conditions, unresolved risks, recovery behavior and recheck
   triggers.
7. Issue one scoped outcome and preserve the receipt with the adopting
   system.

The system must not convert missing evidence into a positive result. A useful
candidate can remain `needs_evidence` without becoming unavailable.

## Machine-Readable Receipt

The following shape is the minimum interoperable receipt. Systems may add
fields, but should preserve these meanings. Validate stored receipts against
`schemas/candidate-evaluation-receipt.schema.json`.

```json
{
  "schema": "agentic-ux-seed.evaluation-receipt.v0.1",
  "seedId": "context-aware-guided-form",
  "seedStatusAtEvaluation": "candidate",
  "seedVersionOrCommit": "exact-version-or-commit",
  "target": {
    "product": "target-product",
    "surface": "target-surface",
    "environment": "evaluation-environment"
  },
  "evaluator": {
    "system": "evaluating-system",
    "method": "rendered-task-and-contract-check"
  },
  "clauses": [
    {
      "id": "selection-without-auto-advance",
      "result": "passed",
      "evidence": ["artifact-or-observation-reference"]
    }
  ],
  "decision": "adopt_with_conditions",
  "conditions": ["Recheck when the form state model or motion contract changes."],
  "validity": {
    "scope": "named target and version only",
    "recheckOn": ["seed-version-change", "target-behavior-change"]
  },
  "sideEffects": "review-only",
  "receipt": {
    "createdAt": "ISO-8601 timestamp",
    "artifact": "receipt-location-or-id"
  }
}
```

## Contribution Back To The Seed

Evaluation receipts may be proposed as evidence for upstream improvement or
promotion. The repository owner still reviews portability, privacy, license,
responsive behavior, accessibility and cross-context evidence before changing
the registry status.

This separation keeps candidates usable without making local success look
like universal proof.
