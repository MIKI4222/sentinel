import {
  Shield,
  Globe,
  Bell,
  Palette,
  Key,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { useGenLayer } from "../hooks/useGenLayer";
import { useTransaction } from "../context/TransactionContext";
import { formatAddress } from "../lib/genlayer/client";

export function SettingsPage() {
  const { wallet, connectWallet, disconnectWallet } = useGenLayer();
  const { clearCurrent } = useTransaction();

  if (!wallet.isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Card variant="default" className="py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sentinel-accent/15 mx-auto mb-6">
            <Shield className="h-8 w-8 text-sentinel-accent" />
          </div>
          <h1 className="text-2xl font-bold text-sentinel-text mb-2">Connect Wallet</h1>
          <p className="text-sentinel-textMuted mb-8 max-w-md mx-auto">
            Connect your wallet to access settings and preferences.
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
      <div>
        <h1 className="text-2xl font-bold text-sentinel-text">Settings</h1>
        <p className="text-sentinel-textMuted">Manage your Sentinel preferences and wallet connection</p>
      </div>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-sentinel-accent" />
          Wallet Connection
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/15">
                <Shield className="h-5 w-5 text-sentinel-accent" />
              </div>
              <div>
                <p className="font-medium text-sentinel-text">Connected Wallet</p>
                <p className="text-sm font-mono text-sentinel-textMuted">{formatAddress(wallet.address || "")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="active">Connected</Badge>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(wallet.address || "")}>
                Copy
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-info/15">
                <Globe className="h-5 w-5 text-sentinel-info" />
              </div>
              <div>
                <p className="font-medium text-sentinel-text">Network</p>
                <p className="text-sm font-mono text-sentinel-textMuted">GenLayer Bradbury (Chain ID: 4221)</p>
              </div>
            </div>
            <Badge variant={wallet.isCorrectNetwork ? "active" : "warning"}>
              {wallet.isCorrectNetwork ? "Correct Network" : "Wrong Network"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-warning/15">
                <Bell className="h-5 w-5 text-sentinel-warning" />
              </div>
              <div>
                <p className="font-medium text-sentinel-text">Balance</p>
                <p className="text-sm font-mono text-sentinel-textMuted">{wallet.balance || "0"} GEN</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-sentinel-danger hover:text-sentinel-danger">
              Disconnect
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-sentinel-accent" />
          Appearance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sentinel-text">Theme</p>
              <p className="text-sm text-sentinel-textMuted">Sentinel uses a dark theme optimized for infrastructure monitoring</p>
            </div>
            <Badge variant="neutral">Dark Only</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sentinel-text">Reduced Motion</p>
              <p className="text-sm text-sentinel-textMuted">Respects system prefers-reduced-motion setting</p>
            </div>
            <Badge variant="info">Auto</Badge>
          </div>
        </div>
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-sentinel-accent" />
          Network & Contract
        </h2>
        <div className="space-y-4">
          <div>
            <label className="label">RPC Endpoint</label>
            <Input
              value="https://rpc-bradbury.genlayer.com"
              readOnly
              helperText="GenLayer Bradbury testnet RPC"
            />
          </div>
          <div>
            <label className="label">Contract Address</label>
            <Input
              value="0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000"
              readOnly
              helperText="Sentinel Emergency Circuit Breaker"
            />
          </div>
          <div>
            <label className="label">Explorer</label>
            <Input
              value="https://explorer-bradbury.genlayer.com"
              readOnly
              helperText="Bradbury block explorer"
            />
          </div>
        </div>
      </Card>

      <Card variant="hover" className="border-sentinel-danger/30">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-sentinel-danger" />
          Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-sentinel-danger/5 border border-sentinel-danger/20 rounded-lg">
            <div>
              <p className="font-medium text-sentinel-text">Clear Local Transaction History</p>
              <p className="text-sm text-sentinel-textMuted">Removes all locally stored transaction records. This does not affect on-chain data.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => { localStorage.removeItem("sentinel_transaction_history"); clearCurrent(); }}>Clear History</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-sentinel-danger/5 border border-sentinel-danger/20 rounded-lg">
            <div>
              <p className="font-medium text-sentinel-text">Reset All Settings</p>
              <p className="text-sm text-sentinel-textMuted">Restores all settings to defaults. Wallet connection will be preserved.</p>
            </div>
            <Button variant="danger" size="sm" className="bg-transparent border-sentinel-danger/50 hover:bg-sentinel-danger/10 text-sentinel-danger" onClick={() => { localStorage.clear(); }}>Reset Settings</Button>
          </div>
        </div>
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-sentinel-accent" />
          Data Export
        </h2>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full justify-start flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Transaction History (JSON)
          </Button>
          <Button variant="secondary" className="w-full justify-start flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Settings
          </Button>
        </div>
      </Card>

      <Card variant="hover">
        <h2 className="text-lg font-semibold text-sentinel-text mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-sentinel-accent" />
          About Sentinel
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-sentinel-border">
            <span className="text-sentinel-textMuted">Version</span>
            <span className="font-mono text-sentinel-text">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-sentinel-border">
            <span className="text-sentinel-textMuted">Contract</span>
            <span className="font-mono text-sentinel-text">EmergencyCircuitBreaker</span>
          </div>
          <div className="flex justify-between py-2 border-b border-sentinel-border">
            <span className="text-sentinel-textMuted">Network</span>
            <span className="font-mono text-sentinel-text">GenLayer Bradbury</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sentinel-textMuted">Chain ID</span>
            <span className="font-mono text-sentinel-text">4221</span>
          </div>
        </div>
      </Card>
    </div>
  );
}