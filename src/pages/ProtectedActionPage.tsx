import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  Terminal,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { TransactionModal } from "../components/ui/Modal";
import { useGenLayer } from "../hooks/useGenLayer";
import { useTransaction } from "../context/TransactionContext";
import { useContractAction } from "../hooks/useContractAction";
import { STATUS_LABELS } from "../config";

export function ProtectedActionPage() {
  const { wallet, contractState, isLoadingState, refreshContractState, connectWallet } = useGenLayer();
  const { currentTransaction, startTransaction, updateStage, completeTransaction, failTransaction } = useTransaction();
  const { executeGuardedAction: executeGuardedActionAction, isExecuting } = useContractAction();
  const [actionData, setActionData] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const statusConfig = contractState ? STATUS_LABELS[contractState.status] : null;
  const isPaused = contractState?.status === "PAUSED";

  const handleExecuteAction = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      if (!wallet.isConnected) return;
    }

    if (!actionData.trim()) return;

    const txId = startTransaction("Execute Protected Action");
    setShowActionModal(true);

    try {
      updateStage(txId, "submitted");
      updateStage(txId, "evm-inclusion");
      updateStage(txId, "genlayer-processing");
      updateStage(txId, "consensus");
      updateStage(txId, "decision");

      const result = await executeGuardedActionAction(actionData, {
        onSuccess: () => {
          updateStage(txId, "finalized");
          completeTransaction(txId, result.transactionResult.hash, result.stateAfter);
          setLastResult(result.message || "Action executed successfully");
        },
        onError: (error) => {
          failTransaction(txId, error);
          setLastResult(`Error: ${error}`);
        },
      });
      setActionData("");
    } catch (error: any) {
      failTransaction(txId, error.message || "Action failed");
      setLastResult(`Error: ${error.message}`);
    }
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
            Connect your wallet to execute protected operations through the Sentinel circuit breaker.
          </p>
          <Button size="lg" onClick={connectWallet} disabled={wallet.isConnecting} className="w-full sm:w-auto">
            {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sentinel-text">Protected Operation</h1>
          <p className="text-sentinel-textMuted">Execute operations protected by the Sentinel circuit breaker</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => refreshContractState()} disabled={isLoadingState} className="flex items-center gap-2">
            <svg className={isLoadingState ? "animate-spin h-4 w-4" : "h-4 w-4"} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="30" strokeDashoffset="30" strokeLinecap="round" /></svg>
            Refresh
          </Button>
        </div>
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
              <p className="text-sm text-sentinel-textMuted">Circuit Breaker Status</p>
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
            <p className="text-sm text-sentinel-textMuted">Protected Operations Executed</p>
            <p className="text-2xl font-bold text-sentinel-text mono">{contractState?.guardedActionCount ?? 0}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-sentinel-bg rounded-lg border border-sentinel-border">
          {isPaused ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-sentinel-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sentinel-text">Protection Active</p>
                <p className="text-sm text-sentinel-textMuted mt-1">
                  The Intelligent Contract has paused execution because the monitored dependency is not currently verified as operational.
                  Protected operations are blocked until recovery requirements are satisfied.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-sentinel-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sentinel-text">System Operational</p>
                <p className="text-sm text-sentinel-textMuted mt-1">
                  The monitored dependency has a current operational verdict. Protected operations will execute normally.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-sentinel-accent" />
          Execute Protected Operation
        </h2>
        <p className="text-sentinel-textMuted text-sm mb-6">
          {isPaused
            ? "The circuit breaker is currently PAUSED. Any attempt to execute a protected operation will be rejected by the Intelligent Contract with 'circuit breaker is active'."
            : "The circuit breaker is ACTIVE. Protected operations will execute normally. Enter an action description and submit."}
        </p>

        <div className="space-y-4">
          <Input
            label="Operation Description"
            placeholder="e.g., Deploy production configuration, Execute critical transaction, Update system parameters"
            value={actionData}
            onChange={(e) => setActionData(e.target.value)}
            disabled={isExecuting || isPaused}
            helperText={isPaused ? "Protected operations are blocked while the circuit breaker is active" : "Describe the operation you want to execute"}
          />

          <div className="flex gap-3">
            <Button
              onClick={handleExecuteAction}
              disabled={isExecuting || !actionData.trim() || !wallet.isConnected || isPaused}
              className="flex-1"
              size="lg"
              variant={isPaused ? "danger" : "primary"}
            >
              {isExecuting ? "Executing..." : isPaused ? "Blocked by Circuit Breaker" : "Execute Protected Operation"}
            </Button>
            <Button variant="secondary" onClick={() => setActionData("")} disabled={isExecuting}>
              Clear
            </Button>
          </div>

          {lastResult && (
            <div className={`p-4 rounded-lg border ${lastResult.startsWith("Error") ? "bg-sentinel-danger/10 border-sentinel-danger/30 text-sentinel-danger" : "bg-sentinel-accent/10 border-sentinel-accent/30 text-sentinel-accent"}`}>
              <p className="font-mono text-sm">{lastResult}</p>
            </div>
          )}
        </div>
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-sentinel-accent" />
          How It Works
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-accent/15 flex-shrink-0">
              <Shield className="h-4 w-4 text-sentinel-accent" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">Circuit Breaker Check</p>
              <p className="text-sentinel-textMuted">Before executing, the contract checks <code className="mono">is_paused</code> state</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-accent/15 flex-shrink-0">
              <Unlock className="h-4 w-4 text-sentinel-accent" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">If ACTIVE</p>
              <p className="text-sentinel-textMuted">Operation executes, <code className="mono">guarded_action_count</code> increments, success message returned</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-danger/15 flex-shrink-0">
              <Lock className="h-4 w-4 text-sentinel-danger" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">If PAUSED</p>
              <p className="text-sentinel-textMuted">Operation rejected with <code className="mono">"circuit breaker is active"</code> error, no state changes</p>
            </div>
          </div>
        </div>
      </Card>

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
        explorerUrl={currentTransaction?.hash ? `https://explorer-bradbury.genlayer.com/tx/${currentTransaction.hash}` : undefined}
      />
    </div>
  );
}