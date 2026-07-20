# 08 — MCP Server Portability (SSE Transport)

## GOAL
Package the Express server inside `tools/sync-server` to expose standard Model Context Protocol (MCP) endpoints via HTTP SSE (Server-Sent Events) instead of stdio. The MCP server will read the backed-up database `app_backup.db` and expose the required query tools. Write `mcp.json` into `.vscode/` so the IDE can connect to the HTTP SSE endpoint. Execute full test suite `pnpm test:server`. Do NOT modify `apps/mobile`.

## MODULE SPECS IN SCOPE
- `specs/modules/sync-protocol.spec.md` — Database paths and sync state references.
- `specs/modules/mcp-schema.spec.md` — MCP tools structure and JSON configurations.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Database SQLite schema | `apps/mobile/src/db/schema.ts` | Map query results to match schema column definitions. |
| Sync-server backups folder | `tools/sync-server/.dev-backups/` | MCP server queries the active `app_backup.db` file in this directory. |

## FILE SCOPE
Only the following files may be created or modified:

```text
tools/sync-server/src/mcp.ts                       (modify/re-implement — expose SSE endpoints)
tools/sync-server/src/index.ts                     (modify — mount SSE transport endpoints on Port 4000)
.vscode/mcp.json                                   (create/overwrite — point to SSE server configuration)
tools/sync-server/package.json                     (modify — verify mcp sdk dependencies)
tools/sync-server/__tests__/mcp.test.ts            (create/overwrite — test SSE routing)
specs/modules/mcp-schema.spec.md                   (update)
specs/tasks/08-mcp-server-decisions.md             (create)
specs/tasks/08-mcp-server.state.md                 (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `tools/sync-server/__tests__/mcp.test.ts`
- Assert MCP server exposes standard tools: `query_videos`, `query_audit_logs`, and `query_video_transcript`.
- Assert SSE transport endpoints `/sse` and `/message` route requests correctly.
- Assert tool results correctly query the mock SQLite file.
- Assert error handling on missing database or missing parameters.

### 2. Regression Assertions
- All Express endpoints (status, backup, restore, metrics) remain fully operational and verified.

## OUT OF SCOPE
- Do NOT modify `apps/mobile` files.
- No client-side modifications.

## DONE MEANS
- [ ] SSE MCP endpoints are fully verified by server tests.
- [ ] 100% tests in sync-server pass green.
- [ ] `.vscode/mcp.json` pointing to http://localhost:4000/sse successfully written.
- [ ] State Closed.
