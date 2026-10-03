# Test plan — deployed contract remains unchanged

## Execution status

Owner-provided observations from October 3, 2026 are recorded below. Unobserved scenarios remain Not run; the owner elected to proceed to publication without completing every scenario. Synthetic test passes are not live-network acceptance. Full provenance and command results are in IMPLEMENTATION_REPORT.md.

A/C URL writes and recovery require the actual owner. Guarded action while paused should return an accepted contract error, if submitted and accepted on the network. RPC/wallet preflight rejection may occur before a hash; document that separately rather than inventing a receipt.

| Scenario | Procedure / expected behavior | Status | Hash | Result |
| --- | --- | --- | --- | --- |
| Live GitHub Status check | Run health_check on the existing GitHub Status endpoint; reread evidence | ACCEPTED; finality unconfirmed | 0xfe0e80d00e81b7f004fa61532963b4dd013ec7df4b47ccb7b2eb303f500b2656 | accepted-return; observed operational / ACTIVE; incidents 2 |
| A: healthy | Select public healthy fixture as owner; run health_check; observe operational bound to current URL. If previously paused, owner unpause separately | Not run | | |
| B: degraded | Select major fixture; run health_check; accepted-return with degraded -> PAUSED, incident counter increments | Not run | | |
| C: recovery | Restore healthy endpoint; owner health_check; observe matching operational verdict; owner unpause -> ACTIVE | Not run | | |
| Contract rejection | While PAUSED, submit execute_guarded_action; accepted FINISHED_WITH_ERROR -> Rejected by contract, not green success | Not run | | |
| No consensus | Observe a real UNDETERMINED/timeout transaction when available; no-consensus UI, no claimed success or automatic pause | Not run | | |
| Stale verdict | Wait past VITE_STALE_AFTER_MINUTES; freshness warning appears, labeled as UI-only | Observed in local browser | | Owner screenshot showed old September 21 verdict and UI-only freshness warning |
| Minor indicator | Use public fixture containing only status.indicator=minor; accepted check should classify degraded | Not run | | |
| Empty body | Use a publicly reachable endpoint returning an empty body; accepted check should classify degraded | Not run | | |
| First click | Disconnect locally, click health check once; wallet connection then submission signature, without a second click | Not run | | |
| Refused signature | Reject in wallet (4001); canceled locally, no fabricated hash | Not run | | |
| Long consensus | Verify intermediate statuses remain pending beyond 30 seconds; six-minute polling deadline -> unknown, retain hash | Not run | | |
| Actual finality | ACCEPTED shows awaiting finalization; only FINALIZED shows finalized | Partial: acceptance only | 0xfe0e80d00e81b7f004fa61532963b4dd013ec7df4b47ccb7b2eb303f500b2656 | awaiting finalization observed; no FINALIZED evidence |
| Reload recovery | Reload with recorded pending hash; read-client polling continues; result updated without wallet signing | Not run | | |
| Wrong network | Connect other chain; Wrong network warning; switch/add Bradbury then re-read eth_chainId | Not run | | |
| Non-owner URL/unpause | Attempt as non-owner and verify rejection message, never accepted success | Not run | | |
| Source reset | Owner URL change -> not_checked, checked URL cleared; existing pause stays | Not run | | |
| Direct dashboard | Open public /dashboard in fresh tab and reload; no Vercel 404/login | Not run | | |
| Public fixtures | Fetch /mock/*.json publicly without authorization; confirm content, not SPA HTML | Not run | | |

## Read-only checks, no private key

```bash
npm run smoke-read
npm run verify-contract
npm run inspect-receipt -- <real-hash>
```

Attach raw and simplified actual receipts from inspect-receipt. Inspect the accepted/error shape and refine extraction only using observed fields. Run one real health_check and one real paused execute_guarded_action in the UI and retain their hashes. Do not deploy another contract for this test.

## Local checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Expected test areas: receipt unions and numeric/snake shapes, six UserErrors, bigint/number normalization, error reads, action outcomes, TDZ regression, first-click connection, history immutability/recovery, environment validation and source-wrapper guard. Tests use synthetic hashes only as fixtures, never live evidence.

## Manual accessibility and mobile

390px and desktop: navigation drawer, Escape, focus trap/return, long URLs, error state, unknown-status retry, recovery warnings and modal scrolling. No page-level horizontal overflow. Record actual checks, not assumptions.

## Recorded read-only and local checks

Owner Windows outputs: typecheck successful; lint 0 warnings / 0 errors; Vitest 86 tests in 10 files passed; Vite production build passed with SDK size warning. smoke-read returned all seven views, verify-contract printed MATCH, inspect-receipt parsed the real hash above as accepted-return. Public deployment has not yet been checked.
