import { Fragment } from "react";
import type { ReactNode } from "react";
import { X, Loader2, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { TRANSACTION_STAGES } from "../../config";
import type { TransactionStageId } from "../../config";
import { Button } from "./Button";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, size = "md", showCloseButton = true }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-slide-up">
        <Card variant="default" padding="none" className={`${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-sentinel-border">
            <h2 className="text-lg font-semibold text-sentinel-text">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-sentinel-textMuted hover:text-sentinel-text hover:bg-sentinel-border transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </Card>
      </div>
    </Fragment>
  );
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: string;
  stage: TransactionStageId;
  status: "idle" | "pending" | "success" | "error" | "canceled" | "unknown";
  hash?: string;
  transactionId?: string;
  error?: string;
  startTime: number;
  endTime?: number;
  stages: Record<TransactionStageId, "pending" | "active" | "completed" | "error">;
  explorerUrl?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  operation,
  stage,
  status,
  hash,
  transactionId,
  error,
  startTime,
  endTime,
  stages,
  explorerUrl,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const getStageIcon = (stageStatus: "pending" | "active" | "completed" | "error") => {
    switch (stageStatus) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-sentinel-accent" />;
      case "active":
        return <Loader2 className="h-5 w-5 text-sentinel-accent animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-sentinel-danger" />;
      default:
        return <div className="h-5 w-5 text-sentinel-border rounded-full border border-sentinel-border" />;
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="flex items-center gap-3 text-sentinel-accent">
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium">Transaction Finalized</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-3 text-sentinel-danger">
            <AlertCircle className="h-6 w-6" />
            <span className="font-medium">Transaction Failed</span>
          </div>
        );
      case "canceled":
        return (
          <div className="flex items-center gap-3 text-sentinel-textMuted">
            <AlertTriangle className="h-6 w-6" />
            <span className="font-medium">Transaction Canceled</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-3 text-sentinel-info">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-medium">Processing...</span>
          </div>
        );
    }
  };

  const formatDuration = (start: number, end?: number) => {
    const duration = (end || Date.now()) - start;
    const secs = Math.floor(duration / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={operation} size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-sentinel-bg rounded-lg border border-sentinel-border">
          {getStatusContent()}
          <span className="text-sm text-sentinel-textMuted ml-auto mono">
            {formatDuration(startTime, endTime)}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-sentinel-textMuted uppercase tracking-wider">
            Transaction Lifecycle
          </h3>
          <div className="space-y-2" role="list" aria-label="Transaction stages">
            {TRANSACTION_STAGES.map((s) => {
              const stageStatus = stages[s.id];
              const isCurrent = s.id === stage;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCurrent ? "bg-sentinel-accent/5 border border-sentinel-accent/20" : "bg-sentinel-bg"
                  }`}
                  role="listitem"
                >
                  <div className="flex-shrink-0">{getStageIcon(stageStatus)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCurrent ? "text-sentinel-text" : "text-sentinel-textMuted"}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-sentinel-textMuted truncate">{s.description}</p>
                  </div>
                  {isCurrent && status === "pending" && (
                    <span className="text-xs px-2 py-0.5 bg-sentinel-accent/15 text-sentinel-accent rounded-full">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {(hash || transactionId) && (
          <div className="space-y-2 p-4 bg-sentinel-bg rounded-lg border border-sentinel-border">
            <h3 className="text-sm font-medium text-sentinel-textMuted uppercase tracking-wider">
              Transaction Details
            </h3>
            {hash && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-sentinel-textMuted w-24">Hash</span>
                <code className="flex-1 mono text-sm text-sentinel-text break-all">{hash}</code>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link text-sm"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            )}
            {transactionId && transactionId !== hash && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-sentinel-textMuted w-24">GenLayer ID</span>
                <code className="flex-1 mono text-sm text-sentinel-text break-all">{transactionId}</code>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-sentinel-danger/10 border border-sentinel-danger/30 rounded-lg">
            <h3 className="text-sm font-medium text-sentinel-danger mb-2">Error</h3>
            <p className="text-sm text-sentinel-danger mono">{error}</p>
          </div>
        )}

        {status === "success" || status === "error" || status === "canceled" ? (
          <div className="flex justify-end gap-3 pt-4 border-t border-sentinel-border">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-3 pt-4 border-t border-sentinel-border">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}