# 08-mcp-server — Decisions (SSE Transport)

## Decision Log

### D-01 · Exposing MCP via Server-Sent Events (SSE)
- **Context:** The standard stdio-based MCP transport requires the client tool (e.g. IDE) to spawn the server process directly and redirect standard input/output streams. Exposing MCP via standard HTTP Server-Sent Events (SSE) endpoints is much more flexible, permitting external processes to query the server concurrently over the network (e.g. on port 4000).
- **Decision:** Integrated the `SSEServerTransport` from `@modelcontextprotocol/sdk/server/sse.js` directly into our Express server (`tools/sync-server/src/index.ts`). Exposed:
  - `GET /sse`: Persistent stream transport channel.
  - `POST /messages`: Command reception routing.

---

### D-02 · Isolated HTTP connection testing for Server-Sent Events
- **Context:** Server-Sent Events are designed as long-lived open-ended HTTP streams. When testing these streams using `supertest`, the response stream does not close, resulting in unit tests hanging indefinitely and hitting the 5000ms Jest timeout block.
- **Decision:** Replaced `supertest` assertions for `GET /sse` with standard Node `http.get` requests that destroy the request connection (`req.destroy()`) immediately after checking the `Content-Type: text/event-stream` header and statusCode. This validates connection handshakes without leaking execution handles.

---

## Terminal Evidence

```
# Server tests pass
PASS __tests__/gfs.test.ts
PASS __tests__/mcp.test.ts
PASS __tests__/server.test.ts (20 tests passed)
```
