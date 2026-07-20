# Local Environment Configuration — Quick_yt

This document covers the steps to establish a clean development loop on your Windows host machine, connecting a physical Pixel 8a to a local Express development sync server over the LAN without internet dependencies.

## 1. Prerequisites Configuration

| Runtime Dependency | Verified Target | Architectural Purpose |
|---|---|---|
| Node.js | v20 LTS (via nvm-windows) | Execution engine for Expo, Metro bundler, and tools |
| pnpm | Corepack Managed | Fast monorepo workspace package handling |
| Git + Git Bash | Latest Stable | Environment shell emulation and source version control |

## 2. Directory Matrix Architecture
Create the workspace root cleanly on your drive:
```text
D:\Quick_yt\                         ← Monorepo Root Workspace
├── apps/
│   └── mobile/                      ← React Native Expo Framework (Target: Pixel 8a)
├── tools/
│   └── sync-server/                 ← Local Backup Sync & Developer API Node (Port 4000)
└── specs/                           ← Spec Ledger System
```

## 3. Network and Local Firewall Binding
To ensure your Pixel 8a can execute local state transfers and database synchronization:
1. Shift your Windows network profile state from **Public** to **Private**.
2. Run `ipconfig` via Git Bash to identify your local IPv4 address (e.g., `192.168.1.XX`).
3. Update the `PC_IP` binding variable within `apps/mobile/src/sync/DevSyncManager.ts` to match this host IP.
4. Open your Windows Advanced Firewall settings and create an Inbound Rule enabling full TCP traffic on port `4000`.

## 4. Initial Monorepo Smoke Verification
Once the repository directories match the Phase 1 blueprint, execute the baseline check from the root workspace:
```bash
# Verify monorepo dependencies link cleanly
pnpm install

# Run the mobile test suite validation
cd apps/mobile
pnpm test

# Spin up the development sync network node
cd ../../tools/sync-server
pnpm dev
```
