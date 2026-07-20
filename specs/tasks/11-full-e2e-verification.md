# 11 — Full E2E Verification

## GOAL
Perform full end-to-end verification of the sync manager and MCP SSE server running on ports 4100 and 4101. Write a dedicated E2E test suite that starts the actual HTTP servers, establishes a Server-Sent Events (SSE) streaming connection, dispatches real JSON-RPC tool calls to `/messages`, asserts that the responses are streamed back correctly, and verifies the backup/restore file transmission.

## MODULE SPECS IN SCOPE
- `specs/modules/sync-protocol.spec.md` — HTTP/SSE transport validation.
- `specs/modules/mcp-schema.spec.md` — Tool schema compatibility.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Express Server | `tools/sync-server/src/index.ts` | Hosts endpoints on port 4100/4101. |
| MCP SDK | `@modelcontextprotocol/sdk` | Dispatches JSON-RPC requests. |

## FILE SCOPE
Only the following files may be created or modified:

```text
tools/sync-server/__tests__/e2e.test.ts (create — E2E socket tests)
specs/tasks/11-full-e2e-verification-decisions.md (create)
specs/tasks/11-full-e2e-verification.state.md     (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `tools/sync-server/__tests__/e2e.test.ts`
- Start the Express app on port 4100 and mcpApp on port 4101.
- Establish a real HTTP connection to `http://127.0.0.1:4101/sse` and verify it streams event packets.
- Post a JSON-RPC message calling `query_videos` to the `/messages` route and verify response content.
- Perform a real HTTP POST upload of a SQLite database to port 4100 `/api/sync/backup` and verify file creation.
- Perform a real HTTP GET download from port 4100 `/api/sync/restore` and verify content integrity.
- Tear down both server instances cleanly.

### 2. Regression Assertions
- All 106 unit and integration tests must remain green.

## DONE MEANS
- [ ] E2E test suite is written and runs successfully.
- [ ] State Closed.
