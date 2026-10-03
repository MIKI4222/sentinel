import { Link } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
  Globe,
  Users,
  Lock,
  Eye,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useContractState } from "../hooks/useContractState";
const STATUS_LABELS = { ACTIVE: { label: 'ACTIVE', variant: 'active' }, PAUSED: { label: 'PAUSED', variant: 'paused' } } as const;
const VERDICT_LABELS = { not_checked: { label: 'Not checked', variant: 'neutral' }, operational: { label: 'Operational', variant: 'active' }, degraded: { label: 'Degraded', variant: 'warning' } } as const;
import { formatRelativeTime } from "../lib/genlayer/client";
import { getExplorerAddressUrl } from "../config";
import { Limitations } from "../components/Limitations";

export function LandingPage() {
  const { state: contractState, now, error } = useContractState();

  const statusConfig = contractState ? STATUS_LABELS[contractState.status] : null;
  const verdictConfig = contractState ? VERDICT_LABELS[contractState.lastVerdict] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {error && <p role="alert" className="card">Could not read live contract: {error}</p>}
      <section className="pt-8 lg:pt-16">
        <div className="text-center max-w-4xl mx-auto animate-in">
          <Badge variant="info" className="mb-6 inline-flex items-center gap-2">
            <Zap className="h-3 w-3" />
            GenLayer Bradbury Testnet
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-sentinel-text tracking-tight mb-6 text-balance">
            Decentralized protection for critical services.
          </h1>
          <p className="text-lg lg:text-xl text-sentinel-textMuted mb-10 max-w-2xl mx-auto text-balance">
            Sentinel uses GenLayer Intelligent Contracts to verify live external service health through decentralized validator consensus and protect critical operations when reality changes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="animate-in stagger-1">
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="hover" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/15">
                <Shield className="h-5 w-5 text-sentinel-accent" />
              </div>
              <h3 className="text-lg font-semibold text-sentinel-text">Verify External Reality</h3>
            </div>
            <p className="text-sentinel-textMuted">
              Validators independently inspect live web data and reach consensus on the security-relevant result. No trusted oracle required.
            </p>
          </Card>

          <Card variant="hover" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-warning/15">
                <AlertTriangle className="h-5 w-5 text-sentinel-warning" />
              </div>
              <h3 className="text-lg font-semibold text-sentinel-text">Fail Closed</h3>
            </div>
            <p className="text-sentinel-textMuted">
              Unknown, malformed or unavailable source bodies classify as degraded. A pause applies only after an accepted degraded check; no consensus does not enable it.
            </p>
          </Card>

          <Card variant="hover" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-info/15">
                <RotateCcw className="h-5 w-5 text-sentinel-info" />
              </div>
              <h3 className="text-lg font-semibold text-sentinel-text">Recover with Proof</h3>
            </div>
            <p className="text-sentinel-textMuted">
              Recovery requires an operational verdict for the current URL and owner authorization. Verdict age is not checked by the contract.
            </p>
          </Card>
        </div>
      </section>

      <section className="animate-in stagger-2">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-sentinel-text">Live Protection Status</h2>
            <p className="text-sentinel-textMuted mt-1">Real-time data from the deployed Intelligent Contract</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`status-indicator ${contractState?.status === "ACTIVE" ? "status-active" : contractState?.status === "PAUSED" ? "status-paused" : "status-pending"}`} />
            <span className="text-sm font-medium text-sentinel-textMuted">
              {contractState ? STATUS_LABELS[contractState.status]?.label : error ? "Unavailable" : "Loading..."}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-sentinel-textMuted mb-1">System Status</p>
                <div className="flex items-center gap-2">
                  {statusConfig && (
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  )}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-accent/15">
                {contractState?.status === "ACTIVE" ? (
                  <CheckCircle className="h-6 w-6 text-sentinel-accent" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-sentinel-danger" />
                )}
              </div>
            </div>
          </Card>

          <Card variant="hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-sentinel-textMuted mb-1">Latest Verdict</p>
                <div className="flex items-center gap-2">
                  {verdictConfig && (
                    <Badge variant={verdictConfig.variant}>{verdictConfig.label}</Badge>
                  )}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-info/15">
                <Eye className="h-6 w-6 text-sentinel-info" />
              </div>
            </div>
            {contractState && (
              <p className="mt-3 text-xs text-sentinel-textMuted mono truncate">
                {contractState.lastCheckedUrl || "Not checked yet"}
              </p>
            )}
          </Card>

          <Card variant="hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-sentinel-textMuted mb-1">Last Check</p>
                <p className="text-lg font-mono text-sentinel-text">
                  {contractState && contractState.lastCheckTimestamp > 0
                    ? formatRelativeTime(contractState.lastCheckTimestamp, now)
                    : "Never"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-warning/15">
                <Clock className="h-6 w-6 text-sentinel-warning" />
              </div>
            </div>
          </Card>

          <Card variant="hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-sentinel-textMuted mb-1">Incidents</p>
                <p className="text-2xl font-bold text-sentinel-text mono">
                  {contractState?.incidentCount ?? "Unavailable"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-danger/15">
                <AlertTriangle className="h-6 w-6 text-sentinel-danger" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="animate-in stagger-3">
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Monitor", description: "Configure a critical external dependency to monitor (e.g., GitHub Status API)", icon: Globe },
            { step: "02", title: "Fetch", description: "GenLayer validators independently fetch live data from the monitored endpoint", icon: Users },
            { step: "03", title: "Consensus", description: "Equivalence Principle validates the canonical boolean result across validators", icon: Lock },
            { step: "04", title: "Protect", description: "Circuit breaker activates on-chain, blocking protected operations until recovery", icon: Shield },
          ].map((item) => (
            <Card key={item.step} variant="hover" className="relative">
              <div className="absolute -top-3 left-6 bg-sentinel-bg px-2 text-xs font-mono text-sentinel-accent">
                {item.step}
              </div>
              <div className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-accent/15 mb-4">
                  <item.icon className="h-6 w-6 text-sentinel-accent" />
                </div>
                <h3 className="text-lg font-semibold text-sentinel-text mb-2">{item.title}</h3>
                <p className="text-sentinel-textMuted text-sm">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="animate-in stagger-4">
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Why GenLayer</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Live Web Access",
              description: "Intelligent Contracts can fetch real-time data from any HTTP endpoint through nondeterministic execution.",
              icon: Globe,
            },
            {
              title: "Independent Validators",
              description: "Each validator independently executes the web request. No single party controls the observation.",
              icon: Users,
            },
            {
              title: "Equivalence Principle",
              description: "Validators agree on the security-critical boolean outcome, not raw response bytes. Dynamic content handled gracefully.",
              icon: Lock,
            },
            {
              title: "On-Chain Result",
              description: "Accepted checks update contract state. The guarded demo checks the pause inside contract execution.",
              icon: Shield,
            },
            {
              title: "Fail-Closed Design",
              description: "Unknown, malformed, or unavailable responses default to degraded. Safety over availability.",
              icon: AlertTriangle,
            },
            {
              title: "Verified Recovery",
              description: "Recovery requires a matching operational verdict and owner authorization. It does not prevent stale verdict use.",
              icon: RotateCcw,
            },
          ].map((item) => (
            <Card key={item.title} variant="hover">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/15 mb-4">
                <item.icon className="h-5 w-5 text-sentinel-accent" />
              </div>
              <h3 className="text-lg font-semibold text-sentinel-text mb-2">{item.title}</h3>
              <p className="text-sentinel-textMuted text-sm">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="animate-in stagger-5">
        <h2 className="text-2xl font-bold text-sentinel-text mb-8">Use Cases</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "DeFi Protocols",
            "Cross-Chain Bridges",
            "API-Dependent dApps",
            "Infrastructure Services",
            "Agent Systems",
            "Payment Systems",
            "Oracle Consumers",
            "Identity Providers",
            "Data Providers",
          ].map((useCase) => (
            <Card key={useCase} variant="hover" className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/15 flex-shrink-0">
                <Shield className="h-5 w-5 text-sentinel-accent" />
              </div>
              <span className="font-medium text-sentinel-text">{useCase}</span>
            </Card>
          ))}
        </div>
      </section>

      <section className="animate-in stagger-6 pb-16 lg:pb-24">
        <Card variant="default" className="text-center py-12 lg:py-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-sentinel-text mb-4">Ready to Protect Your Critical Operations?</h2>
          <p className="text-sentinel-textMuted mb-8 max-w-2xl mx-auto">
            Deploy Sentinel on GenLayer Bradbury and add decentralized circuit breaker protection to your protocol today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Launch Sentinel
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href={getExplorerAddressUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                View Contract
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </Card>
      </section>
      <Limitations />
    </div>
  );
}