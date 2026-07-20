# Quick YT × Cognitive OS — Parallel Night Patch (apply to D:\Quick_yt\night\)

## 1. PORT MAP (append verbatim to BOTH projects' night-contract.md)
```
CROSS-PROJECT PORT MAP (binding): QuickYT sync-server=4100, QuickYT MCP-SSE=4101.
CognitiveOS uvicorn=8001, Next-dev=3105, Mongo=27017. Start your services ONLY on
your assigned ports (set PORT env explicitly; never rely on defaults like 3000).
Any port outside your assignment is foreign — never bind, never kill, never probe
beyond the preflight ownership check.
```
Also in Quick YT N1/N3: `PORT=4100` / `MCP_PORT=4101` explicitly in the start commands,
and tests' base URLs pointed at 4100 — never a default.

## 2. run-night.ps1 — replace the finally block (adds orphan teardown)
```powershell
} finally {
  # Exit-clean invariant: kill ONLY what this run recorded, then verify empty
  Get-ChildItem "D:\Quick_yt\night\pids\*.pid" -ErrorAction SilentlyContinue | ForEach-Object {
    $pid = (Get-Content $_ -Raw).Trim()
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($proc) { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }
    Remove-Item $_ -ErrorAction SilentlyContinue
  }
  $left = Get-ChildItem "D:\Quick_yt\night\pids\" -ErrorAction SilentlyContinue
  if ($left) { "WARN: unkillable pids remain: $($left.Name)" | Out-File $log -Append }
  Remove-Item $lock -ErrorAction SilentlyContinue
}
```
(Mirror the same block into the Cognitive OS runner if its finally lacks it.)

## 3. SHARED HEAVY LOCK (both contracts, new rule)
```
HEAVY LOCK: before starting your designated heavy item (CognitiveOS: N3 Playwright;
QuickYT: N3 mobile E2E), atomically create D:\night-shared\heavy.lock containing
your project name + timestamp. If it exists and is <50 min old: DEFER that item,
take the next queue entry instead (ratchet retries later). Delete the lock in your
teardown. Also: preflight free RAM ≥ 4GB before any heavy item, else defer.
```
Create the folder once: `mkdir D:\night-shared`

## 4. STAGGERED SCHEDULES (run in admin PowerShell)
CognitiveOS trigger at 23:00, repeat 30 min (as already specced).
QuickYT: same block but `-At 23:15` and TaskName "QuickYT-NightShift".
Never reuse a task name; never edit each other's tasks.

## 5. VERIFY BEFORE TONIGHT (5 minutes, while awake)
- [ ] `agy --help`: confirm `-p`, `--max-turns`, and whether .agy/settings.json's
      "disabledTools"/permission syntax is Antigravity's real schema (it currently
      mirrors Claude Code's — may need translation).
- [ ] Which model backend does agy use? Gemini → separate quota, fully parallel.
      Anthropic-via-API → SHARED pool with Claude Code: halve both ratchets'
      max-turns and expect slower nights, or run the two projects on alternate nights.
- [ ] Dry-run BOTH runners once manually, 15 min apart, and watch: zero prompts,
      correct ports, pids\ empty after each exits.
