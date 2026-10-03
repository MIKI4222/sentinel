# Sentinel Architecture

## Overview

Sentinel is a decentralized circuit breaker built on GenLayer Intelligent Contracts. It protects critical on-chain operations by verifying the health of external dependencies through decentralized validator consensus.

## System Architecture

```
┌─────────────────────┐
│      User / dApp    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sentinel Frontend  │  (React + TypeScript + Vite)
│  - Wallet connect   │
│  - Contract reads   │
│  - Transaction UI   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ GenLayer Intelligent│
│      Contract       │  (EmergencyCircuitBreaker)
│  - State storage    │
│  - Access control   │
│  - Pause logic      │
└──────────┬──────────┘
           │
    nondeterministic web
           │
           ▼
┌─────────────────────┐
│ External Status API │  (GitHub Status, httpbin, custom)
└──────────┬──────────┘
           │
    independent validators
           │
           ▼
┌─────────────────────┐
│ Equivalence         │
│ Principle           │  (strict_eq on canonical boolean)
└──────────┬──────────┘
           │
        consensus
           │
           ▼
┌─────────────────────┐
│ On-chain state      │
│ ACTIVE / PAUSED     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Protected operation │
└─────────────────────┘
```

## Component Breakdown

### 1. Frontend (React Application)

**Pages:**
- `/` — Landing page with live status
- `/dashboard` — Main control panel
- `/monitor` — Endpoint configuration
- `/protected-action` — Protected operation demo
- `/recovery` — Recovery workflow
- `/activity` — Transaction history
- `/settings` — Wallet & preferences
- `/how-it-works` — User-facing explanation
- `/architecture` — Technical deep-dive
- `/docs` — Developer documentation
- `/about` — Project info

**Key Components:**
- `useGenLayer` — Wallet connection, contract reads, network management
- `useTransaction` — Transaction lifecycle tracking, localStorage persistence
- `TransactionModal` — Real-time GenLayer transaction stage display
- `Sidebar` — Navigation + wallet status

### 2. GenLayer Intelligent Contract

**State Variables:**
```python
is_paused: bool                    # Circuit breaker state
last_check_timestamp: u64          # Unix timestamp of last check
incident_count: u32                # Total degraded checks (never reset)
monitored_url: str                 # Current endpoint
owner: Address                     # Deployer (can change URL, unpause)
fail_closed: bool                  # Unknown = degraded (default: true)
pause_threshold: u32               # Incidents to activate (default: 1)
last_verdict: str                  # "not_checked" | "operational" | "degraded"
last_checked_url: str              # URL bound to last_verdict
guarded_action_count: u32          # Successful protected ops
```

**Write Methods:**
- `set_monitored_url(new_url)` — Owner only, invalidates verdict
- `health_check()` — Anyone, triggers consensus verification
- `execute_guarded_action(action_data)` — Anyone, blocked if paused
- `emergency_unpause()` — Owner only, requires fresh operational verdict

**View Methods:**
- `get_status()` → "ACTIVE" | "PAUSED"
- `get_monitored_url()` → str
- `get_last_verdict()` → str
- `get_last_checked_url()` → str
- `get_incident_count()` → u32
- `get_last_check_timestamp()` → u64
- `get_guarded_action_count()` → u32

### 3. Consensus Mechanism

**Nondeterministic Execution:**
```python
def read_and_classify() -> bool:
    response = gl.nondet.web.get(monitored_url)
    raw_body = response.body.decode("utf-8")
    return classify_status_response(raw_body, fail_closed)
```

**Equivalence Principle:**
```python
is_degraded = gl.eq_principle.strict_eq(read_and_classify)
```

Each validator independently:
1. Fetches the URL via HTTP GET
2. Parses JSON response
3. Extracts status indicator
4. Normalizes against known values
5. Returns boolean: `false` = operational, `true` = degraded

Consensus requires **exact boolean agreement** across all validators.

### 4. Classification Logic

**Supported Formats:**
- GitHub Status API: `{"status": {"indicator": "none"}}`
- Simple state: `{"state": "operational"}`
- Aggregate state: `{"aggregate_state": "major_outage"}`
- Health check: `{"health": "healthy"}`

**Operational Indicators:** `none`, `operational`, `ok`, `healthy`, `up`, `online`
**Degraded Indicators:** `degraded`, `major_outage`, `major`, `outage`, `down`, `critical`, `unavailable`, `incident`, `error`, `failed`
**Unknown:** Fail-closed → degraded

## Transaction Lifecycle

GenLayer transactions have distinct stages from standard EVM:

| Stage | Description | Layer |
|-------|-------------|-------|
| Wallet Confirmation | User signs in wallet | EVM |
| EVM Inclusion | Transaction mined | EVM |
| GenLayer Queue | Contract queued | GenLayer |
| Leader Selection | Validator chosen | GenLayer |
| Nondeterministic Exec | Leader fetches & classifies | Off-chain |
| Validator Execution | Others independently execute | Off-chain |
| Equivalence Check | strict_eq compares results | Consensus |
| Consensus Decision | Accepted if all agree | Consensus |
| State Commit | Contract storage updated | GenLayer |
| Appeal Window | Challenge period | Finality |
| Finality | Immutable | Finality |

**Frontend Tracking:**
- Transaction ID persisted in localStorage
- Real-time stage progression in TransactionModal
- Explorer links for each transaction
- Recovery after browser reload

## Security Invariants

1. **Pause Blocks Operations** — `is_paused == true` ⇒ `execute_guarded_action()` fails
2. **Fail-Closed Default** — Unknown/malformed/unavailable → degraded
3. **No Auto-Recovery** — Healthy check ≠ unpause; manual recovery required
4. **URL Change Invalidates Verdict** — New URL resets `last_verdict` to `not_checked`
5. **Owner-Only Recovery** — Only `owner` can call `emergency_unpause()`
6. **Fresh Verdict Required** — `last_verdict == "operational"` from recent check
7. **URL Must Match** — `last_checked_url == monitored_url`
8. **History Preserved** — `incident_count` never reset
9. **URL Change ≠ Unpause** — Changing URL doesn't clear pause

## Data Flow

### Health Check Flow
```
User clicks "Health Check"
       ↓
Wallet signs transaction
       ↓
EVM includes in block
       ↓
GenLayer queues contract
       ↓
Leader executes gl.nondet.web.get()
       ↓
Leader classifies response → boolean
       ↓
Other validators execute same
       ↓
Equivalence Principle: strict_eq(boolean)
       ↓
If consensus: state updated
       ↓
last_verdict, last_check_timestamp, incident_count, is_paused, last_checked_url
       ↓
Frontend polls → reads final state
```

### Recovery Flow
```
Service recovers externally
       ↓
Owner runs health_check()
       ↓
Validators confirm operational
       ↓
Contract: last_verdict = operational, is_paused = true
       ↓
Owner calls emergency_unpause()
       ↓
Contract verifies: owner + operational + URL match
       ↓
is_paused = false → ACTIVE
       ↓
Protected operations resume
```

## Network Configuration

**GenLayer Bradbury Testnet:**
- Chain ID: 4221
- RPC: https://rpc-bradbury.genlayer.com
- Explorer: https://explorer-bradbury.genlayer.com
- Currency: GEN
- Contract: 0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000

## Frontend Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS v4** — Styling
- **React Router v6** — Routing
- **ethers.js v6** — Blockchain interaction
- **Lucide React** — Icons
- **localStorage** — Transaction persistence

## Deployment

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
# Output in dist/
```

### Environment Variables
```env
VITE_GENLAYER_CONTRACT_ADDRESS=0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
VITE_GENLAYER_NETWORK=bradbury
```

## Integration Points

### For Protocol Developers

1. **Read Status Before Critical Ops:**
```typescript
const status = await sentinel.get_status();
if (status === "PAUSED") {
  throw new Error("Circuit breaker active");
}
```

2. **Monitor for Changes:**
```typescript
setInterval(async () => {
  const status = await sentinel.get_status();
  if (status === "PAUSED") alertOnCall();
}, 60000);
```

3. **Recovery Runbook:**
   - Verify external service healthy
   - Run `health_check()` via dashboard
   - Confirm `last_verdict = operational`
   - Call `emergency_unpause()` as owner
   - Verify `get_status() = ACTIVE`

## Future Architecture Considerations

- **Multi-endpoint support** — Array of monitored URLs with individual verdicts
- **Governance integration** — Replace owner with DAO/multisig
- **Event emission** — On-chain events for pause/recovery/incident
- **Configurable classification** — Custom status parsing rules
- **Mainnet deployment** — Production GenLayer network
- **SDK package** — npm package for easy integration