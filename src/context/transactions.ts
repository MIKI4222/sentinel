import { createContext } from 'react';
import type { TransactionStageId } from '../config';
import type { ActionResult } from '../lib/contract/service';
export type OutcomeStatus = 'pending' | 'accepted' | 'rejected_by_contract' | 'no_consensus' | 'unknown' | 'canceled';
export interface TransactionRecord {
  id: string; operation: string; stage: TransactionStageId; status: OutcomeStatus;
  hash?: string; submittedAt?: number; statusName?: string; message?: string; startTime: number; endTime?: number;
  finalized: boolean; result?: ActionResult;
}
export type HistoryAction = { type: 'start'; record: TransactionRecord } | { type: 'patch'; id: string; patch: Partial<TransactionRecord> } | { type: 'clear' };
export function historyReducer(history: TransactionRecord[], action: HistoryAction): TransactionRecord[] {
  if (action.type === 'clear') return [];
  if (action.type === 'start') return [action.record, ...history].slice(0, 50);
  return history.map(tx => tx.id === action.id ? { ...tx, ...action.patch, id: tx.id } : tx);
}
export const STORAGE_KEY = 'sentinel_transactions_v2';
export function loadHistory(): TransactionRecord[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    // Persisted state is untrusted. Unknown / old records are not treated as confirmations.
    return value.filter((tx): tx is TransactionRecord => tx && typeof tx === 'object' && typeof tx.id === 'string' && typeof tx.operation === 'string'
      && typeof tx.startTime === 'number' && ['pending', 'accepted', 'rejected_by_contract', 'no_consensus', 'unknown', 'canceled'].includes(tx.status)
      && ['awaiting_signature', 'submitted', 'processing', 'accepted', 'finalized'].includes(tx.stage) && typeof tx.finalized === 'boolean').slice(0, 50);
  } catch { return []; }
}
export interface TransactionContextType {
  history: TransactionRecord[]; currentTransaction: TransactionRecord | null;
  startTransaction: (operation: string) => string;
  patchTransaction: (id: string, patch: Partial<TransactionRecord>) => void;
  clearCurrent: () => void; openTransaction: (id: string) => void; clearHistory: () => void;
  recheck: (id: string, hash?: string) => Promise<void>;
  watchFinalization: (id: string, hash: string) => void;
}
export const TransactionContext = createContext<TransactionContextType | null>(null);
