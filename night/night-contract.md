NIGHT SHIFT invocation. You are headless; no human until morning. 
Read `specs/tasks/quick-yt-autopilot.md` §1 (your standing contract). Its interrupt rules apply, with one change: on interrupt, write `blocked_on` to the state file, commit, push, and EXIT. DO NOT wait for a human.

RATCHET RULES:
1. First: read `specs/tasks/NIGHT-QUEUE.md` and all `*.state.md`. Determine the single next unblocked queue item.
2. Advance it as far as budget allows (≤70 turns). EVERY loop-step boundary: commit + push. Never leave uncommitted work — a rate-limit death must cost zero.
3. If the item completes: update state, self-review per §1, mark done in `NIGHT-QUEUE.md`, commit, push, and if turns remain, start the next item.
4. If ALL items are done or blocked: write `specs/tasks/morning-report.md` (state summary, metrics rollup, blockers, what you'd do next), create `specs/tasks/NIGHT-DONE.flag`, commit, push, exit.
5. NEVER overnight: touch main, run migrations, delete branches, weaken a test, edit `.env`.
6. COEXISTENCE GUARD: You may only kill processes by reading PIDs you explicitly started and wrote to `night/pids/`. Never kill by port or name. Leave foreign processes untouched. 
