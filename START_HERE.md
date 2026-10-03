# Start here — consolidated frontend release

This ZIP includes both context cleanup fixes and the Vitest Storage fix; no separate patch ZIPs are needed. Full sources are included. Contract code is not changed.

Extract into a fresh folder. For publication, follow DEPLOYMENT.md and clone the frontend repository into a separate fresh folder before mirroring files. Do not overwrite .git or publish local .env / node_modules / dist. Windows users should use npm.cmd. Previously supplied Windows checks passed after these fixes; see IMPLEMENTATION_REPORT.md for evidence and remaining limits.

For local use, from the extracted sentinel folder:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

These commands are instructions, not a claim of additional executions. Do not submit private keys or use npm audit fix --force blindly.
