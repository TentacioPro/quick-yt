# Night Queue — Quick_yt Monorepo
*Queue executes automatically via the night-shift ratchet.*

- [x] **N1 (Task 08 - MCP Server Portability):** Read `specs/tasks/quick-yt-autopilot.md`. Package the Express server inside `tools/sync-server` to expose standard Model Context Protocol (MCP) endpoints via HTTP SSE. Write `mcp.json` into `.vscode/` so the IDE can connect. Execute full test suite `pnpm test:server`. Do NOT modify `apps/mobile`.
- [x] **N2 (Task 09 - Automated Versioned Snapshots):** Implement Grandfather-Father-Son (GFS) algorithm inside the Express sync server on `POST /api/sync/backup`. Retain daily (7), weekly (4), and monthly (12) snapshots. Write tests asserting exact file counts after pruning. Ensure 100% server coverage.
- [x] **N3 (Integration Hardening):** Start the sync-server natively. Run `pnpm test` on the mobile app to verify real end-to-end multipart uploads hit the server, write a snapshot, and respond 200 OK. Cleanly tear down the sync server using PID termination only.
- [x] **N4 (Task 10 - Integration Hardening):** Run local sync-server on port 4100. Implement integration hardening with PID-based process management, port preflight checks, 4100/4101 port isolation, and heavy lock validation. Run mobile integration tests.
- [x] **N5 (Task 11 - Full E2E Verification):** Perform full end-to-end verification of the sync manager and MCP server on port 4100/4101.

