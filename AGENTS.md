# AGENTS.md — Mission Directives for All Coding Engines (Claude, Agy-CLI, Hero Kiro)

You are executing inside the **Quick_yt** engineering workspace. Before touching any application layer or typing any code, you must execute the following protocol:

## Operating Ground Rules
1. **Consult the Spec System:** Read `specs/tasks/00-spec-system.md` to map out the documentation constraints.
2. **Identify Your Bounds:** Locate your active feature card under `specs/tasks/NN-<name>.md` and inspect its state tracker file `specs/tasks/NN-<name>.state.md`.
3. **Smoke Test the Baseline:** If the state file references a `last_verified` baseline block, execute that specific suite *before* writing any code. If numbers deviate, stop immediately and report the difference.
4. **Adhere to the Six-Step Cycle:** Read → Red (Test First) → Green (Implement) → Gate (Verify All) → Record (Decisions) → Update (Specs).
5. **Zero Out-of-Scope Mutations:** Stay strictly inside the designated file scope of your assigned task. Drive-by file edits outside of the scope block are structural violations.
6. **Ground Every Assertion:** Never report that a task is finished without providing concrete, reproducible terminal test suite tails. Do not hallucinate metrics.

## Context Ledger Links
*   `plan.md` — The Core Monorepo Execution Plan (v2).
*   `specs/tasks/quick-yt-autopilot.md` — The primary execution directive for autonomous multi-task sessions.
*   `specs/modules/` — Permanent architectural system constraints.
