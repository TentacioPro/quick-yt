# Decisions: 12-trigger-framework

## Design Decisions
1. **Isolated Port binding:** We bound the Automation Trigger Framework Express instance to `AUTOMATION_PORT=4102` to avoid conflicts with `4100` (sync server) and `4101` (MCP server), keeping port isolation clean.
2. **Preflight Availability Guard:** We implemented `isPortAvailable` checking to verify `AUTOMATION_PORT` is completely free before binding, throwing an error and exiting gracefully if it is in use.
3. **In-Memory Store with Local Event Triggers:** We stored registered triggers and execution logs in Express application locals (`triggerApp.locals.triggers` and `triggerApp.locals.logs`) for fast performance and ease of verification, avoiding complex DB writes.
4. **Conforming JSON Error Contract:** We imported and reused `errors.ts` helpers (`makeSuccessResponse` and `makeErrorResponse`) to ensure all payloads adhere to the canonical API response schemas.

## Alternatives Rejected
1. **Adding Routes to index.ts:** Rejected mounting the automation routes directly to the main sync server because the trigger framework runs as a distinct utility and isolating it to port `4102` provides a cleaner boundaries contract.
2. **Persistent JSON Database File:** We rejected using a persistent file (like `triggers.json`) because temporary, in-memory storage is fully sufficient for local development, test automation runs, and ensures parallel tests do not collide on a shared disk file.
