import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { TRANSACTION_STAGES, type TransactionStageId } from "../config";

export interface TransactionRecord {
  id: string;
  operation: string;
  stage: TransactionStageId;
  status: "idle" | "pending" | "success" | "error" | "canceled" | "unknown";
  hash?: string;
  error?: string;
  startTime: number;
  endTime?: number;
  stages: Record<TransactionStageId, "pending" | "active" | "completed" | "error">;
  stateBefore?: any;
  stateAfter?: any;
}

const STORAGE_KEY = "sentinel_transaction_history";

function loadHistory(): TransactionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: TransactionRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-50)));
  } catch {
    // Ignore storage errors
  }
}

function createInitialStages(): Record<TransactionStageId, "pending" | "active" | "completed" | "error"> {
  const stages: Record<TransactionStageId, "pending" | "active" | "completed" | "error"> = {} as any;
  TRANSACTION_STAGES.forEach((s) => {
    stages[s.id] = "pending";
  });
  return stages;
}

interface TransactionContextType {
  history: TransactionRecord[];
  currentTransaction: TransactionRecord | null;
  startTransaction: (operation: string, stateBefore?: any) => string;
  updateStage: (id: string, stage: TransactionStageId) => void;
  completeTransaction: (id: string, hash: string, stateAfter?: any) => void;
  failTransaction: (id: string, error: string) => void;
  cancelTransaction: (id: string) => void;
  clearCurrent: () => void;
  getTransaction: (id: string) => TransactionRecord | undefined;
  recoverPendingTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    recoverPendingTransactions();
  }, []);

  const recoverPendingTransactions = useCallback(async () => {
    const pending = history.filter(
      (tx) => tx.status === "pending" && tx.hash
    );
    for (const tx of pending) {
      // In a real implementation, we would poll for the transaction status
      // For now, we just mark them as unknown
      setHistory((prev) =>
        prev.map((t) =>
          t.id === tx.id ? { ...t, status: "unknown" as const } : t
        )
      );
    }
  }, [history]);

  const startTransaction = useCallback(
    (operation: string, stateBefore?: any): string => {
      const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const newTransaction: TransactionRecord = {
        id,
        operation,
        stage: "awaiting_signature",
        status: "pending",
        startTime: Date.now(),
        stages: createInitialStages(),
        stateBefore,
      };
      newTransaction.stages["awaiting_signature"] = "active";

      setCurrentTransaction(newTransaction);
      setHistory((prev) => {
        const updated = [newTransaction, ...prev];
        saveHistory(updated);
        return updated;
      });
      return id;
    },
    []
  );

  const updateStage = useCallback((id: string, stage: TransactionStageId) => {
    setCurrentTransaction((prev) => {
      if (!prev || prev.id !== id) return prev;
      const newStages = { ...prev.stages };
      newStages[prev.stage] = "completed";
      newStages[stage] = "active";
      return { ...prev, stage, stages: newStages };
    });

    setHistory((prev) =>
      prev.map((tx) =>
        tx.id === id
          ? {
              ...tx,
              stage,
              stages: {
                ...tx.stages,
                [tx.stage]: "completed",
                [stage]: "active",
              },
            }
          : tx
      )
    );
  }, []);

  const completeTransaction = useCallback(
    (id: string, hash: string, stateAfter?: any) => {
      setCurrentTransaction((prev) => {
        if (!prev || prev.id !== id) return prev;
        const newStages = { ...prev.stages };
        newStages[prev.stage] = "completed";
        const completed: TransactionRecord = {
          ...prev,
          status: "success",
          hash,
          endTime: Date.now(),
          stages: newStages,
          stateAfter,
        };
        setHistory((h) => {
          const updated = h.map((tx) => (tx.id === id ? completed : tx));
          saveHistory(updated);
          return updated;
        });
        return completed;
      });
    },
    []
  );

  const failTransaction = useCallback((id: string, error: string) => {
    setCurrentTransaction((prev) => {
      if (!prev || prev.id !== id) return prev;
      const newStages = { ...prev.stages };
      newStages[prev.stage] = "error";
      const failed: TransactionRecord = {
        ...prev,
        status: "error",
        error,
        endTime: Date.now(),
        stages: newStages,
      };
      setHistory((h) => {
        const updated = h.map((tx) => (tx.id === id ? failed : tx));
        saveHistory(updated);
        return updated;
      });
      return failed;
    });
  }, []);

  const cancelTransaction = useCallback((id: string) => {
    setCurrentTransaction((prev) => {
      if (!prev || prev.id !== id) return prev;
      const canceled: TransactionRecord = {
        ...prev,
        status: "canceled",
        endTime: Date.now(),
      };
      setHistory((h) => {
        const updated = h.map((tx) => (tx.id === id ? canceled : tx));
        saveHistory(updated);
        return updated;
      });
      return canceled;
    });
  }, []);

  const clearCurrent = useCallback(() => {
    setCurrentTransaction(null);
  }, []);

  const getTransaction = useCallback(
    (id: string): TransactionRecord | undefined => {
      return history.find((tx) => tx.id === id) || (currentTransaction?.id === id ? currentTransaction : undefined);
    },
    [history, currentTransaction]
  );

  return (
    <TransactionContext.Provider
      value={{
        history,
        currentTransaction,
        startTransaction,
        updateStage,
        completeTransaction,
        failTransaction,
        cancelTransaction,
        clearCurrent,
        getTransaction,
        recoverPendingTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
}