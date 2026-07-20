# Living Specification — MCP Schema & Configuration

> Last updated by: Task 08 — MCP Server Portability
> Driven by: `specs/tasks/08-mcp-server.md`

The local Express sync-server hosts a Model Context Protocol (MCP) server over Server-Sent Events (SSE) transport to allow connected AI coding agents inside Visual Studio Code to query the state of the mobile application database.

---

## 1. VS Code Configuration File

**File:** `.vscode/mcp.json`

Allows IDE extensions to connect to the Express SSE server running on port 4000.

```json
{
  "mcpServers": {
    "quick-yt-mcp": {
      "url": "http://localhost:4000/sse"
    }
  }
}
```

---

## 2. Exposed Tools

### `query_videos`
- **Description:** Retrieve a list of all videos, including their URLs, titles, and processing status.
- **Arguments:** None.
- **Output:** JSON array of video records:
  ```json
  [
    {
      "id": "vid-1",
      "url": "https://youtube.com/watch?v=1",
      "title": "Title One",
      "status": "complete"
    }
  ]
  ```

### `query_audit_logs`
- **Description:** Retrieve a list of the latest system audit logs for debugging performance and database writes.
- **Arguments:**
  - `limit` (optional number, min 1, max 100, default 50): Number of audit log rows.
- **Output:** JSON array of audit logs ordered by timestamp descending.

### `query_video_transcript`
- **Description:** Retrieve the raw transcript and structured markdown report for a specific video ID.
- **Arguments:**
  - `videoId` (required string): Unique identifier of the video.
- **Output:** Readable text format containing sections `=== Transcript ===` and `=== Markdown Report ===`. Returns an error message if the ID is missing.

---

## 3. Database Driver Layer

To ensure portability across dev environments (especially Windows machines with diverse C++ compilers), the MCP server does not import native C/C++ bindings (like `better-sqlite3` or raw `sqlite3` driver bindings). It reads `app_backup.db` into memory via WebAssembly/pure-JavaScript using the `sql.js` library:

1. Loads binary array from disk via `fs.readFileSync`.
2. Instantiates `new SQL.Database(fileBuffer)`.
3. Prepares SQL queries, maps results, and frees statements.
4. Closes in-memory instance to prevent leaks.
