# Sentinel End-to-End Test Plan

This document describes the manual test plan for validating Sentinel on GenLayer Bradbury testnet.

## Prerequisites

- MetaMask or compatible wallet installed
- GenLayer Bradbury network configured in wallet
- GEN tokens for gas (available from Bradbury faucet)
- Access to https://explorer-bradbury.genlayer.com

## Contract Information

- **Address:** `0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000`
- **Network:** GenLayer Bradbury (Chain ID: 4221)
- **RPC:** https://rpc-bradbury.genlayer.com
- **Explorer:** https://explorer-bradbury.genlayer.com

## Test Scenarios

### Test 1: Connect Wallet
**Objective:** Verify wallet connection and network detection

**Steps:**
1. Open Sentinel at http://localhost:5173 (or deployed URL)
2. Click "Connect Wallet"
3. Approve connection in MetaMask
4. Verify dashboard shows connected address
5. Verify network badge shows "GenLayer Bradbury"

**Expected:**
- Wallet connects successfully
- Address displayed in sidebar
- Correct network detected
- Contract state loads

---

### Test 2: Read Contract Status
**Objective:** Verify contract read methods work

**Steps:**
1. Navigate to Dashboard
2. Observe System Status card
3. Verify status shows "ACTIVE" or "PAUSED"
4. Check Monitored Endpoint shows GitHub Status API
5. Check Latest Verdict, Last Check, Incident Count, Protected Operations

**Expected:**
- All contract state values display correctly
- No console errors
- Data matches explorer

---

### Test 3: Read Monitored URL
**Objective:** Verify get_monitored_url() returns correct value

**Steps:**
1. Navigate to Monitor page
2. Verify Current Endpoint shows `https://www.githubstatus.com/api/v2/status.json`
3. Check Last Verdict and Last Check timestamp

**Expected:**
- URL matches default
- Verdict and timestamp display correctly

---

### Test 4: Run Health Check (Healthy)
**Objective:** Execute health_check() against operational endpoint

**Steps:**
1. Ensure monitored URL is GitHub Status API (default)
2. Click "Run Health Check" on Dashboard
3. Approve transaction in wallet
4. Observe Transaction Modal lifecycle:
   - Wallet Confirmation
   - Submitted
   - EVM Inclusion
   - GenLayer Processing
   - Consensus
   - Decision Reached
   - Finalizing
   - Finalized
5. Wait for finalization
6. Verify contract state refreshes
7. Check Last Verdict = "Operational"
8. Check Status = "ACTIVE"

**Expected:**
- Transaction completes through all stages
- Final verdict: Operational
- System remains ACTIVE
- Transaction hash links to explorer

**Record Transaction Hash:** `0x...`

---

### Test 5: Verify Transaction Lifecycle
**Objective:** Confirm GenLayer transaction lifecycle tracking

**Steps:**
1. During Test 4, observe Transaction Modal
2. Verify each stage activates in order
3. Verify "Current" badge moves through stages
4. Verify explorer link works after finalization
5. Check Activity page shows transaction

**Expected:**
- All 8 stages displayed
- Real-time stage progression
- Explorer link opens correct transaction
- Activity history persists

---

### Test 6: Verify Final Contract State
**Objective:** Confirm on-chain state matches UI

**Steps:**
1. After Test 4, open Bradbury Explorer
2. Navigate to contract address
3. Call view methods:
   - `get_status()` → "ACTIVE"
   - `get_last_verdict()` → "operational"
   - `get_incident_count()` → 0 (or previous count)
   - `get_last_check_timestamp()` → recent timestamp
4. Compare with Dashboard values

**Expected:**
- All values match exactly
- Timestamp is recent (within minutes)

---

### Test 7: Execute Protected Action (Active)
**Objective:** Verify protected operations work when ACTIVE

**Steps:**
1. Ensure system is ACTIVE (Test 4 passed)
2. Navigate to Protected Action page
2. Enter action description: "Test deployment"
3. Click "Execute Protected Action"
4. Approve transaction in wallet
5. Wait for finalization
6. Verify success message
7. Check Guarded Action Count increments

**Expected:**
- Transaction succeeds
- Returns "guarded action executed: Test deployment"
- Guarded Action Count increases by 1

**Record Transaction Hash:** `0x...`

---

### Test 8: Change Monitored URL (Owner)
**Objective:** Verify owner can change endpoint

**Steps:**
1. Ensure connected wallet is contract owner (deployer)
2. Navigate to Monitor page
3. Enter new URL: `https://httpbin.org/status/503`
4. Click "Update Endpoint"
5. Approve transaction in wallet
6. Wait for finalization
7. Verify Current Endpoint updated
8. Verify Last Verdict reset to "Not Checked"
9. Verify Last Checked URL cleared

**Expected:**
- URL changes successfully
- Previous verdict invalidated
- System status may remain ACTIVE (URL change doesn't auto-pause)

**Record Transaction Hash:** `0x...`

---

### Test 9: Trigger Degraded Source
**Objective:** Verify circuit breaker activates on degraded endpoint

**Steps:**
1. Ensure monitored URL is `https://httpbin.org/status/503` (from Test 8)
2. Run Health Check (Dashboard)
3. Approve transaction
4. Wait for finalization
5. Verify Last Verdict = "Degraded"
6. Verify Status = "PAUSED"
7. Verify Incident Count increments

**Expected:**
- Consensus returns degraded
- Circuit breaker activates (PAUSED)
- Incident count increases

**Record Transaction Hash:** `0x...`

---

### Test 10: Verify PAUSED State
**Objective:** Confirm system correctly shows PAUSED

**Steps:**
1. After Test 9, check Dashboard
2. System Status shows "PAUSED" with red badge
3. Protected Action page shows "Protection Active"
4. Incident Count > 0

**Expected:**
- Clear visual indication of PAUSED state
- Explanation shown to user

---

### Test 11: Verify Protected Action Blocked
**Objective:** Confirm operations blocked when PAUSED

**Steps:**
1. Navigate to Protected Action page
2. Enter action description: "Emergency deployment"
3. Click "Execute Protected Action" (should be disabled or show blocked)
4. If button active, approve transaction
5. Verify rejection with "circuit breaker is active"

**Expected:**
- Button shows "Blocked by Circuit Breaker" or disabled
- If transaction submitted, reverts with correct error
- No state changes (guarded_action_count unchanged)

---

### Test 12: Restore Healthy Source
**Objective:** Change URL back to operational endpoint

**Steps:**
1. Navigate to Monitor page
2. Enter URL: `https://www.githubstatus.com/api/v2/status.json`
3. Click "Update Endpoint"
4. Approve transaction
5. Wait for finalization
6. Verify Current Endpoint restored
7. Verify Last Verdict = "Not Checked"

**Expected:**
- URL restored to GitHub Status
- Verdict invalidated (requires fresh check)

**Record Transaction Hash:** `0x...`

---

### Test 13: Run Fresh Health Check
**Objective:** Verify fresh check returns operational

**Steps:**
1. Run Health Check (Dashboard)
2. Approve transaction
3. Wait for finalization
4. Verify Last Verdict = "Operational"
5. **Critical:** Verify Status STILL = "PAUSED" (no auto-recovery)

**Expected:**
- Fresh operational verdict obtained
- System remains PAUSED (security invariant)
- Incident count preserved

**Record Transaction Hash:** `0x...`

---

### Test 14: Recover Service (Owner)
**Objective:** Verify owner can recover via emergency_unpause()

**Steps:**
1. Ensure connected wallet is contract owner
2. Navigate to Recovery page
3. Verify Recovery Checklist shows:
   - ✓ Current Endpoint
   - ✓ Fresh Health Check
   - ✓ Operational Consensus
   - ✓ Connected Owner Wallet
4. Click "Recover Service"
5. Approve transaction in wallet
6. Wait for finalization
7. Verify Status = "ACTIVE"

**Expected:**
- Recovery succeeds only when all conditions met
- System returns to ACTIVE
- Incident count preserved

**Record Transaction Hash:** `0x...`

---

### Test 15: Execute Protected Action After Recovery
**Objective:** Verify full cycle works after recovery

**Steps:**
1. Navigate to Protected Action page
2. Enter action description: "Post-recovery deployment"
3. Click "Execute Protected Action"
4. Approve transaction
5. Wait for finalization
6. Verify success
7. Check Guarded Action Count increments

**Expected:**
- Protected operation executes normally
- Full cycle demonstrated: ACTIVE → PAUSED → ACTIVE

**Record Transaction Hash:** `0x...`

---

## Additional Tests

### Test 16: Non-Owner Cannot Change URL
**Steps:**
1. Connect non-owner wallet
2. Attempt to change monitored URL
3. Verify rejection: "only owner can change monitored URL"

### Test 17: Non-Owner Cannot Recover
**Steps:**
1. Connect non-owner wallet
2. Attempt emergency_unpause()
3. Verify rejection: "only owner can unpause"

### Test 18: Recovery Without Operational Verdict Fails
**Steps:**
1. Set URL to degraded endpoint
2. Don't run health check
3. Attempt emergency_unpause() as owner
4. Verify rejection: "operational health check required"

### Test 19: Recovery With URL Mismatch Fails
**Steps:**
1. Run health check on URL A (operational)
2. Change URL to B
3. Attempt emergency_unpause() as owner
4. Verify rejection: "operational verdict belongs to another URL"

### Test 20: Activity Page Shows History
**Steps:**
1. Navigate to Activity page
2. Verify all test transactions appear
3. Filter by status (success/error/pending)
4. Search by operation name
5. Click explorer links

---

## Test Results Template

| Test | Status | Transaction Hash | Notes |
|------|--------|------------------|-------|
| 1. Connect Wallet | ☐ Pass / ☐ Fail | N/A | |
| 2. Read Contract Status | ☐ Pass / ☐ Fail | N/A | |
| 3. Read Monitored URL | ☐ Pass / ☐ Fail | N/A | |
| 4. Health Check (Healthy) | ☐ Pass / ☐ Fail | `0x...` | |
| 5. Transaction Lifecycle | ☐ Pass / ☐ Fail | N/A | |
| 6. Verify Final State | ☐ Pass / ☐ Fail | N/A | |
| 7. Protected Action (Active) | ☐ Pass / ☐ Fail | `0x...` | |
| 8. Change URL (Owner) | ☐ Pass / ☐ Fail | `0x...` | |
| 9. Health Check (Degraded) | ☐ Pass / ☐ Fail | `0x...` | |
| 10. Verify PAUSED | ☐ Pass / ☐ Fail | N/A | |
| 11. Action Blocked | ☐ Pass / ☐ Fail | `0x...` (if any) | |
| 12. Restore Healthy URL | ☐ Pass / ☐ Fail | `0x...` | |
| 13. Fresh Health Check | ☐ Pass / ☐ Fail | `0x...` | |
| 14. Recover Service | ☐ Pass / ☐ Fail | `0x...` | |
| 15. Action After Recovery | ☐ Pass / ☐ Fail | `0x...` | |
| 16. Non-Owner URL Change | ☐ Pass / ☐ Fail | N/A | |
| 17. Non-Owner Recovery | ☐ Pass / ☐ Fail | N/A | |
| 18. Recovery No Verdict | ☐ Pass / ☐ Fail | N/A | |
| 19. Recovery URL Mismatch | ☐ Pass / ☐ Fail | N/A | |
| 20. Activity History | ☐ Pass / ☐ Fail | N/A | |

---

## Known Issues / Limitations

- Transaction finality on Bradbury may take 30-60 seconds
- Explorer may not immediately show GenLayer transaction details
- Wallet must be on Bradbury network (auto-switch supported)
- Owner address is deployer; non-owner wallets cannot test owner-only functions

---

## Sign-Off

**Tester:** ________________

**Date:** ________________

**Environment:** Bradbury Testnet / Local Dev

**All Critical Tests Passed:** ☐ Yes / ☐ No