# Sentinel

Decentralized protection for critical services.

## Problem

Modern protocols frequently depend on external infrastructure: APIs, cloud services, RPC endpoints, identity providers, payment systems, data providers, bridges, and status endpoints. If a dependency fails, the protocol may continue operating with stale or invalid assumptions.

A traditional monitoring service introduces another trusted party — a single point of failure that must be trusted to report accurately and remain available.

## Solution

Sentinel moves the critical health decision into a GenLayer Intelligent Contract. Independent validators fetch live data from the monitored endpoint and reach consensus on the operational state through the Equivalence Principle. Protected operations read directly from the on-chain result — no voluntary compliance needed.

**Verify external reality. Protect on-chain operations.**

## Architecture

```
External Service (GitHub Status API)
         ↓
GenLayer nondeterministic web access (gl.nondet.web.get)
         ↓
Independent validators execute classification
         ↓
Equivalence Principle (gl.eq_principle.strict_eq)
         ↓
Consensus on canonical boolean: operational / degraded
         ↓
Intelligent Contract state update (is_paused, last_verdict, incident_count)
         ↓
Protected operation checks is_paused before executing
```

### Core Flow: Monitor → Verify → Protect → Recover

1. **Monitor** — Watch a critical external dependency (configurable URL)
2. **Verify** — GenLayer validators independently inspect the live source
3. **Protect** — Circuit breaker activates on-chain when consensus detects degradation
4. **Recover** — Requires fresh operational verdict + owner authorization (no auto-recovery)

## GenLayer Integration

Sentinel showcases core GenLayer capabilities:

- **`gl.nondet.web.get()`** — Nondeterministic HTTP requests from within the contract
- **`gl.eq_principle.strict_eq()`** — Equivalence Principle for consensus on canonical results
- **Intelligent Contract execution** — Validators independently execute nondeterministic code
- **On-chain state** — Consensus decisions become immutable contract storage

This is not an AI oracle. GenLayer enables Intelligent Contracts to evaluate outcomes involving live web data through validator consensus.

## Deployed Contract

- **Address:** `0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000`
- **Network:** GenLayer Bradbury (Chain ID: 4221)
- **Explorer:** https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
- **Default Endpoint:** `https://www.githubstatus.com/api/v2/status.json`

## Frontend

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Wallet:** EIP-1193 provider (MetaMask, etc.)
- **GenLayer:** Direct contract interaction via genlayer-js

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Lint
npm run lint

# Run tests
npm run test
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GENLAYER_CONTRACT_ADDRESS` | Sentinel contract address | `0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000` |
| `VITE_GENLAYER_NETWORK` | Network name | `bradbury` |
| `VITE_RPC_URL` | RPC endpoint | `https://rpc-bradbury.genlayer.com` |
| `VITE_EXPLORER_URL` | Explorer URL | `https://explorer-bradbury.genlayer.com` |
| `VITE_CHAIN_ID` | Chain ID | `4221` |
| `VITE_OWNER_ADDRESS` | Owner address hint (UI only) | — |
| `VITE_STALE_AFTER_MINUTES` | Verdict staleness threshold | `10` |
| `VITE_PUBLIC_BASE_URL` | Public base URL for mock endpoints | (dev: empty, prod: your domain) |

## Testing

### Unit Tests
```bash
npm run test
```

### Manual Bradbury Test Plan

See [TEST_PLAN.md](TEST_PLAN.md) for complete end-to-end test scenarios.

### Test Scenarios

**Scenario A — Healthy**
```
ACTIVE
↓ health_check()
↓ operational
↓ ACTIVE
↓ execute_guarded_action()
↓ success
```

**Scenario B — Outage**
```
Set endpoint to https://httpbin.org/status/503
↓ health_check()
↓ degraded
↓ PAUSED
↓ execute_guarded_action()
↓ blocked
```

**Scenario C — Recovery**
```
Restore https://www.githubstatus.com/api/v2/status.json
↓ health_check()
↓ operational
↓ still PAUSED
↓ emergency_unpause()
↓ ACTIVE
↓ execute_guarded_action()
↓ success
```

## Security

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Single oracle compromise | Decentralized validator consensus |
| Stale data | Verdict bound to URL, fresh check required |
| Malicious owner | Replace with multisig/timelock/governance in production |
| Network partition | Fail-closed, validators must agree |
| Response manipulation | Strict equivalence on canonical boolean |
| Automatic recovery | Manual owner action required |

### Security Invariants

1. If `is_paused == true`, `execute_guarded_action()` MUST fail
2. Unknown/malformed/unavailable responses default to degraded (fail-closed)
3. Healthy check does NOT automatically clear existing pause
4. Changing monitored URL invalidates previous verdict
5. Only owner can call `emergency_unpause()`
6. `emergency_unpause()` requires fresh operational verdict
7. Operational verdict must belong to current monitored URL
8. Incident history never reset by recovery
9. Changing URL does not automatically unpause

### Production Hardening

- Replace owner with multisig (Gnosis Safe) or governance contract
- Add timelock for URL changes
- Monitor incident_count for anomaly detection
- Add alerting on pause activation
- Consider multiple Sentinel instances for different dependencies

## Limitations

- **Owner-controlled URL** — Centralized control point; production should use multisig/governance
- **Demo guarded operation** — `execute_guarded_action()` is a placeholder; real integration replaces this
- **Single endpoint** — Current contract monitors one URL; multi-endpoint support would require contract changes
- **Bradbury testnet only** — Not deployed on mainnet
- **No built-in alerting** — External monitoring needed for pause notifications

## Future Extensions

- Multi-sig / governance for owner actions
- Multiple monitored endpoints per contract
- Configurable classification rules
- Event-based alerting
- Mainnet deployment
- SDK for easy protocol integration

## Integration Guide

### 1. Use Deployed Contract
```typescript
const CONTRACT_ADDRESS = "0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000";
```

### 2. Configure Monitored URL (Owner)
```typescript
await contract.set_monitored_url("https://your-service.com/status");
```

### 3. Check Status Before Critical Operations
```typescript
const status = await sentinel.get_status();
if (status === "PAUSED") {
  throw new Error("Sentinel circuit breaker active - operation blocked");
}
// Proceed with critical operation
```

### 4. Monitor & Alert
```typescript
setInterval(async () => {
  const status = await sentinel.get_status();
  if (status === "PAUSED") {
    alertOnCall("Sentinel PAUSED - investigate");
  }
}, 60000);
```

### 5. Recovery Procedure
1. Verify external service is healthy
2. Run `health_check()` via Sentinel dashboard
3. Confirm `last_verdict = operational`
4. Call `emergency_unpause()` as owner
5. Verify `get_status() = ACTIVE`
6. Resume operations

## Keeper Service

The `scripts/keeper.ts` script runs periodic health checks to keep the circuit breaker state fresh. Run it as a cron job or scheduled task:

```bash
KEEPER_PRIVATE_KEY=0x... KEEPER_INTERVAL_MS=300000 npm run keeper
```

GitHub Actions workflow example in `.github/workflows/keeper.yml`.

## License

MIT
