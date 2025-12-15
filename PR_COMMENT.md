Please re-run CI for this PR — I updated the repository to fix build issues and verified the changes locally.

Summary of verification performed locally:
- Updated `package-lock.json` and ran `npm install` at the repo root.
- Ran Vite production build successfully (`dist/` produced).
- Restored `server` to ESM (`"type": "module"`) and moved the CommonJS db-check to `server/scripts/db-check.cjs`.
- Regenerated Prisma Client (v6.19.0) and repaired the server postinstall steps.
- Started the simple server on port 4001 and ran automated edge tests — ALL EDGE TESTS PASSED.

Notes:
- I temporarily renamed a locked Prisma native binary to `query_engine-windows.dll.node.disabled` to allow installs; you can remove it if desired.

Request: please re-run CI / Vercel for this branch so the preview deploys can validate these fixes.
