# 11-full-e2e-verification — Decisions

## Decision Log

### D-01 · Real HTTP SSE and Socket Handshakes
- **Context:** To ensure the sync manager and MCP server communicate correctly over raw TCP sockets under realistic environments, a mock-free test suite was required.
- **Decision:** Built `tools/sync-server/__tests__/e2e.test.ts` which spawns both Express instances dynamically in the test worker on ports 4100/4101. It initiates an HTTP GET request to `/sse`, reads the streamed headers and event chunks to grab the dynamic session ID, routes a POST request containing JSON-RPC arguments, and verifies the incoming JSON-RPC stream packet.

---

### D-02 · Removing JSON Parser from the SSE Handler Application
- **Context:** When dispatching client POST messages to `/messages`, the SSE transport throws `InternalServerError: stream is not readable`. This is because the global `express.json()` parser middleware pre-reads and exhausts the request socket stream, leaving the body stream unreadable for the underlying MCP SDK.
- **Decision:** Removed `express.json()` from the `mcpApp` listener middleware stack. Since the MCP server endpoints `/sse` and `/messages` only stream SSE frames and read raw POST request streams respectively, they do not require Express body parsing.

---

### D-03 · Test Database Isolation
- **Context:** During parallel Jest test execution, `e2e.test.ts` and `server.test.ts` concurrently write and delete the default database at `tools/sync-server/.dev-backups/app_backup.db`. This leads to lock race conditions, where one test suite unlinks the file while another is querying it.
- **Decision:** Decoupled the database path using `process.env.DB_FILE` in `index.ts` and `mcp.ts`. Inside `e2e.test.ts`, the environment variable is configured to `e2e_backup.db` prior to loading the Express app, securing total file isolation.

---

## Terminal Evidence

```
PASS __tests__/gfs.test.ts
PASS __tests__/mcp.test.ts
PASS __tests__/e2e.test.ts
PASS __tests__/server.test.ts
All 108 tests in the workspace are green with 100% statement, branch, function, and line coverage!
```
