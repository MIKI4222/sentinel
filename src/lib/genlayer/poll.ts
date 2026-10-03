import { parseReceipt, transactionHash, type ReceiptOutcome } from './receipt';
export interface TransactionReader { getTransaction: (args: { hash: ReturnType<typeof transactionHash> }) => Promise<unknown> }
export type Progress = (outcome: ReceiptOutcome) => void;
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(signal.reason ?? new Error('Aborted')); return; }
    const onAbort = () => { clearTimeout(timer); reject(signal?.reason ?? new Error('Aborted')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
export async function pollUntilAccepted(client: TransactionReader, hash: string, onProgress: Progress = () => {}, signal?: AbortSignal,
  options: { interval?: number; timeout?: number } = {}): Promise<ReceiptOutcome> {
  const deadline = Date.now() + (options.timeout ?? 360_000);
  const interval = options.interval ?? 4_000;
  let last: ReceiptOutcome = { kind: 'unknown', statusName: 'UNKNOWN', reason: 'Transaction has not been read yet', receipt: null };
  do {
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
    try {
      last = parseReceipt(await client.getTransaction({ hash: transactionHash(hash) }));
      onProgress(last);
      if (['accepted-return', 'accepted-error', 'no-consensus'].includes(last.kind)) return last;
    } catch (error) {
      if (signal?.aborted) throw error;
      last = { ...last, kind: 'unknown', reason: error instanceof Error ? error.message : 'RPC unavailable' };
    }
    if (Date.now() >= deadline) break;
    await delay(Math.min(interval, Math.max(0, deadline - Date.now())), signal);
  } while (Date.now() <= deadline);
  return { ...last, kind: 'unknown', reason: 'Polling deadline reached. This is not a transaction failure; check again later.' };
}
export async function pollUntilFinalized(client: TransactionReader, hash: string, onProgress: Progress, signal: AbortSignal): Promise<ReceiptOutcome> {
  while (!signal.aborted) {
    try {
      const outcome = parseReceipt(await client.getTransaction({ hash: transactionHash(hash) }));
      onProgress(outcome);
      if (outcome.statusName === 'FINALIZED' || outcome.kind === 'no-consensus') return outcome;
    } catch (error) { if (signal.aborted) throw error; }
    await delay(5_000, signal);
  }
  throw signal.reason ?? new Error('Aborted');
}
