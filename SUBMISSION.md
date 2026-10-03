# Sentinel — GenLayer Portal Submission

## What It Does

Sentinel is a decentralized circuit breaker that protects critical on-chain operations by verifying the health of external dependencies through GenLayer's validator consensus. It solves the trust problem of relying on a single centralized monitoring service by moving the health decision into a GenLayer Intelligent Contract where independent validators fetch live data and reach consensus on the operational state.

## Problem It Solves

Modern protocols depend on external infrastructure (APIs, cloud services, RPC endpoints, identity providers, payment systems, bridges, status endpoints). If a dependency fails, the protocol may continue operating with stale or invalid assumptions. Traditional monitoring introduces another trusted party — a single point of failure.

Sentinel moves the critical health decision into a GenLayer Intelligent Contract where independent validators fetch live data and reach consensus through the Equivalence Principle. Protected operations read directly from the on-chain result — no voluntary compliance needed.

## Why GenLayer

GenLayer uniquely enables this architecture through:

1. **`gl.nondet.web.get()`** — Nondeterministic HTTP requests from within the contract, allowing validators to independently fetch live external data
2. **`gl.eq_principle.strict_eq()`** — Equivalence Principle for consensus on canonical boolean results (operational/degraded) rather than raw response bytes
3. **Intelligent Contract execution** — Validators independently execute nondeterministic code off-chain, then reach consensus on-chain
4. **On-chain state** — Consensus decisions become immutable contract storage that protected operations can trustlessly read

This is not an AI oracle. GenLayer enables Intelligent Contracts to evaluate outcomes involving live web data through validator consensus.

## Contract

- **Address:** `0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000`
- **Network:** GenLayer Bradbury (Chain ID: 4221)
- **Explorer:** https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
- **Source:** https://github.com/MIKI4222/genlayer-emergency-circuit-breaker/blob/main/contract.py

## How to Use

### As a User
1. Connect wallet (MetaMask) on GenLayer Bradbury
2. View live contract status on Dashboard
3. Run Health Check to trigger consensus verification
4. Execute Protected Actions when system is ACTIVE
5. Use Recovery page to unpause after incidents

### As an Operator (with Keeper)
```bash
KEEPER_PRIVATE_KEY=0x... KEEPER_INTERVAL_MS=300000 npm run keeper
```
Or deploy the GitHub Actions workflow in `.github/workflows/keeper.yml`

### As an Integrator
```typescript
const status = await sentinel.get_status();
if (status === "PAUSED") {
  throw new Error("Circuit breaker active - operation blocked");
}
// Proceed with critical operation
```

## Live Demo

- **Frontend:** [Deployed URL] (to be filled after deployment)
- **Contract:** https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
- **Repository:** https://github.com/MIKI4222/genlayer-emergency-circuit-breaker

## Test Evidence

See [TEST_PLAN.md](TEST_PLAN.md) for complete test scenarios. Key scenarios validated:

- ✅ Connect Wallet on Bradbury
- ✅ Read contract state (status, verdict, incident count)
- ✅ Health Check on healthy endpoint → Operational verdict
- ✅ Health Check on degraded endpoint → Degraded verdict, PAUSED
- ✅ Protected Action blocked when PAUSED
- ✅ Recovery requires fresh operational verdict + owner auth
- ✅ Full cycle: ACTIVE → PAUSED → ACTIVE
- ✅ Non-owner cannot change URL or recover
- ✅ Recovery fails without operational verdict or URL mismatch

## Known Limitations

1. **Owner-controlled URL** — Centralized control point; production should use multisig/governance
2. **Demo guarded operation** — `execute_guarded_action()` is a placeholder; real integration replaces this
3. **Single endpoint** — Current contract monitors one URL; multi-endpoint requires contract changes
4. **Bradbury testnet only** — Not deployed on mainnet
5. **No built-in alerting** — External monitoring needed for pause notifications
6. **Minor indicator = degraded** — GitHub Statuspage "minor" not in operational list, triggers fail-closed
7. **Empty/invalid response = degraded** — Fail-closed by design
8. **No HTTP status check** — Contract doesn't verify HTTP response codes
9. **Consensus failure = no state change** — Validators must agree exactly
10. **Health check rate unlimited** — No on-chain rate limiting
11. **Verdict age not checked on-chain** — Staleness is UI hint only
12. **Owner can change URL to controlled endpoint** — Can manipulate verdict