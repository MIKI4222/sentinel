import { useState } from "react";
import {
  Globe,
  CheckCircle,
  Save,
  Info,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useGenLayer } from "../hooks/useGenLayer";
import { useTransaction } from "../context/TransactionContext";
import { useContractAction } from "../hooks/useContractAction";
import { VERDICT_LABELS, DEFAULT_MONITORED_URL, OUTAGE_TEST_URL, PUBLIC_BASE_URL } from "../config";
import { formatRelativeTime } from "../lib/genlayer/client";

export function MonitorPage() {
  const { wallet, contractState, isLoadingState, refreshContractState, connectWallet } = useGenLayer();
  const { startTransaction, updateStage, completeTransaction, failTransaction } = useTransaction();
  const { setMonitoredUrl: setMonitoredUrlAction } = useContractAction();
  const [newUrl, setNewUrl] = useState("");
  const [showChangeUrlModal, setShowChangeUrlModal] = useState(false);
  const [isChangingUrl, setIsChangingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");

  const verdictConfig = contractState ? VERDICT_LABELS[contractState.lastVerdict] : null;

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith("https://") || url.startsWith("http://");
    } catch {
      return false;
    }
  };

  const handleChangeUrl = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      if (!wallet.isConnected) return;
    }

    if (!validateUrl(newUrl)) {
      setUrlError("Please enter a valid HTTP/HTTPS URL");
      return;
    }

    setUrlError("");
    const txId = startTransaction("Set Monitored URL");
    setShowChangeUrlModal(true);
    setIsChangingUrl(true);

    try {
      updateStage(txId, "submitted");
      updateStage(txId, "evm-inclusion");
      updateStage(txId, "genlayer-processing");
      updateStage(txId, "consensus");
      updateStage(txId, "decision");

      const result = await setMonitoredUrlAction(newUrl, {
        onSuccess: () => {
          updateStage(txId, "finalized");
          completeTransaction(txId, result.transactionResult.hash, result.stateAfter);
          setNewUrl("");
        },
        onError: (error) => {
          failTransaction(txId, error);
        },
      });
    } catch (error: any) {
      failTransaction(txId, error.message || "Failed to change URL");
    } finally {
      setIsChangingUrl(false);
    }
  };

  const handleQuickSet = (url: string) => {
    setNewUrl(url);
    setUrlError("");
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Card variant="default" className="py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sentinel-accent/15 mx-auto mb-6">
            <Globe className="h-8 w-8 text-sentinel-accent" />
          </div>
          <h1 className="text-2xl font-bold text-sentinel-text mb-2">Connect Wallet</h1>
          <p className="text-sentinel-textMuted mb-8 max-w-md mx-auto">
            Connect your wallet to configure the monitored endpoint on the Sentinel Intelligent Contract.
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
          <h1 className="text-2xl font-bold text-sentinel-text">Monitor Configuration</h1>
          <p className="text-sentinel-textMuted">Configure the external endpoint that Sentinel monitors for health checks</p>
        </div>
        <Button variant="secondary" onClick={() => refreshContractState()} disabled={isLoadingState} className="flex items-center gap-2">
          <svg className={isLoadingState ? "animate-spin h-4 w-4" : "h-4 w-4"} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="30" strokeDashoffset="30" strokeLinecap="round" /></svg>
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="hover">
          <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-sentinel-accent" />
            Current Endpoint
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-sentinel-bg rounded-lg border border-sentinel-border">
              <p className="text-sm text-sentinel-textMuted mb-1">Monitored URL</p>
              <p className="font-mono text-sentinel-text break-all">{contractState?.monitoredUrl || "Loading..."}</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-sentinel-textMuted">Last Verdict:</p>
              {verdictConfig && <Badge variant={verdictConfig.variant}>{verdictConfig.label}</Badge>}
            </div>

            {contractState && contractState.lastCheckTimestamp > 0 && (
              <div className="flex items-center gap-3 text-sm text-sentinel-textMuted">
                <span>Last checked: {formatRelativeTime(contractState.lastCheckTimestamp)}</span>
              </div>
            )}

            <div className="p-3 bg-sentinel-accent/5 border border-sentinel-accent/20 rounded-lg">
              <p className="text-sm text-sentinel-accent flex items-center gap-2">
                <Info className="h-4 w-4" />
                Changing the endpoint invalidates the previous health verdict. The system will require a fresh health check.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="hover">
          <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-sentinel-accent" />
            Fail-Closed Policy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-sentinel-accent/5 border border-sentinel-accent/20 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-accent/15">
                <CheckCircle className="h-4 w-4 text-sentinel-accent" />
              </div>
              <div>
                <p className="font-medium text-sentinel-text">ENABLED</p>
                <p className="text-sm text-sentinel-textMuted">Unknown, malformed, unavailable or unexpected responses are treated as degraded</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-sentinel-textMuted"><strong>Operational indicators:</strong> none, operational, ok, healthy, up, online</p>
              <p className="text-sentinel-textMuted"><strong>Degraded indicators:</strong> degraded, major_outage, major, outage, down, critical, unavailable, incident, error, failed</p>
              <p className="text-sentinel-textMuted"><strong>Unknown formats:</strong> Treated as degraded (fail-closed)</p>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Save className="h-5 w-5 text-sentinel-accent" />
          Change Monitored Endpoint
        </h2>
        <p className="text-sentinel-textMuted text-sm mb-6">
          Only the contract owner can change the monitored URL. This will invalidate the current health verdict.
        </p>

        <div className="space-y-4">
          <Input
            label="New Monitored URL"
            placeholder="https://example.com/status"
            value={newUrl}
            onChange={(e) => {
              setNewUrl(e.target.value);
              setUrlError("");
            }}
            error={urlError}
            helperText="Must be a valid HTTP/HTTPS endpoint returning JSON status"
            disabled={isChangingUrl}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleQuickSet(DEFAULT_MONITORED_URL)} disabled={isChangingUrl}>
              GitHub Status (Default)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleQuickSet(OUTAGE_TEST_URL)} disabled={isChangingUrl}>
              Test Outage (503)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleQuickSet(`${PUBLIC_BASE_URL}/mock/healthy.json`)} disabled={isChangingUrl}>
              Mock Healthy (operational)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleQuickSet(`${PUBLIC_BASE_URL}/mock/degraded.json`)} disabled={isChangingUrl}>
              Mock Degraded (major)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleQuickSet(`${PUBLIC_BASE_URL}/mock/unknown.json`)} disabled={isChangingUrl}>
              Mock Unknown (fail-closed)
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleChangeUrl}
              disabled={isChangingUrl || !newUrl.trim() || !validateUrl(newUrl) || !wallet.isConnected}
              className="flex-1"
              size="lg"
            >
              {isChangingUrl ? "Updating..." : "Update Endpoint"}
            </Button>
            <Button variant="secondary" onClick={() => { setNewUrl(""); setUrlError(""); }} disabled={isChangingUrl}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-sentinel-info" />
          Supported Status Formats
        </h2>
        <p className="text-sentinel-textMuted text-sm mb-4">
          The contract automatically detects and classifies common status API formats:
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <p className="font-mono text-sentinel-text mb-2">GitHub Status API</p>
            <pre className="text-sentinel-textMuted overflow-x-auto"><code>{`{
  "status": {
    "indicator": "none"
  }
}`}</code></pre>
          </div>
          <div className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <p className="font-mono text-sentinel-text mb-2">Simple State</p>
            <pre className="text-sentinel-textMuted overflow-x-auto"><code>{`{
  "state": "operational"
}`}</code></pre>
          </div>
          <div className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <p className="font-mono text-sentinel-text mb-2">Aggregate State</p>
            <pre className="text-sentinel-textMuted overflow-x-auto"><code>{`{
  "aggregate_state": "major_outage"
}`}</code></pre>
          </div>
          <div className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <p className="font-mono text-sentinel-text mb-2">Health Check</p>
            <pre className="text-sentinel-textMuted overflow-x-auto"><code>{`{
  "health": "healthy"
}`}</code></pre>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showChangeUrlModal}
        onClose={() => setShowChangeUrlModal(false)}
        title="Change Monitored URL"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-accent/15">
              <Globe className="h-4 w-4 text-sentinel-accent" />
            </div>
            <div>
              <p className="font-medium text-sentinel-text">Transaction in Progress</p>
              <p className="text-sm text-sentinel-textMuted">Updating monitored endpoint to: {newUrl}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}