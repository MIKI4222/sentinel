# Implementation report — frontend release candidate

## Scope and evidence provenance

Frontend, scripts and English documentation only. The full supplied contract.py was read and remains unchanged. The contract is 0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000 on Bradbury (4221), SDK genlayer-js 1.1.8. This release contains both context cleanup fixes and the test-only Storage fix.

Windows command results and the real transaction below were supplied by the project owner on October 3, 2026. They are not assistant-run network checks. Earlier sandbox logs remain historical: Windows node_modules cannot supply Linux native bindings. No GitHub push, Vercel deployment, contract deployment or private-key operation has been performed by the assistant.

## Acceptance matrix

| Criterion | Status | Evidence / limitation |
| --- | --- | --- |
| Direct SDK, seven views, safe unsigned values | Implemented; live reads observed | smoke-read printed all seven fields |
| Strict typecheck | Passed | Owner Windows run; sandbox run also passes; deliberate TS2322 probe previously failed correctly |
| Zero-warning lint | Passed | Owner Windows: 0 warnings, 0 errors after cleanup fixes |
| Vitest | Passed | Owner Windows: 10 files, 86 tests after test Storage fix; synthetic tests, not network proofs |
| Production build | Passed with warning | Vite 8.3.2 completed; SDK chunk exceeds 500 kB |
| Code verification | MATCH observed | Owner ran verify-contract; conservative normalization, not byte-identical hash comparison |
| Successful real health_check | ACCEPTED, accepted-return observed | Actual hash below; reread operational / ACTIVE; concurrent attribution remains qualified |
| Actual receipt parser | Successful return shape observed | Raw statusName and simplified status_name confirmed; execution FINISHED_WITH_RETURN |
| Accepted UserError / paused action | Not verified live | Covered by synthetic tests; no real rejected-operation hash supplied |
| First-click wallet and wallet event behavior | Partially observed | Wallet and live write work; exact first-click sequence not explicitly confirmed |
| Reload recovery and actual finality | Not verified live | Synthetic tests pass; supplied receipt remains ACCEPTED, not FINALIZED |
| Entry JS below 500 kB | Passed for entry only | Entry 276.61 kB; SDK 529.01 kB; do not claim total initial JS below 500 kB |
| Public Vercel routes / fixtures | Not verified after update | Config prepared; publication and direct-route checks remain operator actions |
| Keeper live run | Not run | Env-only signer; manual workflow, no scheduled activation |
| Portal approval | Not established | Submission prepared; no approval guarantee |

## Actual owner-provided Windows results

- npm.cmd run typecheck: returned successfully without compiler errors.
- npm.cmd run lint: Found 0 warnings and 0 errors.
- npm.cmd test: Test Files 10 passed (10); Tests 86 passed (86).
- npm.cmd run build: Vite 8.3.2, 2422 modules transformed, built in 633ms. A large SDK chunk warning remains; the build succeeded.
- npm.cmd run smoke-read: ACTIVE; monitored URL and last checked URL https://www.githubstatus.com/api/v2/status.json; verdict operational; incidents 2; last-check timestamp 1790013696; guarded actions 1. This is the snapshot BEFORE the new health_check, not a current-state guarantee.
- npm.cmd run verify-contract: MATCH.
- npm.cmd run inspect-receipt -- 0xfe0e80d00e81b7f004fa61532963b4dd013ec7df4b47ccb7b2eb303f500b2656: ACCEPTED / AGREE / FINISHED_WITH_RETURN; parser kind accepted-return. No decoded boolean return was supplied by the receipt; the UI uses reread evidence instead.

Actual health_check hash: 0xfe0e80d00e81b7f004fa61532963b4dd013ec7df4b47ccb7b2eb303f500b2656

At the supplied inspection time (2026-10-03 20:18 Europe/Kiev), finality was not confirmed. The UI reported awaiting finalization. No finalized claim, rejected-operation hash or mock-outage pass has been fabricated.

## Measured bundle output supplied by the owner

| File group | Minified kB | Gzip kB |
| --- | --- | --- |
| Main index JS | 276.61 | 88.29 |
| GenLayer SDK JS | 529.01 | 113.40 |
| CSS | 29.98 | 6.08 |

Route chunks are separate; for example MonitorPage 2.65 kB and LandingPage 16.55 kB. Entry size is NOT the total initial download. The SDK chunk exceeds Vite's 500 kB warning threshold. No warning-limit increase or hidden warning was used. The older approximately 952 kB size was the owner's initial diagnosis, not an independently reproduced baseline.

## Historical sandbox evidence

- Strict typecheck passes; a deliberate string/number error produced TS2322 and exit 2 before removal.
- 51 independent synthetic assertions passed using preinstalled Linux esbuild. These supplement, not replace, the owner's 86 Vitest tests.
- Sandbox build/lint/Vitest startup fail on missing Linux native packages because uploaded dependencies came from Windows. This does not negate the subsequent successful Windows results.
- Offline visual spot checks and the owner's live local Dashboard screenshot are not an exhaustive accessibility or deployed-site audit.

## API and operational assumptions

- Installed SDK declarations and implementation, not guessed wrappers, determine calls. SDK numeric enums are from genlayer-js/types.
- Poll raw getTransaction; simplifyTransactionReceipt changes statusName to status_name. Real receipt inspection confirms this shape.
- ACCEPTED execution success is distinct from FINALIZED and from accepted execution error. NOT_VOTED with a known intermediate status remains pending.
- Decode only explicitly available returns. Search known UserError strings if present; absent text stays neutral, never invent a reason.
- SDK default reads are latest-nonfinal; seven parallel views are non-atomic. Concurrent checks can affect state attribution.
- Cleanup invalidation callbacks preserve generation/epoch guards without suppressing lint. Tests use isolated synchronous Storage, not Node's native localStorage getter; production storage is unchanged.
- Owner address is only an optional frontend hint, not on-chain verification. URL changes / recovery require the actual owner.
- Keeper pending hashes are tracked within one process, not persisted across restarts. Inspect unknown hashes before resubmission; do not casually run multiple keepers.
- Contract limitations remain documented in README, SUBMISSION and INTEGRATION: no verdict-age enforcement, fail-closed classification, unbounded public checks, owner-selected source, and guarded demo counter rather than atomic external protection.

## Publication and remaining verification

Follow DEPLOYMENT.md. Update only MIKI4222/sentinel; do not change MIKI4222/genlayer-emergency-circuit-breaker. Use the exact public production origin for VITE_PUBLIC_BASE_URL, never localhost. No keeper key is needed for the frontend.

The owner elected to proceed to publication. This does not convert unobserved finality, paused rejection, owner recovery, public fixture reachability, reload polling, or portal approval into passed checks. Dependency audit findings also remain unresolved; do not force-upgrade blindly.
