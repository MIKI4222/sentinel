import { useState, useCallback, useRef, useEffect } from "react";
import { TRANSACTION_STAGES } from "../config";
import type { TransactionStageId } from "../config";

export interface TransactionState {
  id: string;
  operation: string;
  stage: TransactionStageId;
  status: "idle" | "pending" | "success" | "error" | "canceled";
  hash?: string;
  transactionId?: string;
  error?: string;
  startTime: number;
  endTime?: number;
  stages: Record<TransactionStageId, "pending" | "active" | "completed" | "error">;
}

export interface UseTransactionReturn {
  currentTransaction: TransactionState | null;
  history: TransactionState[];
  startTransaction: (operation: string) => string;
  updateStage: (id: string, stage: TransactionStageId) => void;
  completeTransaction: (id: string, hash: string, transactionId?: string) => void;
  failTransaction: (id: string, error: string) => void;
  cancelTransaction: (id: string) => void;
  clearCurrent: () => void;
  getTransaction: (id: string) => TransactionState | undefined;
}

const STORAGE_KEY = "sentinel_transaction_history";

function loadHistory(): TransactionState[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: TransactionState[]) {
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

export function useTransaction(): UseTransactionReturn {
  const [currentTransaction, setCurrentTransaction] = useState<TransactionState | null>(null);
  const [history, setHistory] = useState<TransactionState[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setHistory(loadHistory());
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startTransaction = useCallback((operation: string): string => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newTransaction: TransactionState = {
      id,
      operation,
      stage: "awaiting_signature",
      status: "pending",
      startTime: Date.now(),
      stages: createInitialStages(),
    };
    newTransaction.stages["awaiting_signature"] = "active";

    setCurrentTransaction(newTransaction);
    return id;
  }, []);

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
    (id: string, hash: string, transactionId?: string) => {
      setCurrentTransaction((prev) => {
        if (!prev || prev.id !== id) return prev;
        const newStages = { ...prev.stages };
        newStages[prev.stage] = "completed";
        const completed: TransactionState = {
          ...prev,
          status: "success",
          hash,
          transactionId,
          endTime: Date.now(),
          stages: newStages,
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
      const failed: TransactionState = {
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
      const canceled: TransactionState = {
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
    (id: string): TransactionState | undefined => {
      return history.find((tx) => tx.id === id) || (currentTransaction?.id === id ? currentTransaction : undefined);
    },
    [history, currentTransaction]
  );

  return {
    currentTransaction,
    history,
    startTransaction,
    updateStage,
    completeTransaction,
    failTransaction,
    cancelTransaction,
    clearCurrent,
    getTransaction,
  };
}