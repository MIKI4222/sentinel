import { useState } from "react";
import {
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Shield,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { TransactionModal } from "../components/ui/Modal";
import { useGenLayer } from "../hooks/useGenLayer";
import { useTransaction } from "../context/TransactionContext";
import { useContractAction } from "../hooks/useContractAction";
import { VERDICT_LABELS, STATUS_LABELS } from "../config";
import { formatRelativeTime } from "../lib/genlayer/client";

export function RecoveryPage() {
  const { wallet, contractState, isLoadingState, refreshContractState, connectWallet } = useGenLayer();
  const { startTransaction, updateStage, completeTransaction, failTransaction } = useTransaction();
  const { healthCheck: healthCheckAction, emergencyUnpause: emergencyUnpauseAction, isExecuting } = useContractAction();
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const statusConfig = contractState ? STATUS_LABELS[contractState.status] : null;
  const verdictConfig = contractState ? VERDICT_LABELS[contractState.lastVerdict] : null;
  const isPaused = contractState?.status === "PAUSED";
  const isOperational = contractState?.lastVerdict === "operational";
  const urlMatches = contractState?.lastCheckedUrl === contractState?.monitoredUrl;
  const canRecover = isPaused && isOperational && urlMatches && wallet.isConnected;

  const handleHealthCheck = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      if (!wallet.isConnected) return;
    }

    const txId = startTransaction("Recovery Health Check");
    setShowHealthCheckModal(true);

    try {
      updateStage(txId, "submitted");
      updateStage(txId, "evm-inclusion");
      updateStage(txId, "genlayer-processing");
      updateStage(txId, "consensus");
      updateStage(txId, "decision");

      const result = await healthCheckAction({
        onSuccess: () => {
          updateStage(txId, "finalized");
          completeTransaction(txId, result.transactionResult.hash, result.stateAfter);
        },
        onError: (error) => {
          failTransaction(txId, error);
        },
      });
      await refreshContractState();
    } catch (error: any) {
      failTransaction(txId, error.message || "Health check failed");
    }
  };

  const handleRecovery = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      if (!wallet.isConnected) return;
    }

    const txId = startTransaction("Emergency Unpause");
    setShowRecoveryModal(true);

    try {
      updateStage(txId, "submitted");
      updateStage(txId, "evm-inclusion");
      updateStage(txId, "genlayer-processing");
      updateStage(txId, "consensus");
      updateStage(txId, "decision");

      const result = await emergencyUnpauseAction({
        onSuccess: () => {
          updateStage(txId, "finalized");
          completeTransaction(txId, result.transactionResult.hash, result.stateAfter);
        },
        onError: (error) => {
          failTransaction(txId, error);
        },
      });
      await refreshContractState();
    } catch (error: any) {
      failTransaction(txId, error.message || "Recovery failed");
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Card variant="default" className="py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sentinel-accent/15 mx-auto mb-6">
            <RotateCcw className="h-8 w-8 text-sentinel-accent" />
          </div>
          <h1 className="text-2xl font-bold text-sentinel-text mb-2">Connect Wallet</h1>
          <p className="text-sentinel-textMuted mb-8 max-w-md mx-auto">
            Connect your wallet to access the Sentinel recovery controls. Only the contract owner can initiate recovery.
          </p>
          <Button size="lg" onClick={connectWallet} disabled={wallet.isConnecting} className="w-full sm:w-auto">
            {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </Card>
      </div>
    );
  }

  const recoverySteps = [
    {
      id: 1,
      title: "Current Endpoint",
      description: "Verify the monitored endpoint is correct",
      icon: Eye,
      status: "completed" as const,
    },
    {
      id: 2,
      title: "Fresh Health Check",
      description: "Run a new consensus-based health check",
      icon: RotateCcw,
      status: isOperational ? "completed" : "pending" as const,
      action: !isOperational ? handleHealthCheck : undefined,
      actionLabel: "Run Health Check",
      disabled: isExecuting,
    },
    {
      id: 3,
      title: "Operational Consensus",
      description: "Validators must agree the service is operational",
      icon: CheckCircle,
      status: isOperational ? "completed" : "pending" as const,
    },
    {
      id: 4,
      title: "Owner Authorization",
      description: "Connected wallet must be the contract owner",
      icon: Shield,
      status: wallet.isConnected ? "completed" : "pending" as const,
    },
    {
      id: 5,
      title: "Recover Service",
      description: "Submit emergency_unpause() transaction",
      icon: ArrowRight,
      status: canRecover ? "pending" : "blocked" as const,
      action: canRecover ? handleRecovery : undefined,
      actionLabel: "Recover Service",
      disabled: isExecuting || !canRecover,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sentinel-text">Recovery Control</h1>
          <p className="text-sentinel-textMuted">Recover the circuit breaker after an incident has been resolved</p>
        </div>
        <Button variant="secondary" onClick={() => refreshContractState()} disabled={isLoadingState} className="flex items-center gap-2">
          <svg className={isLoadingState ? "animate-spin h-4 w-4" : "h-4 w-4"} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="30" strokeDashoffset="30" strokeLinecap="round" /></svg>
          Refresh
        </Button>
      </div>

      <Card variant="hover" className={`border-l-4 ${isPaused ? "border-sentinel-danger" : "border-sentinel-accent"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isPaused ? "bg-sentinel-danger/15" : "bg-sentinel-accent/15"}`}>
              {isPaused ? (
                <AlertTriangle className="h-6 w-6 text-sentinel-danger" />
              ) : (
                <CheckCircle className="h-6 w-6 text-sentinel-accent" />
              )}
            </div>
            <div>
              <p className="text-sm text-sentinel-textMuted">System Status</p>
              <div className="flex items-center gap-2">
                {statusConfig && (
                  <Badge variant={statusConfig.variant} className="text-base px-3 py-1">
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-sentinel-textMuted">Incidents Recorded</p>
            <p className="text-2xl font-bold text-sentinel-text mono">{contractState?.incidentCount ?? 0}</p>
          </div>
        </div>

        {isPaused && (
          <div className="mt-6 p-4 bg-sentinel-danger/5 border border-sentinel-danger/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-sentinel-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sentinel-text">Circuit Breaker Active</p>
                <p className="text-sm text-sentinel-textMuted mt-1">
                  Protected operations are blocked. Recovery requires a fresh operational verdict for the current endpoint,
                  followed by owner authorization via emergency_unpause().
                </p>
              </div>
            </div>
          </div>
        )}

        {!isPaused && (
          <div className="mt-6 p-4 bg-sentinel-accent/5 border border-sentinel-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-sentinel-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sentinel-text">System Operational</p>
                <p className="text-sm text-sentinel-textMuted mt-1">
                  The circuit breaker is not active. No recovery needed.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-6 flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-sentinel-accent" />
          Recovery Checklist
        </h2>
        <p className="text-sentinel-textMuted text-sm mb-6">
          All steps must be satisfied before recovery can proceed. Sentinel does not automatically resume
          protected operations after a service appears healthy.
        </p>
        <div className="space-y-4">
          {recoverySteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                step.status === "completed"
                  ? "bg-sentinel-accent/5 border-sentinel-accent/20"
                  : step.status === "blocked"
                  ? "bg-sentinel-danger/5 border-sentinel-danger/20"
                  : "bg-sentinel-bg border-sentinel-border"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                step.status === "completed" ? "bg-sentinel-accent/15 text-sentinel-accent" :
                step.status === "blocked" ? "bg-sentinel-danger/15 text-sentinel-danger" :
                "bg-sentinel-border text-sentinel-textMuted"
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${step.status === "completed" ? "text-sentinel-text" : step.status === "blocked" ? "text-sentinel-danger" : "text-sentinel-textMuted"}`}>
                    {step.title}
                  </p>
                  {step.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-sentinel-accent" />
                  )}
                  {step.status === "blocked" && (
                    <AlertCircle className="h-4 w-4 text-sentinel-danger" />
                  )}
                </div>
                <p className="text-sm text-sentinel-textMuted">{step.description}</p>
              </div>
              {step.action && (
                <Button
                  onClick={step.action}
                  disabled={step.disabled}
                  size="sm"
                  variant={step.id === 5 ? "primary" : "secondary"}
                >
                  {step.disabled ? (step.id === 2 ? "Checking..." : "Recovering...") : step.actionLabel}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="hover">
          <h3 className="text-sm font-medium text-sentinel-textMuted mb-2">Latest Verdict</h3>
          <div className="flex items-center gap-2">
            {verdictConfig && <Badge variant={verdictConfig.variant}>{verdictConfig.label}</Badge>}
          </div>
          <p className="text-xs text-sentinel-textMuted mt-2">
            {isOperational ? "Operational verdict obtained" : "Operational verdict required"}
          </p>
        </Card>

        <Card variant="hover">
          <h3 className="text-sm font-medium text-sentinel-textMuted mb-2">URL Match</h3>
          <div className="flex items-center gap-2">
            <Badge variant={urlMatches ? "active" : "warning"}>
              {urlMatches ? "Matches" : "Mismatch"}
            </Badge>
          </div>
          <p className="text-xs text-sentinel-textMuted mt-2">
            {urlMatches ? "Verdict belongs to current URL" : "Verdict belongs to different URL"}
          </p>
        </Card>

        <Card variant="hover">
          <h3 className="text-sm font-medium text-sentinel-textMuted mb-2">Last Check</h3>
          <p className="text-sm font-mono text-sentinel-text">
            {contractState && contractState.lastCheckTimestamp > 0
              ? formatRelativeTime(contractState.lastCheckTimestamp)
              : "Never"}
          </p>
        </Card>
      </div>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-sentinel-warning" />
          Recovery Requirements
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-warning/15 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-sentinel-warning" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">Fresh Operational Check Required</p>
              <p className="text-sentinel-textMuted">
                A healthy service does not automatically clear the pause. You must run a new health check
                that returns an operational verdict for the current monitored URL.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-warning/15 flex-shrink-0">
              <Shield className="h-4 w-4 text-sentinel-warning" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">Owner Authorization Required</p>
              <p className="text-sentinel-textMuted">
                Only the contract owner (deployer) can call emergency_unpause(). The connected wallet
                must match the owner address.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-warning/15 flex-shrink-0">
              <Eye className="h-4 w-4 text-sentinel-warning" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">URL Must Match</p>
              <p className="text-sentinel-textMuted">
                The operational verdict must belong to the currently monitored URL. Changing the URL
                invalidates previous verdicts.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-warning/15 flex-shrink-0">
              <Clock className="h-4 w-4 text-sentinel-warning" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">Incident History Preserved</p>
              <p className="text-sentinel-textMuted">
                Recovery does not reset the incident counter. The incident_count remains as a permanent
                record of all detected degradations.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <TransactionModal
        isOpen={showHealthCheckModal}
        onClose={() => setShowHealthCheckModal(false)}
        operation="Recovery Health Check"
        stage="submitted"
        status="pending"
        startTime={Date.now()}
        stages={{
          "awaiting_signature": "completed",
          "submitted": "active",
          "accepted": "pending",
          "finalized": "pending",
          "evm-inclusion": "pending",
          "genlayer-processing": "pending",
          "consensus": "pending",
          "decision": "pending",
          "finalizing": "pending",
        }}
      />

      <TransactionModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        operation="Emergency Unpause"
        stage="submitted"
        status="pending"
        startTime={Date.now()}
        stages={{
          "awaiting_signature": "completed",
          "submitted": "active",
          "accepted": "pending",
          "finalized": "pending",
          "evm-inclusion": "pending",
          "genlayer-processing": "pending",
          "consensus": "pending",
          "decision": "pending",
          "finalizing": "pending",
        }}
      />
    </div>
  );
}