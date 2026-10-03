import {
  Server,
  Globe,
  Users,
  Lock,
  Shield,
  Database,
  Cpu,
  Network,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export function ArchitecturePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8">
      <section className="text-center">
        <Badge variant="info" className="mb-6 inline-flex items-center gap-2">
          <Zap className="h-3 w-3" />
          Technical Architecture
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold text-sentinel-text tracking-tight mb-6 text-balance">
          System Architecture
        </h1>
        <p className="text-lg text-sentinel-textMuted max-w-2xl mx-auto text-balance">
          Deep dive into the Sentinel architecture: how GenLayer Intelligent Contracts achieve decentralized consensus on live external data.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">High-Level Architecture</h2>
        <Card variant="default" className="p-8">
          <div className="space-y-6 font-mono text-sm">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px]">
                <Server className="h-8 w-8 text-sentinel-accent mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">User / dApp</div>
                <div className="text-xs text-sentinel-textMuted">Initiates health check</div>
              </div>
              <ArrowRight className="text-sentinel-border flex-shrink-0" />
              <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px]">
                <Globe className="h-8 w-8 text-sentinel-info mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">Sentinel Frontend</div>
                <div className="text-xs text-sentinel-textMuted">React + genlayer-js</div>
              </div>
              <ArrowRight className="text-sentinel-border flex-shrink-0" />
              <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px]">
                <Cpu className="h-8 w-8 text-sentinel-warning mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">GenLayer Intelligent Contract</div>
                <div className="text-xs text-sentinel-textMuted">EmergencyCircuitBreaker</div>
              </div>
            </div>

            <ArrowDown className="text-sentinel-border mx-auto h-8 w-8" />

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px]">
                <Network className="h-8 w-8 text-sentinel-accent mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">nondeterministic web</div>
                <div className="text-xs text-sentinel-textMuted">gl.nondet.web.get()</div>
              </div>
              <ArrowRight className="text-sentinel-border flex-shrink-0" />
              <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px]">
                <Globe className="h-8 w-8 text-sentinel-info mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">External Status API</div>
                <div className="text-xs text-sentinel-textMuted">GitHub Status / Custom</div>
              </div>
            </div>

            <ArrowDown className="text-sentinel-border mx-auto h-8 w-8" />

            <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px] mx-auto">
              <Users className="h-8 w-8 text-sentinel-warning mx-auto mb-2" />
              <div className="font-medium text-sentinel-text">Independent Validators</div>
              <div className="text-xs text-sentinel-textMuted">Each fetches & classifies independently</div>
            </div>

            <ArrowDown className="text-sentinel-border mx-auto h-8 w-8" />

            <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px] mx-auto">
              <Lock className="h-8 w-8 text-sentinel-accent mx-auto mb-2" />
              <div className="font-medium text-sentinel-text">Equivalence Principle</div>
              <div className="text-xs text-sentinel-textMuted">strict_eq(boolean_result)</div>
            </div>

            <ArrowDown className="text-sentinel-border mx-auto h-8 w-8" />

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center p-4 bg-sentinel-accent/10 border border-sentinel-accent/30 rounded-lg min-w-[160px]">
                <CheckCircle className="h-8 w-8 text-sentinel-accent mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">Consensus Reached</div>
                <div className="text-xs text-sentinel-textMuted">State changes applied</div>
              </div>
              <ArrowRight className="text-sentinel-border flex-shrink-0" />
              <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px]">
                <Database className="h-8 w-8 text-sentinel-info mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">On-Chain State</div>
                <div className="text-xs text-sentinel-textMuted">ACTIVE / PAUSED</div>
              </div>
              <ArrowRight className="text-sentinel-border flex-shrink-0" />
              <div className="text-center p-4 bg-sentinel-bg rounded-lg border border-sentinel-border min-w-[160px]">
                <Shield className="h-8 w-8 text-sentinel-warning mx-auto mb-2" />
                <div className="font-medium text-sentinel-text">Protected Operation</div>
                <div className="text-xs text-sentinel-textMuted">execute_guarded_action()</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Deterministic vs Nondeterministic</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="hover" className="border-l-4 border-sentinel-accent">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-sentinel-accent" />
              Deterministic (On-Chain)
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "State storage (is_paused, incident_count, etc.)",
                "Owner address and permissions",
                "pause_threshold and fail_closed config",
                "guarded_action_count increment",
                "emergency_unpause() authorization check",
                "URL equality check (last_checked_url === monitored_url)",
                "Verdict string comparison (operational/degraded)",
                "Event emission",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-sentinel-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sentinel-textMuted">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card variant="hover" className="border-l-4 border-sentinel-warning">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-sentinel-warning" />
              Nondeterministic (Off-Chain → Consensus)
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "HTTP GET request to monitored URL",
                "Raw response body retrieval",
                "JSON parsing of response",
                "Status indicator extraction",
                "String normalization & classification",
                "Boolean result: operational vs degraded",
                "Equivalence Principle comparison",
                "Consensus decision acceptance",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-sentinel-warning flex-shrink-0 mt-0.5" />
                  <span className="text-sentinel-textMuted">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Health Check Transaction Lifecycle</h2>
        <div className="space-y-4">
          {[
            { stage: "1. Wallet Confirmation", description: "User signs transaction in wallet (MetaMask, etc.)", type: "evm" },
            { stage: "2. EVM Inclusion", description: "Transaction included in GenLayer block", type: "evm" },
            { stage: "3. GenLayer Queue", description: "Intelligent Contract queued for execution", type: "genlayer" },
            { stage: "4. Leader Selection", description: "Validator selected as leader for this transaction", type: "genlayer" },
            { stage: "5. Nondeterministic Execution", description: "Leader executes gl.nondet.web.get() and classification", type: "nondet" },
            { stage: "6. Validator Execution", description: "Other validators independently execute same code", type: "nondet" },
            { stage: "7. Equivalence Check", description: "strict_eq() compares boolean results across validators", type: "consensus" },
            { stage: "8. Consensus Decision", description: "Accepted if all validators agree on boolean", type: "consensus" },
            { stage: "9. State Commit", description: "Contract state updated (verdict, timestamp, pause)", type: "genlayer" },
            { stage: "10. Appeal Window", description: "Challenge period for disputed decisions", type: "finality" },
            { stage: "11. Finality", description: "Decision becomes immutable after finality window", type: "finality" },
          ].map((item, i) => (
            <Card key={i} variant="hover" className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                item.type === "evm" ? "bg-sentinel-info/15 text-sentinel-info" :
                item.type === "genlayer" ? "bg-sentinel-accent/15 text-sentinel-accent" :
                item.type === "nondet" ? "bg-sentinel-warning/15 text-sentinel-warning" :
                item.type === "consensus" ? "bg-sentinel-accent/15 text-sentinel-accent" :
                "bg-sentinel-danger/15 text-sentinel-danger"
              }`}>
                <span className="font-mono text-sm">{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sentinel-text">{item.stage}</p>
                <p className="text-sm text-sentinel-textMuted">{item.description}</p>
              </div>
              <Badge variant={
                item.type === "evm" ? "info" :
                item.type === "genlayer" ? "active" :
                item.type === "nondet" ? "warning" :
                item.type === "consensus" ? "active" :
                "paused"
              } className="text-xs">
                {item.type.toUpperCase()}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Security Invariants</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Invariant 1: Pause Blocks Operations",
              description: "If is_paused == true, execute_guarded_action() MUST fail with 'circuit breaker is active'",
              severity: "critical",
            },
            {
              title: "Invariant 2: Fail-Closed Default",
              description: "Unknown, malformed, unavailable, or unexpected responses default to degraded (true)",
              severity: "critical",
            },
            {
              title: "Invariant 3: No Auto-Recovery",
              description: "A healthy check does NOT automatically clear an existing pause. Manual recovery required.",
              severity: "high",
            },
            {
              title: "Invariant 4: URL Change Invalidates Verdict",
              description: "Changing monitored_url resets last_verdict to 'not_checked' and clears last_checked_url",
              severity: "high",
            },
            {
              title: "Invariant 5: Owner-Only Recovery",
              description: "Only the contract owner can call emergency_unpause()",
              severity: "critical",
            },
            {
              title: "Invariant 6: Fresh Verdict Required",
              description: "emergency_unpause() requires last_verdict == 'operational' from a recent check",
              severity: "critical",
            },
            {
              title: "Invariant 7: URL Must Match",
              description: "Operational verdict must belong to current monitored_url (last_checked_url === monitored_url)",
              severity: "critical",
            },
            {
              title: "Invariant 8: History Preserved",
              description: "incident_count is never reset by recovery. Permanent record of all incidents.",
              severity: "medium",
            },
            {
              title: "Invariant 9: URL Change ≠ Unpause",
              description: "Changing the monitored URL does not automatically unpause the contract",
              severity: "high",
            },
          ].map((invariant) => (
            <Card key={invariant.title} variant="hover" className={`border-l-4 ${
              invariant.severity === "critical" ? "border-sentinel-danger" :
              invariant.severity === "high" ? "border-sentinel-warning" :
              "border-sentinel-info"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  invariant.severity === "critical" ? "bg-sentinel-danger/15 text-sentinel-danger" :
                  invariant.severity === "high" ? "bg-sentinel-warning/15 text-sentinel-warning" :
                  "bg-sentinel-info/15 text-sentinel-info"
                }`}>
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sentinel-text">{invariant.title}</h3>
                  <p className="text-sm text-sentinel-textMuted mt-1">{invariant.description}</p>
                  <Badge variant={
                    invariant.severity === "critical" ? "paused" :
                    invariant.severity === "high" ? "warning" : "info"
                  } className="mt-2 text-xs">
                    {invariant.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Contract State Model</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sentinel-border">
                <th className="text-left p-3 font-medium text-sentinel-textMuted">Field</th>
                <th className="text-left p-3 font-medium text-sentinel-textMuted">Type</th>
                <th className="text-left p-3 font-medium text-sentinel-textMuted">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentinel-border">
              {[
                ["is_paused", "bool", "Whether guarded operations are blocked"],
                ["last_check_timestamp", "u64", "Unix timestamp of latest consensus check"],
                ["incident_count", "u32", "Total degraded/unknown checks (never reset)"],
                ["monitored_url", "str", "Current external status endpoint"],
                ["owner", "Address", "Deployer address (can change URL, unpause)"],
                ["fail_closed", "bool", "Unknown responses treated as incidents"],
                ["pause_threshold", "u32", "Incidents required to activate breaker (default: 1)"],
                ["last_verdict", "str", "not_checked / operational / degraded"],
                ["last_checked_url", "str", "Exact URL used for last_verdict"],
                ["guarded_action_count", "u32", "Successful protected operations"],
              ].map(([field, type, purpose], i) => (
                <tr key={field} className={i % 2 === 0 ? "bg-sentinel-bg/50" : ""}>
                  <td className="p-3 font-mono text-sentinel-text">{field}</td>
                  <td className="p-3 text-sentinel-textMuted">{type}</td>
                  <td className="p-3 text-sentinel-textMuted">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Public Interface</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="hover">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-sentinel-accent" />
              Write Methods (State-Changing)
            </h3>
            <div className="space-y-3 text-sm">
              {[
                ["set_monitored_url(new_url)", "Owner only. Changes endpoint, invalidates verdict"],
                ["health_check()", "Anyone. Triggers consensus-based health verification"],
                ["execute_guarded_action(action_data)", "Anyone. Executes if ACTIVE, rejects if PAUSED"],
                ["emergency_unpause()", "Owner only. Requires fresh operational verdict + URL match"],
              ].map(([sig, desc], i) => (
                <div key={i} className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
                  <code className="mono text-sentinel-accent">{sig}</code>
                  <p className="text-sentinel-textMuted mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="hover">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-sentinel-info" />
              View Methods (Read-Only)
            </h3>
            <div className="space-y-3 text-sm">
              {[
                ["get_status()", "Returns 'ACTIVE' or 'PAUSED'"],
                ["get_monitored_url()", "Returns current monitored endpoint"],
                ["get_last_verdict()", "Returns 'not_checked' / 'operational' / 'degraded'"],
                ["get_last_checked_url()", "Returns URL bound to last verdict"],
                ["get_incident_count()", "Returns total incident count (u32)"],
                ["get_last_check_timestamp()", "Returns Unix timestamp (u64)"],
                ["get_guarded_action_count()", "Returns successful operations count (u32)"],
              ].map(([sig, desc], i) => (
                <div key={i} className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
                  <code className="mono text-sentinel-info">{sig}</code>
                  <p className="text-sentinel-textMuted mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Deployment Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="hover">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4">Network</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Network</span>
                <span className="font-mono text-sentinel-text">GenLayer Bradbury</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Chain ID</span>
                <span className="font-mono text-sentinel-text">4221</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">RPC</span>
                <span className="font-mono text-sentinel-text truncate max-w-[200px]">https://rpc-bradbury.genlayer.com</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Currency</span>
                <span className="font-mono text-sentinel-text">GEN</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sentinel-textMuted">Explorer</span>
                <span className="font-mono text-sentinel-text truncate max-w-[200px]">https://explorer-bradbury.genlayer.com</span>
              </div>
            </div>
          </Card>

          <Card variant="hover">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4">Contract</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Address</span>
                <span className="font-mono text-sentinel-text">0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Name</span>
                <span className="font-mono text-sentinel-text">EmergencyCircuitBreaker</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Default URL</span>
                <span className="font-mono text-sentinel-text truncate max-w-[200px]">https://www.githubstatus.com/api/v2/status.json</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Fail Closed</span>
                <span className="font-mono text-sentinel-text">true</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sentinel-textMuted">Pause Threshold</span>
                <span className="font-mono text-sentinel-text">1</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}