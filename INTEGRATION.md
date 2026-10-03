# Sentinel Integration Guide

This guide explains how to integrate Sentinel's circuit breaker protection into your protocol or application.

## Quick Start

### 1. Use the Deployed Contract

The Sentinel contract is deployed on GenLayer Bradbury:

```typescript
const SENTINEL_ADDRESS = "0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000";
const BRADBURY_CHAIN_ID = 4221;
const RPC_URL = "https://rpc-bradbury.genlayer.com";
```

### 2. Read Contract State (TypeScript with genlayer-js)

```typescript
import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

const client = createClient({
  chain: testnetBradbury,
  endpoint: "https://rpc-bradbury.genlayer.com",
});

const contract = client.contract({
  address: "0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000",
  abi: [
    { name: "get_status", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
    { name: "get_last_verdict", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
    { name: "get_incident_count", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
    { name: "get_last_check_timestamp", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint64" }] },
  ],
});

// Check if system is active before critical operations
const status = await contract.read.get_status();
if (status === "PAUSED") {
  throw new Error("Sentinel circuit breaker active - operation blocked");
}

// Optional: Get more details
const verdict = await contract.read.get_last_verdict(); // "operational" | "degraded" | "not_checked"
const incidentCount = await contract.read.get_incident_count();
const lastCheck = await contract.read.get_last_check_timestamp();
```

### 3. Monitor for Changes

```typescript
setInterval(async () => {
  const status = await contract.read.get_status();
  if (status === "PAUSED") {
    // Alert your team
    console.error("⚠️ Sentinel PAUSED - investigate immediately");
    // Send to PagerDuty, Slack, etc.
  }
}, 60000); // Check every minute
```

## For Protocol Developers

### Protecting Critical Operations

Replace your critical operation with a guarded version:

```typescript
async function executeCriticalOperation(params: any) {
  // 1. Check Sentinel status
  const status = await sentinel.get_status();
  if (status === "PAUSED") {
    throw new Error("Circuit breaker active - operation blocked by Sentinel");
  }

  // 2. Execute your critical operation
  const result = await yourCriticalOperation(params);

  // 3. Optionally notify Sentinel of success (if you extend the contract)
  return result;
}
```

### Recovery Procedure (Runbook)

Document this for your operations team:

1. **Verify external service is healthy** — Check the actual service status page
2. **Run fresh health check** — Call `health_check()` via Sentinel dashboard or script
3. **Confirm operational verdict** — Verify `get_last_verdict() === "operational"`
4. **Call emergency_unpause()** — As contract owner (or multisig)
4. **Verify ACTIVE status** — Confirm `get_status() === "ACTIVE"`
5. **Resume operations** — Resume normal protocol operations

## For Operators (Running a Keeper)

The keeper script periodically calls `health_check()` to keep the circuit breaker state fresh:

```bash
# Environment variables
KEEPER_PRIVATE_KEY=0x...          # Required: keeper account private key
KEEPER_INTERVAL_MS=300000         # Optional: interval in ms (default 5 min)
VITE_RPC_URL=https://rpc-bradbury.genlayer.com
VITE_CONTRACT_ADDRESS=0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000

# Run
npm run keeper
```

Or deploy the GitHub Actions workflow from `.github/workflows/keeper.yml`.

## Cross-Contract Integration (Advanced)

If you're building another Intelligent Contract that needs to check Sentinel status:

```python
# In your GenLayer Intelligent Contract
from genlayer import *

class YourProtocol(gl.Contract):
    sentinel_address: Address
    
    def __init__(self, sentinel: Address):
        self.sentinel = sentinel
    
    @gl.public.write
    def critical_operation(self, params: str) -> str:
        # Call Sentinel's get_status view method
        sentinel_contract = gl.Contract(self.sentinel, [
            {"name": "get_status", "type": "function", "stateMutability": "view", "inputs": [], "outputs": [{"type": "string"}]}
        ])
        
        status = sentinel_contract.get_status()
        
        if status == "PAUSED":
            raise gl.vm.UserError("Sentinel circuit breaker active")
        
        # Proceed with your operation
        return "operation executed"
```

**Note:** Cross-contract view calls in GenLayer are possible but the exact syntax depends on the GenLayer SDK version. Verify with current documentation.

## Configuration for Your Service

### 1. Configure Monitored URL (Owner Only)

```typescript
// As contract owner
await contract.write.set_monitored_url("https://your-service.com/status");
```

### 2. Supported Status Formats

Your status endpoint should return one of these formats:

**GitHub Status API:**
```json
{
  "status": {
    "indicator": "none"
  }
}
```

**Simple State:**
```json
{
  "state": "operational"
}
```

**Aggregate State:**
```json
{
  "aggregate_state": "major_outage"
}
```

**Health Check:**
```json
{
  "health": "healthy"
}
```

### Operational Indicators (return `false` = operational):
- `none`, `operational`, `ok`, `healthy`, `up`, `online`

### Degraded Indicators (return `true` = degraded):
- `degraded`, `major_outage`, `major`, `outage`, `down`, `critical`, `unavailable`, `incident`, `error`, `failed`

### Unknown Formats
Any unrecognized format defaults to **degraded** (fail-closed behavior).

## Security Considerations

1. **Owner Key Security** — The owner can change the monitored URL and unpause. Use a multisig in production.
2. **Verdict Staleness** — The contract doesn't check verdict age on-chain. Monitor `last_check_timestamp` off-chain.
3. **Owner URL Manipulation** — Owner can point to a controlled endpoint. Use multisig/governance in production.
4. **No Rate Limiting** — Anyone can call `health_check()` unlimited times.
5. **Consensus Failure** — If validators disagree, state doesn't change (safe but may delay detection).

## Mock Endpoints for Testing

For local development, use the mock endpoints:

```typescript
// Healthy (operational)
"https://your-domain.com/mock/healthy.json"
// {"status": {"indicator": "none"}}

// Degraded (major outage)
"https://your-domain.com/mock/degraded.json"
// {"status": {"indicator": "major"}}

// Unknown format (fail-closed → degraded)
"https://your-domain.com/mock/unknown.json"
// {"unknown_field": "not recognized"}
```

## Support

- **Contract Explorer:** https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
- **GenLayer Docs:** https://docs.genlayer.com
- **Contract Source:** https://github.com/MIKI4222/genlayer-emergency-circuit-breaker