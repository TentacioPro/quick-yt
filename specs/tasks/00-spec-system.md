# 00 — The Quick_yt Spec System (How Agents Execute End-to-End)

This document defines the spec ledger system for `Quick_yt`. Every unit of coding, refactoring, or infrastructure addition must adhere strictly to these rules to maintain TDD alignment and zero-drift state tracking across versions.

---

## Two Documentation Layers

### Layer 1 — Module Specs (`specs/modules/`) — Living Source of Truth
These files represent the permanent architectural standards of the `Quick_yt` ecosystem. They are updated in place as capabilities grow, but *every edit must be driven by a numbered task spec (Layer 2)*.
*   `db-layer.spec.md` — Core schema, Drizzle, and expo-sqlite configs.
*   `validation-guardrails.spec.md` — Runtime validation strategies using Zod.
*   `error-contract.spec.md` — Mobile-to-server strict JSON error shapes.
*   `sync-protocol.spec.md` — Local state push/pull network operations.
*   `ui-ux.spec.md` — Material Design 3 rules, Zustand state stores, Toast & Haptics configurations.

### Layer 2 — Task Specs (`specs/tasks/`) — Append-Only Chronological Ledger
Every feature, bugfix, or migration gets a sequential number (`NN`) and up to three files:
```text
specs/tasks/
  NN-<task-name>.md            ← The strict objective requirement (written BEFORE code)
  NN-<task-name>-decisions.md  ← Explicit technical architectural choices and rejected paths
  NN-<task-name>-learnings.md  ← Discovered gotchas, unexpected framework behaviors, and bugs resolved
```
*   Numbers are sequential and never reused.
*   Once a task is closed, its files are immutable. Alterations are addressed in subsequent numbered tasks.

---

## The Task Spec Template (Copy for new `NN-*.md`)

```markdown
# NN — <Task Name>

## GOAL
One clear, unambiguous, checkable technical outcome. 

## MODULE SPECS IN SCOPE
List files from `specs/modules/` governing this task.

## REUSE MAP
| Existing Asset | Path | How It's Reused |
|---|---|---|
| | | |

## TDD CONTRACT
1. Tests to write FIRST (suite names + assertions). Must fail on empty implementation.
2. Existing tests that must remain green.
3. The failing-forward target tests that this specific task turns green.

## OUT OF SCOPE
Explicit statements bounding the agent's work. Drive-by refactorings are strictly forbidden.

## DONE MEANS
- [ ] All new and existing TDD tests are green.
- [ ] `NN-decisions.md` is fully written with explicit trade-offs.
- [ ] Relevant `specs/modules/` are updated to match new realities.
- [ ] Paste verifiable terminal test summaries showing zero failures.
```

---

## The Agent Execution Loop
1. **Read:** Read this system spec, the active task spec, its related module specs, and targeted code.
2. **Red:** Write the descriptive test assertions first; run the test framework to verify failure.
3. **Green:** Write the minimal clean implementation code satisfying the tests and validation schemas.
4. **Gate:** Run the full validation suite (Jest tests, lint checks, build checks) to ensure zero regression.
5. **Record:** Write the decision and learning ledgers. Paste exact terminal outputs.
6. **Update:** Update any living module specs if the code introduces long-term structural changes.
