import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { TransactionContext, historyReducer, loadHistory, STORAGE_KEY, type TransactionRecord } from './transactions';
import { readClient, pollUntilFinalized } from '../lib/genlayer/client';
import { pollUntilAccepted } from '../lib/genlayer/poll';
import type { ReceiptOutcome } from '../lib/genlayer/receipt';
import { getUserErrorMessage } from '../config';
import { useContractState } from '../hooks/useContractState';
function outcomePatch(outcome: ReceiptOutcome): Partial<TransactionRecord> {
  const base = { statusName: outcome.statusName, finalized: outcome.statusName === 'FINALIZED' };
  if (outcome.kind === 'accepted-return') return { ...base, stage: base.finalized ? 'finalized' : 'accepted', status: 'accepted', message: outcome.returnValue ?? 'Operation accepted by the contract.' };
  if (outcome.kind === 'accepted-error') return { ...base, stage: base.finalized ? 'finalized' : 'accepted', status: 'rejected_by_contract', message: getUserErrorMessage(outcome.error) };
  if (outcome.kind === 'no-consensus') return { ...base, status: 'no_consensus', message: 'Validators did not reach consensus. This transaction did not apply a contract-state change or enable the pause. Other transactions may still change state. You can retry.' };
  return { ...base, status: outcome.kind === 'pending' ? 'pending' : 'unknown', stage: 'processing', message: outcome.reason };
}
export function TransactionProvider({ children }: { children: ReactNode }) {
  const [initialHistory] = useState(loadHistory);
  const [history, dispatch] = useReducer(historyReducer, initialHistory);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const jobs = useRef(new Map<string, AbortController>());
  const historyRef = useRef(history);
  const { refresh } = useContractState();
  useEffect(() => {
    historyRef.current = history;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history, (_key, value: unknown) => typeof value === 'bigint' ? value.toString() : value)); }
    catch { /* Storage is optional; in-memory lifecycle remains available. */ }
  }, [history]);
  const patchTransaction = useCallback((id: string, patch: Partial<TransactionRecord>) => dispatch({ type: 'patch', id, patch }), []);
  const watchFinalization = useCallback((id: string, hash: string) => {
    if (jobs.current.has(id)) return;
    const controller = new AbortController(); jobs.current.set(id, controller);
    void pollUntilFinalized(hash, outcome => {
      // Appeals can return a previously accepted tx to an intermediate status.
      const patch = outcomePatch(outcome);
      // Preserve the action service's before/after evidence while recording finality.
      if (outcome.kind === 'accepted-return') delete patch.message;
      patchTransaction(id, patch);
    }, controller.signal).then(() => refresh()).catch(() => { /* Abort is not a failed transaction. */ }).finally(() => {
      if (jobs.current.get(id) === controller) jobs.current.delete(id);
    });
  }, [patchTransaction, refresh]);
  const recheck = useCallback(async (id: string, suppliedHash?: string) => {
    const hash = suppliedHash ?? historyRef.current.find(tx => tx.id === id)?.hash;
    if (!hash) { patchTransaction(id, { status: 'canceled', message: 'No hash was recorded. Submission cannot be confirmed; check wallet activity before retrying.' }); return; }
    if (jobs.current.has(id)) return;
    const controller = new AbortController(); jobs.current.set(id, controller);
    let outcome: ReceiptOutcome;
    try {
      outcome = await pollUntilAccepted(readClient, hash, progress => patchTransaction(id, outcomePatch(progress)), controller.signal);
      patchTransaction(id, outcomePatch(outcome));
    } catch { return; }
    finally { if (jobs.current.get(id) === controller) jobs.current.delete(id); }
    await refresh();
    if (outcome.kind === 'accepted-return' || outcome.kind === 'accepted-error') {
      if (outcome.statusName !== 'FINALIZED') watchFinalization(id, hash);
    }
  }, [patchTransaction, refresh, watchFinalization]);
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const tx of initialHistory) {
        if (tx.status === 'pending' || tx.status === 'unknown') void recheck(tx.id, tx.hash);
        else if (['accepted', 'rejected_by_contract'].includes(tx.status) && !tx.finalized && tx.hash) watchFinalization(tx.id, tx.hash);
      }
    }, 0);
    const running = jobs.current;
    return () => { clearTimeout(timer); for (const job of running.values()) job.abort(); running.clear(); };
  }, [initialHistory, recheck, watchFinalization]);
  const startTransaction = useCallback((operation: string) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'start', record: { id, operation, stage: 'awaiting_signature', status: 'pending', startTime: Date.now(), finalized: false } });
    setCurrentId(id); return id;
  }, []);
  const clearCurrent = useCallback(() => setCurrentId(null), []);
  const openTransaction = useCallback((id: string) => setCurrentId(id), []);
  const clearHistory = useCallback(() => { for (const controller of jobs.current.values()) controller.abort(); jobs.current.clear(); dispatch({ type: 'clear' }); setCurrentId(null); }, []);
  return <TransactionContext.Provider value={{ history, currentTransaction: history.find(tx => tx.id === currentId) ?? null,
    startTransaction, patchTransaction, clearCurrent, openTransaction, clearHistory, recheck, watchFinalization }}>{children}</TransactionContext.Provider>;
}
