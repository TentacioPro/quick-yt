# SKILL — Prompt Optimizer (Quick_yt Edition)

*Deployment Instructions: Inject this prompt compiler into your workspace to compress messy tasks into high-precision, token-efficient, tool-friendly agent instructions.*

## System Protocol
Before passing a complex developer instruction to the internal agents or sub-agents, transform the command into the following structural payload. Ensure it remains under 25 lines to prevent context bloat.

## The Compilation Layout
```text
GOAL: <Single verifiable completion parameter>
CONTEXT: <Exact relative file paths to read before execution; no broad terms>
SCOPE: <Directories and files allowed to mutate> | OUT: <Strictly protected file trees>
VERIFY-FIRST: <1-2 commands to run instantly to map the initial reality>
PLAN: <3-5 highly dense, linear implementation steps ending in testing points>
DONE MEANS: <Verification commands + concrete generated file artifacts required>
REPORT: <Exact content block expected back: test run output tails, diff logs, state markers>
BUDGET: <Max permitted tool executions before forcing a milestone sync loop>
```

## Immutable Execution Rules Included in Compilation
1. **Read Before Writing:** Force the agent to ingest target files natively before proposing patches.
2. **Atomic Writes:** Consolidate file edits into a single structured diff where possible rather than multiple noisy chunks.
3. **TDD Priority:** A task spec must explicitly name the test file that will be brought from Red to Green.
4. **Failure Intercept:** If the agent encounters 2 consecutive execution blockages on a single path, it must cease operations, report the error signature, and await further human instruction.
