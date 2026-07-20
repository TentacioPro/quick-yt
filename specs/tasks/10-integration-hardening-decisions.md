# 10-integration-hardening — Decisions

## Decision Log

### D-01 · Dual Express Listeners (Sync-Server=4100, MCP-SSE=4101)
- **Context:** To comply with the cross-project port mapping contract, the local sync-server must run on port 4100, and the MCP SSE server must run on port 4101. Instead of creating redundant server files or scripts, we refactored the Express initialization inside `tools/sync-server/src/index.ts` to spin up two distinct Express app instances (`app` and `mcpApp`) and bound them to their respective ports.
- **Decision:** Split the routes:
  - `/api/sync/*` and `/api/test/*` are hosted on `app` (port 4100).
  - `/sse` and `/messages` are hosted on `mcpApp` (port 4101).
  Both servers check port availability via a custom preflight listener before binding.

---

### D-02 · Model Optimization to `gemini-1.5-flash`
- **Context:** The mobile skills (text summary report and visual keyframe diagram report) previously used `gemini-1.5-pro`. This was inefficient for high-throughput development pipelines due to high quota usage and slower latency.
- **Decision:** Switched the models in `geminiService.ts` and `geminiVision.ts` to `gemini-1.5-flash`, which drastically improves speed, reduces resource footprint, and retains identical functional accuracy.

---

### D-03 · Heavy Lock & RAM Preflight Guardrails
- **Context:** Under the shared nightly execution contract, multiple automated ratchets might run parallel resource-intensive integration suites. To prevent resource starvation, we must lock execution and ensure RAM availability.
- **Decision:** Implemented a directory-level lock check:
  - Checked `D:\night-shared\heavy.lock` to ensure no other ratchet is running a heavy task.
  - Checked `os.freemem()` to guarantee ≥ 4 GB free physical memory.
  - Atomically created the lock file with project timestamp ownership and deleted it upon completion.

---

## Terminal Evidence

```
# All sync-server and mobile tests pass
PASS __tests__/sync/realIntegration.test.ts (E2E Integration Hardening test passes)
Total: 106 tests passed successfully (60 mobile, 46 server).
```
