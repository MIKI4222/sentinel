# Frontend publication — GitHub and Vercel

This package updates only https://github.com/MIKI4222/sentinel. Do not change, redeploy or version the EmergencyCircuitBreaker contract or its repository.

## Publish safely

1. Extract sentinel-release.zip into a NEW Downloads/sentinel-release folder. The complete project is its sentinel subfolder. Never publish node_modules, dist, real .env files or a private key.
2. Confirm Git is installed with git --version. Authenticate using Git for Windows / Git Credential Manager or GitHub Desktop. Never paste tokens or passwords into chat.
3. Clone MIKI4222/sentinel into a fresh folder. Keep the .git directory. Mirror the clean release project into that clone; excluded .git must stay intact. Review git status and git diff --stat before committing. Mirroring removes obsolete project files; use only the newly cloned folder, never the existing development folder.
4. Commit the reviewed frontend changes and push main. Respect branch protection: use a pull request if main cannot be pushed directly. Do not force-push. If Git requests commit identity, configure your preferred name and a GitHub noreply email privately.
5. Keep the existing contract repository untouched. GitHub About may point to the existing public demo origin; do not invent another production domain.

## Vercel existing project

Open the Sentinel project, Settings → Git. Confirm Connected Git Repository is MIKI4222/sentinel and Production Branch is main. Use the repository root as Root Directory, framework Vite, build command npm run build, output directory dist, Node.js 24.x, and npm ci for install if an explicit install command is needed.

Browser environment variables for Production:

```text
VITE_CONTRACT_ADDRESS=0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
VITE_RPC_URL=https://rpc-bradbury.genlayer.com
VITE_EXPLORER_URL=https://explorer-bradbury.genlayer.com
VITE_CHAIN_ID=4221
VITE_STALE_AFTER_MINUTES=10
VITE_PUBLIC_BASE_URL=https://sentinel-lake-omega.vercel.app
```

Use that VITE_PUBLIC_BASE_URL only if it is the actual public production origin shown by your Vercel project. Otherwise set your actual HTTPS origin with no path. VITE_OWNER_ADDRESS is optional and may stay unset; it is a UI hint only. Do not set KEEPER_PRIVATE_KEY or any secret in VITE_* variables. Do not enable keeper scheduling as part of frontend publication.

Save environment changes BEFORE the deployment you intend to publish, or Redeploy the latest commit afterwards. Existing Git integration normally deploys main pushes automatically. Verify the deployment commit and Ready status; publishing a ZIP here does not mean GitHub or Vercel was updated.

For a public demo, Production Deployment Protection must not redirect viewers or validators to login. Review the project protection setting; preserve preview protection if desired. Ensure CI results are visible, including typecheck, lint, tests and build.

## Read-only post-deployment checks

- Open the public /dashboard URL in a private browser window and reload; it must render without login or 404.
- Check /mock/healthy.json, /mock/degraded.json and /mock/unknown.json return JSON without authorization, not the SPA HTML page.
- A missing /mock/does-not-exist.json or /assets/does-not-exist.js must remain 404, not index.html.
- Public read-only state must work without a wallet. Use wallet transactions only when intentionally authorized; do not resubmit an unknown transaction.

Recorded local build success and an accepted health_check do not prove the new public deployment, finality or all negative-path scenarios. Consult IMPLEMENTATION_REPORT.md.
