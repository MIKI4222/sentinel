import {
  GitBranch,
  Shield,
  Zap,
  Users,
  Globe,
  Lock,
  Heart,
  Code,
  BookOpen,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8">
      <section className="text-center">
        <Badge variant="info" className="mb-6 inline-flex items-center gap-2">
          <Zap className="h-3 w-3" />
          GenLayer Bradbury Testnet
        </Badge>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sentinel-accent/15 mx-auto mb-6">
          <Shield className="h-8 w-8 text-sentinel-accent" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-sentinel-text tracking-tight mb-6 text-balance">
          About Sentinel
        </h1>
        <p className="text-lg text-sentinel-textMuted max-w-2xl mx-auto text-balance">
          Decentralized protection for critical services. Built on GenLayer Intelligent Contracts.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">What is Sentinel?</h2>
        <Card variant="default" className="prose prose-invert max-w-none">
          <p className="text-sentinel-textMuted leading-relaxed">
            Sentinel is an open-source GenLayer application demonstrating how Intelligent Contracts can use decentralized
            validator consensus to make security-relevant decisions about live external data.
          </p>
          <p className="text-sentinel-textMuted leading-relaxed mt-4">
            Modern protocols frequently depend on external infrastructure: APIs, cloud services, RPC endpoints, identity
            providers, payment systems, data providers, bridges, and status endpoints. If a dependency fails, the protocol
            may continue operating with stale or invalid assumptions.
          </p>
          <p className="text-sentinel-textMuted leading-relaxed mt-4">
            A traditional monitoring service introduces another trusted party. Sentinel moves the critical health decision
            into a GenLayer Intelligent Contract, where independent validators fetch live data and reach consensus on the
            operational state before protected operations can continue.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">The Problem</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="hover" className="border-l-4 border-sentinel-danger">
            <h3 className="text-lg font-semibold text-sentinel-text mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-sentinel-danger" />
              Centralized Monitoring
            </h3>
            <p className="text-sentinel-textMuted text-sm">
              Traditional monitoring relies on a single trusted server or oracle. If that party is compromised, goes offline,
              or reports incorrectly, the protocol has no independent verification.
            </p>
          </Card>
          <Card variant="hover" className="border-l-4 border-sentinel-warning">
            <h3 className="text-lg font-semibold text-sentinel-text mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-sentinel-warning" />
              Single Point of Failure
            </h3>
            <p className="text-sentinel-textMuted text-sm">
              A centralized monitor becomes a single point of failure. Network issues, DNS problems, or infrastructure
              outages at the monitor level can cause false positives or missed incidents.
            </p>
          </Card>
          <Card variant="hover" className="border-l-4 border-sentinel-info">
            <h3 className="text-lg font-semibold text-sentinel-text mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-sentinel-info" />
              Trust Assumptions
            </h3>
            <p className="text-sentinel-textMuted text-sm">
              Protocols must trust the monitor operator, their infrastructure, and their incentives. There's no
              cryptographic guarantee that the reported status matches reality.
            </p>
          </Card>
          <Card variant="hover" className="border-l-4 border-sentinel-accent">
            <h3 className="text-lg font-semibold text-sentinel-text mb-3 flex items-center gap-2">
              <Code className="h-5 w-5 text-sentinel-accent" />
              No On-Chain Enforcement
            </h3>
            <p className="text-sentinel-textMuted text-sm">
              Off-chain monitoring can alert, but cannot enforce. The protocol must voluntarily respect the monitor's
              verdict — or build complex oracle infrastructure.
            </p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">The Sentinel Solution</h2>
        <div className="space-y-4">
          {[
            {
              title: "Decentralized Validator Consensus",
              description:
                "GenLayer validators independently fetch the external endpoint. Each runs the classification logic locally. No single party controls the observation.",
              icon: Users,
            },
            {
              title: "Equivalence Principle",
              description:
                "Validators agree on the canonical boolean (operational/degraded), not raw response bytes. Dynamic content like timestamps doesn't break consensus.",
              icon: Lock,
            },
            {
              title: "On-Chain Enforcement",
              description:
                "The consensus decision becomes immutable contract state. Protected operations read directly from the blockchain — no voluntary compliance needed.",
              icon: Shield,
            },
            {
              title: "Fail-Closed by Default",
              description:
                "Unknown, malformed, or unavailable responses default to degraded. Safety is prioritized over availability.",
              icon: Globe,
            },
            {
              title: "Verified Recovery",
              description:
                "A healthy service doesn't automatically clear the pause. Recovery requires fresh consensus + owner authorization. Prevents stale verdicts.",
              icon: Zap,
            },
          ].map((item, i) => (
            <Card key={i} variant="hover" className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/15 flex-shrink-0">
                <item.icon className="h-5 w-5 text-sentinel-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sentinel-text">{item.title}</h3>
                <p className="text-sentinel-textMuted text-sm mt-1">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">Current Deployment</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="hover">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4">Contract</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Address</span>
                <code className="mono text-sentinel-text">0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000</code>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Network</span>
                <span className="font-mono text-sentinel-text">GenLayer Bradbury</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Chain ID</span>
                <span className="font-mono text-sentinel-text">4221</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Default Endpoint</span>
                <code className="mono text-sentinel-text truncate max-w-[200px]">https://www.githubstatus.com/api/v2/status.json</code>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sentinel-textMuted">Explorer</span>
                <a
                  href="https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-sentinel-accent truncate max-w-[200px]"
                >
                  View on Bradbury Explorer
                </a>
              </div>
            </div>
          </Card>

          <Card variant="hover">
            <h3 className="text-lg font-semibold text-sentinel-text mb-4">Repository</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">GitHub</span>
                <a
                  href="https://github.com/MIKI4222/genlayer-emergency-circuit-breaker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-sentinel-accent"
                >
                  MIKI4222/genlayer-emergency-circuit-breaker
                </a>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Contract File</span>
                <code className="mono text-sentinel-text">contract.py</code>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Language</span>
                <span className="font-mono text-sentinel-text">Python (GenLayer)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sentinel-border">
                <span className="text-sentinel-textMuted">Frontend</span>
                <span className="font-mono text-sentinel-text">React + TypeScript + Vite</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sentinel-textMuted">Styling</span>
                <span className="font-mono text-sentinel-text">Tailwind CSS</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">GenLayer Integration</h2>
        <Card variant="default" className="prose prose-invert max-w-none">
          <p className="text-sentinel-textMuted leading-relaxed">
            Sentinel showcases core GenLayer capabilities:
          </p>
          <ul className="space-y-3 text-sentinel-textMuted mt-4">
            <li className="flex items-start gap-2"><Code className="h-4 w-4 text-sentinel-accent flex-shrink-0 mt-0.5" /> <code>gl.nondet.web.get()</code> — Nondeterministic HTTP requests from within the contract</li>
            <li className="flex items-start gap-2"><Code className="h-4 w-4 text-sentinel-accent flex-shrink-0 mt-0.5" /> <code>gl.eq_principle.strict_eq()</code> — Equivalence Principle for consensus on canonical results</li>
            <li className="flex items-start gap-2"><Code className="h-4 w-4 text-sentinel-accent flex-shrink-0 mt-0.5" /> Intelligent Contract execution — Validators independently execute nondeterministic code</li>
            <li className="flex items-start gap-2"><Code className="h-4 w-4 text-sentinel-accent flex-shrink-0 mt-0.5" /> On-chain state — Consensus decisions become immutable contract storage</li>
          </ul>
          <p className="text-sentinel-textMuted leading-relaxed mt-4">
            This is not an AI oracle. GenLayer enables Intelligent Contracts to evaluate outcomes involving live web data
            and other nondeterministic inputs through validator consensus. The contract itself defines how independent
            validators verify a live external observation.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-sentinel-text mb-6">Limitations & Future Work</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="hover" className="border-l-4 border-sentinel-warning">
            <h3 className="text-lg font-semibold text-sentinel-text mb-3">Current Limitations</h3>
            <ul className="space-y-2 text-sm text-sentinel-textMuted">
              <li>• Owner-controlled URL (centralized control point)</li>
              <li>• Demo guarded operation (not real protocol integration)</li>
              <li>• Single endpoint monitoring</li>
              <li>• No multi-sig or governance for recovery</li>
              <li>• Bradbury testnet only (not mainnet)</li>
            </ul>
          </Card>
          <Card variant="hover" className="border-l-4 border-sentinel-accent">
            <h3 className="text-lg font-semibold text-sentinel-text mb-3">Future Extensions</h3>
            <ul className="space-y-2 text-sm text-sentinel-textMuted">
              <li>• Multi-sig / governance for owner actions</li>
              <li>• Multiple monitored endpoints per contract</li>
              <li>• Configurable classification rules</li>
              <li>• Event-based alerting</li>
              <li>• Mainnet deployment</li>
              <li>• SDK for easy protocol integration</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="text-center pt-8 border-t border-sentinel-border">
        <h2 className="text-2xl font-bold text-sentinel-text mb-4">Open Source</h2>
        <p className="text-sentinel-textMuted mb-6 max-w-xl mx-auto">
          Sentinel is built in the open. Contributions, issues, and feedback are welcome.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/MIKI4222/genlayer-emergency-circuit-breaker"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              View on GitHub
            </Button>
          </a>
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              GenLayer Documentation
            </Button>
          </a>
        </div>
      </section>

      <section className="text-center text-sm text-sentinel-textMuted">
        <p>Built with <Heart className="h-4 w-4 inline text-sentinel-danger" /> for the GenLayer ecosystem</p>
        <p className="mt-2">Sentinel — Decentralized protection for critical services</p>
      </section>
    </div>
  );
}