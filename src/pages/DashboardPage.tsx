import { useState } from "react";
import {
  Shield,
  Globe,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { TransactionModal } from "../components/ui/Modal";
import { useGenLayer } from "../hooks/useGenLayer";
import { useTransaction } from "../context/TransactionContext";
import { useContractAction } from "../hooks/useContractAction";
import { VERDICT_LABELS, STATUS_LABELS, getExplorerTransactionUrl } from "../config";
import { formatRelativeTime, formatTimestamp, formatAddress } from "../lib/genlayer/client";

export function DashboardPage() {
  const { wallet, contractState, isLoadingState, refreshContractState, connectWallet } = useGenLayer();
  const { currentTransaction, startTransaction, updateStage, completeTransaction, failTransaction } = useTransaction();
  const { healthCheck: healthCheckAction, executeGuardedAction: executeGuardedActionAction, isExecuting } = useContractAction();
  const [actionData, setActionData] = useState("");
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  const statusConfig = contractState ? STATUS_LABELS[contractState.status] : null;
  const verdictConfig = contractState ? VERDICT_LABELS[contractState.lastVerdict] : null;

  const handleHealthCheck = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      if (!wallet.isConnected) return;
    }

    const txId = startTransaction("Health Check");
    setShowHealthCheckModal(true);

    try {
      const result = await healthCheckAction({
        onSuccess: () => {
          updateStage(txId, "finalized");
          completeTransaction(txId, result.transactionResult.hash, result.stateAfter);
        },
        onError: (error) => {
          failTransaction(txId, error);
        },
      });
    } catch (error: any) {
      failTransaction(txId, error.message || "Health check failed");
    }
  };

  const handleExecuteAction = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      if (!wallet.isConnected) return;
    }

    if (!actionData.trim()) return;

    const txId = startTransaction("Execute Protected Action");
    setShowActionModal(true);

    try {
      const result = await executeGuardedActionAction(actionData, {
        onSuccess: () => {
          updateStage(txId, "finalized");
          completeTransaction(txId, result.transactionResult.hash, result.stateAfter);
        },
        onError: (error) => {
          failTransaction(txId, error);
        },
      });
      setActionData("");
    } catch (error: any) {
      failTransaction(txId, error.message || "Action failed");
    }
  };

  const handleRefresh = async () => {
    await refreshContractState();
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Card variant="default" className="py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sentinel-accent/15 mx-auto mb-6">
            <Shield className="h-8 w-8 text-sentinel-accent" />
          </div>
          <h1 className="text-2xl font-bold text-sentinel-text mb-2">Connect Wallet</h1>
          <p className="text-sentinel-textMuted mb-8 max-w-md mx-auto">
            Connect your wallet to access the Sentinel dashboard and interact with the Intelligent Contract on GenLayer Bradbury.
          </p>
          <Button size="lg" onClick={connectWallet} disabled={wallet.isConnecting} className="w-full sm:w-auto">
            {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sentinel-text">Dashboard</h1>
          <p className="text-sentinel-textMuted">Monitor and control your Sentinel circuit breaker</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleRefresh} disabled={isLoadingState} className="flex items-center gap-2">
            <RefreshCw className={isLoadingState ? "animate-spin" : ""} size={16} />
            Refresh
          </Button>
          <a
            href="https://explorer-bradbury.genlayer.com/address/0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Contract
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-sentinel-textMuted mb-1">System Status</p>
              <div className="flex items-center gap-2">
                {statusConfig && (
                  <Badge variant={statusConfig.variant} className="text-base px-3 py-1">
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-sentinel-textMuted">
                {contractState?.status === "ACTIVE"
                  ? "System operational. The monitored dependency has a current operational verdict."
                  : "Protection active. Sentinel is blocking protected operations until recovery requirements are satisfied."}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              contractState?.status === "ACTIVE" ? "bg-sentinel-accent/15" : "bg-sentinel-danger/15"
            }`}>
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
              <p className="text-sm text-sentinel-textMuted mb-1">Monitored Endpoint</p>
              <p className="text-sm font-mono text-sentinel-text truncate max-w-xs">
                {contractState?.monitoredUrl || "Loading..."}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-info/15">
              <Globe className="h-6 w-6 text-sentinel-info" />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-warning/15">
              <Eye className="h-6 w-6 text-sentinel-warning" />
            </div>
          </div>
        </Card>

        <Card variant="hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-sentinel-textMuted mb-1">Last Check</p>
              <p className="text-lg font-mono text-sentinel-text">
                {contractState && contractState.lastCheckTimestamp > 0
                  ? formatRelativeTime(contractState.lastCheckTimestamp)
                  : "Never"}
              </p>
              {contractState && contractState.lastCheckTimestamp > 0 && (
                <p className="text-xs text-sentinel-textMuted mt-1">
                  {formatTimestamp(contractState.lastCheckTimestamp)}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-accent/15">
              <Clock className="h-6 w-6 text-sentinel-accent" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sentinel-textMuted mb-1">Incident Count</p>
              <p className="text-3xl font-bold text-sentinel-text mono">
                {contractState?.incidentCount ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-danger/15">
              <AlertTriangle className="h-6 w-6 text-sentinel-danger" />
            </div>
          </div>
        </Card>

        <Card variant="hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sentinel-textMuted mb-1">Protected Operations</p>
              <p className="text-3xl font-bold text-sentinel-text mono">
                {contractState?.guardedActionCount ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-accent/15">
              <Shield className="h-6 w-6 text-sentinel-accent" />
            </div>
          </div>
        </Card>

        <Card variant="hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sentinel-textMuted mb-1">Contract Address</p>
              <p className="text-sm font-mono text-sentinel-text truncate max-w-xs">
                {formatAddress("0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000")}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sentinel-border">
              <Copy className="h-6 w-6 text-sentinel-textMuted" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="hover">
          <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-sentinel-accent" />
            Run Health Check
          </h2>
          <p className="text-sentinel-textMuted text-sm mb-6">
            Starts a GenLayer consensus transaction that independently verifies the monitored endpoint.
            Validators will fetch the live status and reach consensus on the operational state.
          </p>
          <Button
            onClick={handleHealthCheck}
            disabled={isExecuting || !wallet.isConnected}
            className="w-full"
            size="lg"
          >
            {isExecuting ? "Running Health Check..." : "Run Health Check"}
          </Button>
        </Card>

        <Card variant="hover">
          <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-sentinel-accent" />
            Execute Protected Action
          </h2>
          <p className="text-sentinel-textMuted text-sm mb-4">
            {contractState?.status === "ACTIVE"
              ? "The circuit breaker is ACTIVE. Protected operations will execute normally."
              : "The circuit breaker is PAUSED. Protected operations will be blocked by the Intelligent Contract."}
          </p>
          <div className="space-y-3">
            <Input
              label="Action Description"
              placeholder="e.g., Deploy production configuration"
              value={actionData}
              onChange={(e) => setActionData(e.target.value)}
              disabled={isExecuting}
            />
            <Button
              onClick={handleExecuteAction}
              disabled={isExecuting || !actionData.trim() || !wallet.isConnected}
              className="w-full"
              variant={contractState?.status === "PAUSED" ? "danger" : "primary"}
              size="lg"
            >
              {isExecuting ? "Executing..." : contractState?.status === "PAUSED" ? "Action Blocked (Paused)" : "Execute Protected Action"}
            </Button>
          </div>
        </Card>
      </div>

      <TransactionModal
        isOpen={showHealthCheckModal}
        onClose={() => setShowHealthCheckModal(false)}
        operation="Health Check"
        stage={currentTransaction?.stage || "awaiting_signature"}
        status={currentTransaction?.status || "idle"}
        hash={currentTransaction?.hash}
        error={currentTransaction?.error}
        startTime={currentTransaction?.startTime || Date.now()}
        endTime={currentTransaction?.endTime}
        stages={currentTransaction?.stages || {
          "awaiting_signature": "pending",
          "submitted": "pending",
          "accepted": "pending",
          "finalized": "pending",
          "evm-inclusion": "pending",
          "genlayer-processing": "pending",
          "consensus": "pending",
          "decision": "pending",
          "finalizing": "pending",
        }}
        explorerUrl={currentTransaction?.hash ? getExplorerTransactionUrl(currentTransaction.hash) : undefined}
      />

      <TransactionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        operation="Execute Protected Action"
        stage={currentTransaction?.stage || "awaiting_signature"}
        status={currentTransaction?.status || "idle"}
        hash={currentTransaction?.hash}
        error={currentTransaction?.error}
        startTime={currentTransaction?.startTime || Date.now()}
        endTime={currentTransaction?.endTime}
        stages={currentTransaction?.stages || {
          "awaiting_signature": "pending",
          "submitted": "pending",
          "accepted": "pending",
          "finalized": "pending",
          "evm-inclusion": "pending",
          "genlayer-processing": "pending",
          "consensus": "pending",
          "decision": "pending",
          "finalizing": "pending",
        }}
        explorerUrl={currentTransaction?.hash ? getExplorerTransactionUrl(currentTransaction.hash) : undefined}
      />
    </div>
  );
}