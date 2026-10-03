import { useCallback, useRef, useState } from 'react';
import { useWallet } from './useWallet';
import { useTransactions } from './useTransactions';
import { useContractState } from './useContractState';
import { getProvider } from '../lib/genlayer/wallet';
import { performAction, type ActionResult } from '../lib/contract/service';
import type { ActionType } from '../lib/genlayer/client';
import { errorMessage, isSignatureRejected } from '../config/errors';
import { getUserErrorMessage } from '../config';
export type ActionCompletion = { kind: 'result'; result: ActionResult } | { kind: 'canceled' | 'transport-error'; error: string };
export function useContractAction() {
  const { ensureWallet } = useWallet();
  const { startTransaction, patchTransaction, watchFinalization } = useTransactions();
  const { refresh } = useContractState();
  const [isExecuting, setExecuting] = useState(false);
  const busy = useRef(false);
  const execute = useCallback(async (action: ActionType, args: string[] = []): Promise<ActionCompletion> => {
    if (busy.current) return { kind: 'transport-error', error: 'An operation is already being submitted from this page.' };
    busy.current = true; setExecuting(true);
    const id = startTransaction(action);
    let submittedHash: string | undefined;
    try {
      // Returned session is authoritative; never read pre-connect React state.
      const session = await ensureWallet();
      const result = await performAction(action, args, getProvider(), session.address, {
        onSignature: () => patchTransaction(id, { stage: 'awaiting_signature', message: 'Confirm the operation in your wallet.' }),
        onSubmitted: hash => { submittedHash = hash; patchTransaction(id, { hash, submittedAt: Date.now(), stage: 'submitted', message: 'Hash received. Waiting for consensus.' }); },
        onProgress: progress => patchTransaction(id, { statusName: progress.statusName, stage: ['ACCEPTED', 'FINALIZED'].includes(progress.statusName) ? 'accepted' : 'processing' }),
      });
      const o = result.outcome;
      const status = o.kind === 'accepted-return' ? 'accepted' : o.kind === 'accepted-error' ? 'rejected_by_contract' : o.kind === 'no-consensus' ? 'no_consensus' : 'unknown';
      const message = o.kind === 'accepted-return' ? result.evidence : o.kind === 'accepted-error' ? getUserErrorMessage(o.error) : o.kind === 'no-consensus'
        ? 'Validators did not reach consensus. This transaction did not change the contract state or enable the pause. Other transactions may still change state. You can retry.' : o.reason;
      patchTransaction(id, { hash: result.hash, result, status, message, statusName: o.statusName, finalized: o.statusName === 'FINALIZED',
        stage: o.statusName === 'FINALIZED' ? 'finalized' : ['accepted-return', 'accepted-error'].includes(o.kind) ? 'accepted' : 'processing', endTime: Date.now() });
      if (['accepted-return', 'accepted-error'].includes(o.kind) && o.statusName !== 'FINALIZED') watchFinalization(id, result.hash);
      await refresh();
      return { kind: 'result', result };
    } catch (error) {
      const canceled = !submittedHash && isSignatureRejected(error);
      const message = errorMessage(error);
      patchTransaction(id, { status: canceled ? 'canceled' : 'unknown', hash: submittedHash, message, endTime: Date.now() });
      return { kind: canceled ? 'canceled' : 'transport-error', error: message };
    } finally { busy.current = false; setExecuting(false); }
  }, [ensureWallet, startTransaction, patchTransaction, refresh, watchFinalization]);
  return { isExecuting, execute,
    healthCheck: () => execute('health_check'),
    setMonitoredUrl: (url: string) => execute('set_monitored_url', [url]),
    executeGuardedAction: (data: string) => execute('execute_guarded_action', [data]),
    emergencyUnpause: () => execute('emergency_unpause') };
}
