# Sentinel

A GenLayer Bradbury dApp demonstrating a decentralized emergency circuit breaker for external service dependencies. It replaces trust in a single monitoring operator's health decision with independently executed validator reads and a contract-enforced pause for its guarded demo method. It does **not** eliminate trust in the selected data source or the owner.

## Fixed deployment — do not modify or redeploy

- Address: `0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000`
- Network: Bradbury, chain ID `4221` (confirmed in installed genlayer-js 1.1.8 chain definition)
- Explorer: https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
- Contract repository: https://github.com/MIKI4222/genlayer-emergency-circuit-breaker — `contract.py` is authoritative, not its docstrings or README.
- Frontend source: https://github.com/MIKI4222/sentinel
- User-provided live-demo URL: https://sentinel-lake-omega.vercel.app/ — public access and updated deployment still require verification.

## Why GenLayer

Validators execute the contract's nondeterministic web read independently and compare the canonical degraded/operational boolean using the Equivalence Principle. The decision is not supplied by one trusted oracle server or a frontend LLM. The classification in this deployed contract is deterministic JSON parsing, not an LLM prompt. A successful check changes the guarded method's on-chain permission to execute. Failure to achieve consensus is not evidence of source health or an automatic pause.

## Flow

```text
Wallet -> writeContract(value: 0n) -> submitted hash
  -> validators independently fetch monitored URL
  -> JSON classification -> strict_eq boolean -> ACCEPTED
  -> reread seven view methods -> display observed evidence
  -> background getTransaction polling -> FINALIZED

Unknown body + accepted degraded verdict -> PAUSED
Operational verdict -> remains paused until owner recovery
PAUSED -> execute_guarded_action rejects inside the contract
```

ACCEPTED is not FINALIZED. An accepted transaction can execute with UserError; that is a rejection, not a successful operation. Polling timeout means unknown, not failed. Pending NOT_VOTED means validators have not voted yet, not an immediately terminal error.

## Install and run

Node.js 24 is recommended. React 19, React Router 7, Vite 8, TypeScript, Tailwind v4, genlayer-js **1.1.8**. No ethers integration. The installed SDK is the API source of truth; current online docs may describe newer SDKs.

```bash
npm ci
cp .env.example .env
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

On PowerShell use `Copy-Item .env.example .env` and `npm.cmd` if script execution policy blocks `npm.ps1`. Do not run `npm audit fix --force` blindly; review vulnerability paths and compatible fixes first.

## Environment

| Variable | Meaning / safe default |
| --- | --- |
| VITE_CONTRACT_ADDRESS | Fixed deployed address above |
| VITE_RPC_URL | https://rpc-bradbury.genlayer.com |
| VITE_EXPLORER_URL | https://explorer-bradbury.genlayer.com |
| VITE_CHAIN_ID | 4221; rejected if incompatible with SDK Bradbury |
| VITE_OWNER_ADDRESS | Empty; optional UI hint only, never verified on chain |
| VITE_STALE_AFTER_MINUTES | 10; positive integer UI threshold, not a contract guarantee |
| VITE_PUBLIC_BASE_URL | Empty hides mock selection. Set to the public HTTPS deployment origin |
| KEEPER_PRIVATE_KEY | Empty in repository; private environment/Actions secret only |
| KEEPER_INTERVAL_MS | 300000; minimum 60000 |

Never put a private key in a VITE variable, a file committed to Git, or a chat message. Node scripts read process environment; they do not automatically load `.env`. Set their environment in your shell or process manager. Browser VITE variables are public and embedded at build time.

## How to use

1. Dashboard reads all seven views without a wallet. Read failures are shown explicitly with Retry.
2. Connect a compatible EIP-1193 wallet. A write initiated while disconnected connects and proceeds using the returned session. A wrong network can be switched to Bradbury.
3. Monitor: run `health_check`. Review verdict, checked URL, timestamp, age, cumulative incidents and guarded-action count. A timestamp that did not change is not claimed as a confirmed new check. Seven parallel reads are not an atomic snapshot; concurrent checks can limit attribution.
4. Guarded action: submit the demo data. When paused, an accepted UserError is displayed as **Rejected by contract**. No local status check is substituted for contract enforcement.
5. Recovery: owner must obtain an operational verdict for the current URL before submitting unpause. Freshness is a UI hint; owner verification occurs inside the contract. URL changes invalidate the verdict but do not clear a pause.
6. Activity restores polling for recorded pending/unknown hashes and continues finalization tracking. Local history is limited to 50 records, not a full blockchain index. Missing hashes cannot prove submission; inspect wallet activity before retrying.

## Public demo fixtures / Vercel

Set `VITE_PUBLIC_BASE_URL=https://sentinel-lake-omega.vercel.app` only if that is the public production origin you control. Validators must reach `/mock/healthy.json`, `/mock/degraded.json` and `/mock/unknown.json`. Localhost URLs do not work for validators. These are **synthetic fixtures**, not authoritative live health evidence. Healthy `none` -> operational; `major` -> degraded; unknown schema -> degraded.

Vercel's filesystem-first SPA fallback preserves assets and mock JSON; routes such as `/dashboard` fall back to index.html. Missing `/assets/*` and `/mock/*` return 404 rather than HTML. If production redirects to login, disable Deployment Protection for Production. Changing repository About/homepage and Vercel settings is a manual owner action; no remote setting was changed here.

## Scripts and keeper

```bash
npm run smoke-read
npm run verify-contract
npm run inspect-receipt -- <real-transaction-hash>
npm run keeper -- --once
npm run keeper
```

Read/verify/inspect need network access but no key. Verify fetches deployed code with `getContractCode(address)` and compares it with repository `contract.py`, normalizing CRLF, BOM, trailing line whitespace and EOF whitespace without collapsing Python indentation or string contents. It prints MATCH/MISMATCH only after actual comparison.

Keeper needs a funded environment-only `KEEPER_PRIVATE_KEY`. It derives a signer with SDK `createAccount`, sends `value: 0n`, waits up to six minutes per acceptance poll, retries no-consensus next cycle, and keeps tracking an unknown outstanding hash instead of submitting another within the same process. Its sequential loop cannot overlap locally. Pending hashes are not persisted across keeper restarts: after an unknown one-shot outcome, check that hash manually before another run. The workflow is **workflow_dispatch only**, no automatic gas spending. Do not enable multiple keepers against the same account without operational coordination.

## Known limitations of the deployed contract

1. GitHub Statuspage `minor` is not a recognized indicator. A standard response containing only this status is classified as degraded through fail-closed.
2. Empty bodies, invalid JSON and unknown formats classify as degraded. The response HTTP status code is not checked.
3. `health_check` uses `gl.eq_principle.strict_eq` on the boolean result. Failure to reach consensus does not apply the check's state changes and does NOT enable the pause. Other concurrent transactions can still change state.
4. Anyone may call `health_check`, with no contract rate limit.
5. Neither `execute_guarded_action` nor `emergency_unpause` checks verdict age. Useful live protection requires regular checks. ACTIVE can also be the initial never-checked state.
6. The owner can replace the monitored URL with a controlled endpoint, obtain an operational verdict and unpause. Decentralized validation does not remove this source-selection trust.
7. `incident_count` is cumulative, not consecutive; operational checks do not reset it. The constructor fixes `pause_threshold=1` and `fail_closed=true`; neither is configurable through the deployed public interface.
8. The guarded operation is a demonstration counter and returned string, not a real protocol action. This deployment does not protect an unrelated external transaction automatically.

Partial frontend mitigations: stale/URL mismatch warnings, an HTTPS-only URL form, a 30-second monitor cooldown, explicit acceptance/finality/error outcomes, keeper tooling and code verification. These are UX/operational mitigations, **not on-chain guarantees**. The monitored authority can still publish false information or be unreachable. Recovery does not require a configurable threshold or a time-bounded fresh verdict.

## Integration and reuse

See [INTEGRATION.md](INTEGRATION.md). An integrator can consume the seven views as evidence but must define an actual protected integration separately. A frontend read-then-send sequence is not an atomic protection boundary. There is no deployed `get_owner`, `get_state`, `get_pause_threshold`, `get_fail_closed` or `is_safe_to_execute`.

## Test evidence

See [TEST_PLAN.md](TEST_PLAN.md) and [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md). Do not infer a Bradbury pass from mocked tests. No transaction hashes or live state are fabricated. Current commands and build sizes are reported with their actual execution status.

Official SDK reference: https://docs.genlayer.com/api-references/genlayer-js (may target a newer version than 1.1.8).

## Release verification — October 3, 2026

The project owner supplied successful Windows typecheck, zero-warning lint, 86 passing Vitest tests, a successful production build, seven-view smoke-read, and deployed-source MATCH. A real health_check receipt was ACCEPTED / FINISHED_WITH_RETURN and parsed as accepted-return. Actual hash: 0xfe0e80d00e81b7f004fa61532963b4dd013ec7df4b47ccb7b2eb303f500b2656. FINALIZED and a real paused-action rejection are not yet confirmed. The SDK chunk is 529.01 kB and still triggers the size warning. See IMPLEMENTATION_REPORT.md for provenance and DEPLOYMENT.md for GitHub/Vercel publication.

## Intelligent Contract

The deployed contract source is in [contracts/contract.py](contracts/contract.py).
Provenance and verification steps: [contracts/README.md](contracts/README.md).

Live app: https://sentinel-lake-omega.vercel.app/
