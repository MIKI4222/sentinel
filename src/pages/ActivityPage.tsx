import { useState } from "react";
import {
  Activity,
  Clock,
  Hash,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { useGenLayer } from "../hooks/useGenLayer";
import { useTransaction } from "../hooks/useTransaction";
import { getExplorerTransactionUrl } from "../config";
import { formatRelativeTime } from "../lib/genlayer/client";

type FilterType = "all" | "success" | "error" | "pending";

export function ActivityPage() {
  const { wallet, connectWallet } = useGenLayer();
  const { history } = useTransaction();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history
    .filter((tx) => {
      if (filter !== "all" && tx.status !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !tx.operation.toLowerCase().includes(query) &&
          !tx.hash?.toLowerCase().includes(query) &&
          !tx.transactionId?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => b.startTime - a.startTime);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return { variant: "active" as const, label: "Success", icon: CheckCircle };
      case "error":
        return { variant: "paused" as const, label: "Failed", icon: XCircle };
      case "pending":
        return { variant: "info" as const, label: "Pending", icon: Loader2 };
      case "canceled":
        return { variant: "warning" as const, label: "Canceled", icon: AlertTriangle };
      default:
        return { variant: "neutral" as const, label: "Idle", icon: Clock };
    }
  };

  const getOperationIcon = (operation: string) => {
    if (operation.includes("Health Check")) return Activity;
    if (operation.includes("Protected Action")) return Hash;
    if (operation.includes("Monitored URL")) return ExternalLink;
    if (operation.includes("Emergency Unpause")) return Loader2;
    return Activity;
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Card variant="default" className="py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sentinel-accent/15 mx-auto mb-6">
            <Activity className="h-8 w-8 text-sentinel-accent" />
          </div>
          <h1 className="text-2xl font-bold text-sentinel-text mb-2">Connect Wallet</h1>
          <p className="text-sentinel-textMuted mb-8 max-w-md mx-auto">
            Connect your wallet to view transaction history and activity on the Sentinel Intelligent Contract.
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
          <h1 className="text-2xl font-bold text-sentinel-text">Activity</h1>
          <p className="text-sentinel-textMuted">Transaction history and contract interactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card variant="hover">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              label="Search"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "success", "error", "pending"] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {filteredHistory.length === 0 ? (
        <Card variant="default" className="text-center py-12">
          <Activity className="h-12 w-12 text-sentinel-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-sentinel-text mb-2">No Activity Yet</h3>
          <p className="text-sentinel-textMuted">
            {searchQuery || filter !== "all"
              ? "No transactions match your current filters."
              : "Transaction history will appear here after you interact with the contract."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((tx) => {
            const OperationIcon = getOperationIcon(tx.operation);
            const statusInfo = getStatusBadge(tx.status);

            return (
              <Card key={tx.id} variant="hover" className="overflow-hidden">
                <div className="flex items-start gap-4 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    tx.status === "success" ? "bg-sentinel-accent/15 text-sentinel-accent" :
                    tx.status === "error" ? "bg-sentinel-danger/15 text-sentinel-danger" :
                    tx.status === "pending" ? "bg-sentinel-info/15 text-sentinel-info" :
                    "bg-sentinel-border text-sentinel-textMuted"
                  }`}>
                    <OperationIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-sentinel-text">{tx.operation}</h3>
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1.5">
                          <statusInfo.icon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-sentinel-textMuted">
                        <span className="mono">{formatRelativeTime(tx.startTime)}</span>
                        {tx.endTime && (
                          <span className="text-sentinel-textMuted/50">·</span>
                        )}
                        {tx.endTime && (
                          <span className="mono">{formatRelativeTime(tx.endTime)}</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                      {tx.hash && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-sentinel-textMuted" />
                          <code className="mono text-sentinel-textMuted truncate max-w-xs">{tx.hash.slice(0, 12)}...</code>
                          <a
                            href={getExplorerTransactionUrl(tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sentinel-accent hover:text-sentinel-accentHover text-xs"
                          >
                            View
                          </a>
                        </div>
                      )}
                      {tx.transactionId && tx.transactionId !== tx.hash && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-sentinel-textMuted" />
                          <code className="mono text-sentinel-textMuted truncate max-w-xs">{tx.transactionId.slice(0, 12)}...</code>
                        </div>
                      )}
                      {tx.error && (
                        <div className="flex items-center gap-2 text-sentinel-danger">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="truncate max-w-xs">{tx.error}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={tx.hash ? getExplorerTransactionUrl(tx.hash) : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost p-2"
                      aria-label="View on explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {history.length > 0 && filteredHistory.length === 0 && (
        <Card variant="default" className="text-center py-8">
          <Filter className="h-12 w-12 text-sentinel-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-sentinel-text mb-2">No Matching Transactions</h3>
          <p className="text-sentinel-textMuted">Try adjusting your filters or search query.</p>
        </Card>
      )}
    </div>
  );
}