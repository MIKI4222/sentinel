# Sentinel — Projects submission

## What it does

A public read dashboard and wallet-operated circuit-breaker demo on GenLayer Bradbury. Validators independently fetch a status source, classify its body, and reach consensus on a canonical boolean. Accepted degraded checks pause the guarded demo method. The frontend distinguishes execution success, UserError rejection, no consensus, unknown status, acceptance and actual finalization.

## Problem it solves

A single off-chain monitor or oracle can lie about a dependency's state, and callers may voluntarily ignore client warnings. Sentinel demonstrates moving the decision and enforcement into an Intelligent Contract. It still trusts the endpoint's published data and the owner's source selection; it is not a production integration for unrelated protocols.

## Why GenLayer

Independent validator web execution plus `strict_eq` rather than one trusted monitoring server. The deployed classifier is JSON parsing, not improved LLM output. Default input is the live GitHub Status API; public mock JSON is explicitly test data.

## Contract

- EmergencyCircuitBreaker: `0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000`
- Bradbury, chain ID 4221
- Explorer: https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
- Source: https://github.com/MIKI4222/genlayer-emergency-circuit-breaker/blob/main/contract.py
- Frontend source: https://github.com/MIKI4222/sentinel
- Contract is fixed; this work changes frontend/scripts/docs only.

## How to use

**User:** open Dashboard without a wallet, inspect evidence, connect and run a health check, then test a guarded action. A paused action is expected to reject.

**Operator:** set public Vercel environment, ensure endpoint access from validators, fund a dedicated keeper account, put its key in an environment/Actions secret, opt in to checks. For recovery, use the owner's wallet to check the current endpoint and unpause after operational evidence.

**Integrator:** read status and verdict through SDK `readContract`; see INTEGRATION.md. A client read is not atomic enforcement. This deployed guarded method is only a demo counter.

## Live demo

https://sentinel-lake-omega.vercel.app/ — supplied by the project owner. Public availability and the corrected deployment are not verified in this offline run. Confirm direct `/dashboard` navigation and `/mock/*.json` access. Disable Production Deployment Protection if Vercel redirects to login.

## Test evidence

Owner Windows checks passed: strict typecheck, zero-warning lint, 86 Vitest tests in 10 files, and production build (with a 529.01 kB SDK chunk warning). smoke-read returned all seven views and verify-contract printed MATCH. One real health_check was accepted; receipt parser returned accepted-return. Hash: 0xfe0e80d00e81b7f004fa61532963b4dd013ec7df4b47ccb7b2eb303f500b2656. Finalization and paused-action rejection have not been observed. See TEST_PLAN.md and IMPLEMENTATION_REPORT.md for evidence and remaining gaps. Portal compliance is a submission goal, not a guarantee of portal approval.

## Known limitations

1. GitHub Statuspage `minor` is not a recognized indicator. A standard response containing only this status is classified as degraded through fail-closed.
2. Empty bodies, invalid JSON and unknown formats classify as degraded. The response HTTP status code is not checked.
3. `health_check` uses `gl.eq_principle.strict_eq` on the boolean result. Failure to reach consensus does not apply the check's state changes and does NOT enable the pause. Other concurrent transactions can still change state.
4. Anyone may call `health_check`, with no contract rate limit.
5. Neither `execute_guarded_action` nor `emergency_unpause` checks verdict age. Useful live protection requires regular checks. ACTIVE can also be the initial never-checked state.
6. The owner can replace the monitored URL with a controlled endpoint, obtain an operational verdict and unpause. Decentralized validation does not remove this source-selection trust.
7. `incident_count` is cumulative, not consecutive; operational checks do not reset it. The constructor fixes `pause_threshold=1` and `fail_closed=true`; neither is configurable through the deployed public interface.
8. The guarded operation is a demonstration counter and returned string, not a real protocol action. This deployment does not protect an unrelated external transaction automatically.

UI freshness, cooldown and HTTPS input validation are not enforced by the contract. Source selection remains owner-controlled. Regular checks are necessary; no-consensus is not fail-safe pausing.
