import {
  FileText,
  Code,
  Shield,
  Globe,
  Users,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function DocsPage() {
  const sections = [
    {
      id: "overview",
      title: "Overview",
      icon: FileText,
      content: `
Sentinel is a decentralized circuit breaker built on GenLayer Intelligent Contracts. It protects critical on-chain operations by verifying the health of external dependencies through decentralized validator consensus.

**Key Features:**
- **Decentralized Verification**: No single oracle or trusted party. GenLayer validators independently fetch and classify external status endpoints.
- **Fail-Closed Design**: Unknown, malformed, or unavailable responses default to "degraded" — safety over availability.
- **Consensus-Backed Decisions**: The Equivalence Principle ensures validators agree on the canonical boolean result before state changes.
- **Verified Recovery**: Recovery requires a fresh operational verdict and explicit owner authorization. No automatic unpausing.
- **On-Chain State**: All decisions recorded immutably on GenLayer. Protected operations read directly from contract state.
      `,
    },
    {
      id: "architecture",
      title: "Architecture",
      icon: Code,
      content: `
See the [Architecture page](/architecture) for a detailed technical breakdown including:
- High-level system diagram
- Deterministic vs nondeterministic execution boundaries
- Transaction lifecycle stages
- Security invariants
- Contract state model
- Public interface (write/view methods)
- Deployment information
      `,
    },
    {
      id: "contract",
      title: "Contract Reference",
      icon: Shield,
      content: `
**Deployed Contract:** \`0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000\` on GenLayer Bradbury (Chain ID: 4221)

**State Variables:**
| Variable | Type | Description |
|----------|------|-------------|
| \`is_paused\` | bool | Whether guarded operations are blocked |
| \`last_check_timestamp\` | u64 | Unix timestamp of latest consensus check |
| \`incident_count\` | u32 | Total degraded/unknown checks (never reset) |
| \`monitored_url\` | str | Current external status endpoint |
| \`owner\` | Address | Deployer address (can change URL, unpause) |
| \`fail_closed\` | bool | Unknown responses treated as incidents |
| \`pause_threshold\` | u32 | Incidents required to activate breaker (default: 1) |
| \`last_verdict\` | str | \`not_checked\` / \`operational\` / \`degraded\` |
| \`last_checked_url\` | str | Exact URL used for last_verdict |
| \`guarded_action_count\` | u32 | Successful protected operations |

**Write Methods:**
\`\`\`python
set_monitored_url(new_url: str) -> bool
health_check() -> bool
execute_guarded_action(action_data: str) -> str
emergency_unpause() -> bool
\`\`\`

**View Methods:**
\`\`\`python
get_status() -> str          # "ACTIVE" or "PAUSED"
get_monitored_url() -> str
get_last_verdict() -> str    # "not_checked" / "operational" / "degraded"
get_last_checked_url() -> str
get_incident_count() -> u32
get_last_check_timestamp() -> u64
get_guarded_action_count() -> u32
\`\`\`
      `,
    },
    {
      id: "health-checks",
      title: "Health Checks",
      icon: Globe,
      content: `
The \`health_check()\` function is the core of Sentinel. When called:

1. **Transaction Submitted**: User signs and submits a GenLayer transaction
2. **Validator Execution**: Each validator independently:
   - Fetches the monitored URL via \`gl.nondet.web.get()\`
   - Parses the JSON response
   - Classifies the status using \`classify_status_response()\`
   - Produces a boolean: \`false\` = operational, \`true\` = degraded
3. **Equivalence Principle**: \`gl.eq_principle.strict_eq()\` compares boolean results across validators
4. **Consensus**: If all validators agree, the decision is accepted
5. **State Update**: Contract updates \`last_verdict\`, \`last_check_timestamp\`, \`incident_count\`, \`is_paused\`, \`last_checked_url\`

**Supported Status Formats:**
- GitHub Status API: \`{"status": {"indicator": "none"}}\`
- Simple state: \`{"state": "operational"}\`
- Aggregate state: \`{"aggregate_state": "major_outage"}\`
- Health check: \`{"health": "healthy"}\`

**Operational Indicators:** none, operational, ok, healthy, up, online
**Degraded Indicators:** degraded, major_outage, major, outage, down, critical, unavailable, incident, error, failed
**Unknown Formats:** Treated as degraded (fail-closed)
      `,
    },
    {
      id: "protected-operations",
      title: "Protected Operations",
      icon: Lock,
      content: `
The \`execute_guarded_action(action_data: str)\` function demonstrates the protection mechanism:

\`\`\`python
@gl.public.write
def execute_guarded_action(self, action_data: str) -> str:
    if self.is_paused:
        raise gl.vm.UserError("circuit breaker is active")
    self.guarded_action_count += u32(1)
    return "guarded action executed: " + action_data
\`\`\`

**Behavior:**
- **ACTIVE**: Operation executes, \`guarded_action_count\` increments, success message returned
- **PAUSED**: Operation rejected with \`"circuit breaker is active"\`, no state changes

**Production Integration:**
Replace \`execute_guarded_action()\` with your actual protocol operation:
- DeFi: Token swap, liquidation, oracle update
- Bridge: Cross-chain transfer, validator set change
- Infrastructure: Configuration deployment, parameter update
- Payment: Settlement, payout, refund
      `,
    },
    {
      id: "incidents",
      title: "Incidents",
      icon: Users,
      content: `
**Incident Tracking:**
- \`incident_count\` increments on every degraded/unknown health check
- Never reset by recovery — permanent audit trail
- \`pause_threshold\` (default: 1) determines when \`is_paused\` activates
- Each incident bound to the exact URL checked (\`last_checked_url\`)

**Incident Lifecycle:**
1. Health check returns degraded → \`incident_count++\`
2. If \`incident_count >= pause_threshold\` → \`is_paused = true\`
3. Protected operations blocked
4. Owner changes URL → verdict invalidated, but \`is_paused\` remains
5. Fresh health check returns operational → \`last_verdict = operational\`
6. Owner calls \`emergency_unpause()\` → \`is_paused = false\`
7. \`incident_count\` preserved
      `,
    },
    {
      id: "recovery",
      title: "Recovery",
      icon: ArrowRight,
      content: `
Recovery is a deliberate, multi-step process — **not automatic**.

**Requirements for \`emergency_unpause()\`:**
1. Caller must be contract \`owner\`
2. \`last_verdict == "operational"\` (fresh check required)
3. \`last_checked_url == monitored_url\` (verdict belongs to current URL)

**Why This Matters:**
- Prevents stale verdicts from clearing incidents
- Ensures current endpoint is actually healthy
- Requires explicit owner action (accountability)
- Incident history preserved for audit

**Recovery Flow:**
\`\`\`
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
\`\`\`
      `,
    },
    {
      id: "transaction-lifecycle",
      title: "Transaction Lifecycle",
      icon: Code,
      content: `
GenLayer transactions have a distinct lifecycle from standard EVM transactions:

**Stages:**
1. **Wallet Confirmation** — User signs in wallet
2. **EVM Inclusion** — Transaction mined in GenLayer block
3. **GenLayer Processing** — Intelligent Contract queued
4. **Consensus** — Validators execute nondeterministic code
5. **Decision** — Equivalence Principle evaluates results
6. **Finalizing** — Appeal/finality window
7. **Finalized** — Immutable, state changes durable

**Frontend Handling:**
- Track transaction ID from submission
- Poll for decision status
- Wait for finality before considering "confirmed"
- Never assume timeout = failure
- Persist transaction IDs in localStorage for recovery

**Important:** An EVM transaction receipt ≠ Intelligent Contract finality. Always verify the GenLayer decision status.
      `,
    },
    {
      id: "security-model",
      title: "Security Model",
      icon: Shield,
      content: `
**Trust Assumptions:**
- GenLayer validator set is honest majority
- Equivalence Principle correctly implements strict equality
- External endpoint is not actively malicious (can be unavailable)
- Contract owner is trusted (or replaced with multisig/governance in production)

**Threat Model:**
| Threat | Mitigation |
|--------|------------|
| Single oracle compromise | Decentralized validator consensus |
| Stale data | Verdict bound to URL, fresh check required |
| Malicious owner | Replace with multisig/timelock/governance |
| Network partition | Fail-closed, validators must agree |
| Response manipulation | Strict equivalence on canonical boolean |
| Automatic recovery | Manual owner action required |

**Production Hardening:**
- Replace owner with multisig (Gnosis Safe) or governance contract
- Add timelock for URL changes
- Monitor incident_count for anomaly detection
- Add alerting on pause activation
- Consider multiple Sentinel instances for different dependencies
      `,
    },
    {
      id: "integration",
      title: "Integration Guide",
      icon: Globe,
      content: `
**1. Deploy or Use Existing Contract**
\`\`\`bash
# Use deployed contract on Bradbury
CONTRACT_ADDRESS=0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000
\`\`\`

**2. Configure Monitored URL**
\`\`\`typescript
// As owner
await contract.set_monitored_url("https://your-service.com/status")
\`\`\`

**3. Integrate Protected Operation**
\`\`\`typescript
// In your protocol contract or backend
const status = await sentinel.get_status()
if (status === "PAUSED") {
  throw new Error("Sentinel circuit breaker active - operation blocked")
}
// Proceed with critical operation
\`\`\`

**4. Monitor & Alert**
\`\`\`typescript
// Poll or use events
setInterval(async () => {
  const status = await sentinel.get_status()
  if (status === "PAUSED") {
    alertOnCall("Sentinel PAUSED - investigate")
  }
}, 60000)
\`\`\`

**5. Recovery Procedure**
Document your runbook:
1. Verify external service is healthy
2. Run \`health_check()\` via Sentinel dashboard
3. Confirm \`last_verdict = operational\`
4. Call \`emergency_unpause()\` as owner
5. Verify \`get_status() = ACTIVE\`
6. Resume operations
      `,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <section className="text-center">
        <Badge variant="info" className="mb-6 inline-flex items-center gap-2">
          <FileText className="h-3 w-3" />
          Documentation
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold text-sentinel-text tracking-tight mb-6 text-balance">
          Sentinel Documentation
        </h1>
        <p className="text-lg text-sentinel-textMuted max-w-2xl mx-auto text-balance">
          Complete developer documentation for integrating and operating Sentinel.
        </p>
      </section>

      <nav className="sticky top-24 hidden lg:block">
        <Card variant="default" className="p-4">
          <h3 className="font-semibold text-sentinel-text mb-3">Contents</h3>
          <ul className="space-y-2 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sentinel-textMuted hover:text-sentinel-accent transition-colors flex items-center gap-2"
                >
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </nav>

      <div className="lg:pr-80 space-y-16">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/15">
                <section.icon className="h-5 w-5 text-sentinel-accent" />
              </div>
              <h2 className="text-2xl font-bold text-sentinel-text">{section.title}</h2>
            </div>
            <Card variant="default" className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sentinel-textMuted leading-relaxed">
                {section.content}
              </div>
            </Card>
          </section>
        ))}
      </div>

      <section className="text-center pt-8 border-t border-sentinel-border">
        <h2 className="text-2xl font-bold text-sentinel-text mb-4">Need More Help?</h2>
        <p className="text-sentinel-textMuted mb-6 max-w-xl mx-auto">
          Check the GenLayer documentation for Intelligent Contract development, or explore the deployed contract on the Bradbury explorer.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://docs.genlayer.com/developers/intelligent-contracts/introduction"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              GenLayer Docs
            </Button>
          </a>
          <a
            href="https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" className="flex items-center gap-2">
              View Contract
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}