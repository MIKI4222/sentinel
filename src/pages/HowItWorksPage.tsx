import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe,
  Users,
  Lock,
  Shield,
  CheckCircle,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "User Submits Health Check",
      description:
        "A user (or automated system) calls the health_check() function on the Sentinel Intelligent Contract. This initiates a GenLayer transaction that will be processed by the validator network.",
      icon: Zap,
      details: [
        "Transaction submitted to GenLayer mempool",
        "EVM includes transaction in a block",
        "Intelligent Contract queued for execution",
        "Nondeterministic execution begins",
      ],
    },
    {
      number: "02",
      title: "Intelligent Contract Fetches External Data",
      description:
        "Inside a nondeterministic block, the contract uses gl.nondet.web.get() to fetch live data from the monitored endpoint. Each validator independently performs this HTTP request.",
      icon: Globe,
      details: [
        "gl.nondet.web.get(monitored_url) executed",
        "Each validator fetches independently",
        "Raw HTTP response received",
        "Response decoded from UTF-8",
      ],
    },
    {
      number: "03",
      title: "Validators Independently Execute Classification",
      description:
        "Each validator runs the classify_status_response() function locally on the fetched response. This reduces the raw HTTP response to a canonical boolean: false = operational, true = degraded/unavailable/unknown.",
      icon: Users,
      details: [
        "JSON response parsed",
        "Status indicator extracted",
        "Normalized against known values",
        "Boolean result produced",
        "Fail-closed on parse errors",
      ],
    },
    {
      number: "04",
      title: "Equivalence Principle Evaluates Results",
      description:
        "The Equivalence Principle (gl.eq_principle.strict_eq) compares the boolean results from all validators. Validators must agree on the exact boolean value for consensus to be reached.",
      icon: Lock,
      details: [
        "strict_eq(read_and_classify) invoked",
        "Boolean results compared across validators",
        "Exact match required for acceptance",
        "Dynamic content handled gracefully",
      ],
    },
    {
      number: "05",
      title: "Consensus Decides",
      description:
        "If validators reach strict equivalence on the boolean result, the decision is accepted. If they disagree, the transaction is not accepted as a normal state transition.",
      icon: CheckCircle,
      details: [
        "Accepted: state changes applied",
        "Rejected: no state changes",
        "Appeal window opens",
        "Finality after challenge period",
      ],
    },
    {
      number: "06",
      title: "Contract State Changes",
      description:
        "After consensus, the contract updates its state: last_verdict, last_check_timestamp, incident_count, is_paused, and last_checked_url. The pause activates if incident_count >= pause_threshold.",
      icon: Shield,
      details: [
        "last_verdict updated (operational/degraded)",
        "last_check_timestamp set",
        "incident_count incremented if degraded",
        "is_paused set if threshold reached",
        "last_checked_url bound to verdict",
      ],
    },
    {
      number: "07",
      title: "Protected Operation Follows State",
      description:
        "When execute_guarded_action() is called, the contract checks is_paused. If ACTIVE, the operation executes and guarded_action_count increments. If PAUSED, the operation is rejected with 'circuit breaker is active'.",
      icon: ArrowRight,
      details: [
        "is_paused checked on every call",
        "ACTIVE: operation executes normally",
        "PAUSED: operation rejected",
        "guarded_action_count tracks successes",
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8">
      <section className="text-center">
        <Badge variant="info" className="mb-6 inline-flex items-center gap-2">
          <Zap className="h-3 w-3" />
          GenLayer Intelligent Contract Flow
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold text-sentinel-text tracking-tight mb-6 text-balance">
          How Sentinel Works
        </h1>
        <p className="text-lg text-sentinel-textMuted max-w-2xl mx-auto text-balance">
          Sentinel uses GenLayer's unique ability to fetch live web data through decentralized validator consensus.
          Here's the complete flow from health check to protected operation.
        </p>
      </section>

      <section className="space-y-8">
        {steps.map((step) => (
          <Card key={step.number} variant="hover" className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sentinel-accent to-sentinel-info" />
            <div className="flex gap-6 p-6">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-2xl font-bold font-mono text-sentinel-accent">{step.number}</div>
                <div className="h-20 w-px bg-sentinel-border mx-auto mt-4 hidden lg:block" />
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-accent/15 flex-shrink-0">
                    <step.icon className="h-6 w-6 text-sentinel-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-sentinel-text mb-2">{step.title}</h2>
                    <p className="text-sentinel-textMuted mb-4">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.details.map((detail, i) => (
                        <Badge key={i} variant="neutral" className="text-xs">
                          {detail}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">Key Concepts</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Nondeterministic Execution",
              description:
                "GenLayer allows contracts to perform nondeterministic operations like HTTP requests. Each validator executes independently, producing potentially different results.",
              icon: Zap,
            },
            {
              title: "Equivalence Principle",
              description:
                "Instead of requiring byte-for-byte equality (impossible for dynamic web content), validators agree on a canonical boolean decision. This is the core innovation enabling web data consensus.",
              icon: Lock,
            },
            {
              title: "Fail-Closed Design",
              description:
                "Any error—network failure, invalid JSON, unknown status format, unexpected indicator—defaults to 'degraded' (true). Safety is prioritized over availability.",
              icon: Shield,
            },
            {
              title: "Verdict Binding",
              description:
                "Each verdict is cryptographically bound to the exact URL that was checked. Changing the monitored URL invalidates previous verdicts, preventing stale verdicts from clearing incidents.",
              icon: Globe,
            },
          ].map((concept) => (
            <Card key={concept.title} variant="hover">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/15 mb-4">
                <concept.icon className="h-5 w-5 text-sentinel-accent" />
              </div>
              <h3 className="text-lg font-semibold text-sentinel-text mb-2">{concept.title}</h3>
              <p className="text-sentinel-textMuted text-sm">{concept.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">Recovery Flow</h2>
        <p className="text-sentinel-textMuted mb-8 max-w-2xl">
          A critical security property: a healthy service does NOT automatically clear the pause. Recovery requires explicit steps:
        </p>
        <div className="space-y-4">
          {[
            "Service recovers externally (e.g., GitHub status returns to operational)",
            "Owner runs fresh health_check() → validators confirm operational",
            "Contract state: last_verdict = 'operational', but is_paused = true",
            "Owner calls emergency_unpause() → contract verifies: owner + operational verdict + current URL match",
            "Contract sets is_paused = false → system returns to ACTIVE",
            "Protected operations can now execute again",
          ].map((step, i) => (
            <Card key={i} variant="hover" className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-accent/15 flex-shrink-0">
                <span className="font-mono text-sm text-sentinel-accent">{i + 1}</span>
              </div>
              <p className="text-sentinel-text text-sm">{step}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center pt-8">
        <Link to="/architecture">
          <Button variant="secondary" size="lg" className="flex items-center gap-2 mx-auto">
            View Technical Architecture
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}