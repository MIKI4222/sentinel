# Integration with the fixed Sentinel deployment

## Reading evidence from TypeScript

This example matches the installed genlayer-js 1.1.8 types. No ethers or ABI wrapper is required.

```ts
import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
const client = createClient({ chain: testnetBradbury, endpoint: 'https://rpc-bradbury.genlayer.com' });
const address = '0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000' as const;
const [status, verdict] = await Promise.all([
  client.readContract({ address, functionName: 'get_status', args: [] }),
  client.readContract({ address, functionName: 'get_last_verdict', args: [] }),
]);
if (status !== 'ACTIVE' && status !== 'PAUSED') throw new Error('Unexpected status');
if (!['not_checked', 'operational', 'degraded'].includes(String(verdict))) throw new Error('Unexpected verdict');
console.log({ status, verdict });
```

SDK 1.1.8 defaults to latest-nonfinal reads. Acceptance is not finality; use an explicit transaction-hash variant when an integration needs finalized evidence. Read last checked URL and timestamp too. Frontend normalization rejects unsafe integer values instead of silently losing bigint precision.

## What is actually protected

The contract checks `is_paused` inside `execute_guarded_action`; the demo increments a counter and returns a string. A frontend `get_status()` check followed by an unrelated transaction is **not** the primary protection and is not atomic. The unchanged deployed contract cannot be made to guard an unrelated production method through frontend code alone.

A real downstream design would need contract-level atomic enforcement and an explicit policy for absent/stale verdicts and source trust. No new Sentinel deployment or change is proposed as part of this repair.

## Cross-contract calls

A precise cross-contract call syntax has not been verified against official documentation in this run. No runnable Intelligent Contract example is provided. Validate the supported cross-contract read mechanism, caller semantics, atomicity and finality against current GenLayer documentation before implementation: **not verified**.

## Operational interpretation

- ACTIVE does not guarantee a recent check, nor even a first check.
- An operational verdict is bound to its checked URL, not time-limited by the contract.
- No-consensus applies no check state change; it does not switch to PAUSED.
- The owner controls source selection and recovery.
- Only the seven listed views exist. There is no owner/threshold/fail-closed/safe-to-execute getter.
- The frontend's HTTPS-only validation and stale indicator are not contract guarantees.

See README.md for all deployed limitations and TEST_PLAN.md for real-network verification.
