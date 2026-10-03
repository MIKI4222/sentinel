import { transactionsStatusNumberToName, transactionResultNumberToName, executionResultNumberToName } from 'genlayer-js/types';
import type { TransactionHash } from 'genlayer-js/types';
import { USER_ERROR_MESSAGES, type UserErrorCode } from '../../config/errors';
export function transactionHash(value: unknown): TransactionHash {
  if (typeof value !== 'string' || !/^0x[\da-fA-F]{64}$/.test(value)) throw new Error('SDK returned an invalid transaction hash');
  // SDK Hash additionally brands length=66; regex validates this at the boundary.
  return value as TransactionHash;
}
function obj(value: unknown): Record<string, unknown> { return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {}; }
function mapped(value: unknown, table: object): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint') return undefined;
  return (table as Record<string, string>)[String(value)] ?? (typeof value === 'string' ? value : undefined);
}
export function serializeReceipt(value: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(value, (_key, item: unknown) => {
    if (typeof item === 'bigint') return item.toString();
    if (item && typeof item === 'object') { if (seen.has(item)) return '[Circular]'; seen.add(item); }
    return item;
  }) ?? '';
}
export function findUserError(value: unknown): UserErrorCode | undefined {
  const text = serializeReceipt(value);
  return (Object.keys(USER_ERROR_MESSAGES) as UserErrorCode[]).find(code => text.includes(code));
}
interface Base { statusName: string; resultName?: string; executionName?: string; receipt: unknown }
export type ReceiptOutcome =
  | (Base & { kind: 'accepted-return'; returnValue?: string })
  | (Base & { kind: 'accepted-error'; userError?: UserErrorCode; error: string })
  | (Base & { kind: 'no-consensus'; reason: string })
  | (Base & { kind: 'pending' | 'unknown'; reason: string });
const failureStatuses = new Set(['UNDETERMINED', 'LEADER_TIMEOUT', 'VALIDATORS_TIMEOUT', 'CANCELED']);
const failureResults = new Set(['NO_MAJORITY', 'DISAGREE', 'TIMEOUT', 'DETERMINISTIC_VIOLATION', 'MAJORITY_DISAGREE']);
const pendingStatuses = new Set(['UNINITIALIZED', 'PENDING', 'PROPOSING', 'COMMITTING', 'REVEALING', 'APPEAL_REVEALING', 'APPEAL_COMMITTING', 'READY_TO_FINALIZE']);
export function parseReceipt(receipt: unknown): ReceiptOutcome {
  const r = obj(receipt);
  const statusName = mapped(r.statusName ?? r.status_name ?? r.status, transactionsStatusNumberToName) ?? 'UNKNOWN';
  const resultName = mapped(r.resultName ?? r.result_name ?? r.result, transactionResultNumberToName);
  const executionName = mapped(r.txExecutionResultName ?? r.tx_execution_result_name ?? r.txExecutionResult ?? r.tx_execution_result, executionResultNumberToName);
  const base = { statusName, resultName, executionName, receipt };
  const accepted = statusName === 'ACCEPTED' || statusName === 'FINALIZED';
  // NOT_VOTED / IDLE are normal before execution; never terminate a PENDING transaction on those fields alone.
  if (failureStatuses.has(statusName)) return { ...base, kind: 'no-consensus', reason: statusName };
  if (pendingStatuses.has(statusName)) return { ...base, kind: 'pending', reason: statusName };
  if (accepted && executionName === 'FINISHED_WITH_ERROR') {
    const userError = findUserError(receipt);
    const leaderReceipts = obj(r.consensus_data).leader_receipt;
    const firstLeader = Array.isArray(leaderReceipts) ? obj(leaderReceipts[0]) : obj(leaderReceipts);
    const rawError = r.error ?? r.txError ?? r.tx_error ?? firstLeader.error ?? obj(firstLeader.result).error;
    const error = userError ?? (typeof rawError === 'string' ? rawError.slice(0, 500) : 'Contract rejected the operation; inspect the raw receipt for details.');
    return { ...base, kind: 'accepted-error', userError, error };
  }
  if (accepted && executionName === 'FINISHED_WITH_RETURN') {
    // Only explicit decoded return fields. A tx hash, calldata or serialized payload is not a return value.
    const leaders = obj(r.consensus_data).leader_receipt;
    const leader = Array.isArray(leaders) ? obj(leaders[0]) : obj(leaders);
    const candidate = r.returnValue ?? r.return_value ?? obj(leader.result).returnValue ?? obj(leader.result).return_value;
    return { ...base, kind: 'accepted-return', returnValue: typeof candidate === 'string' ? candidate : undefined };
  }
  if (failureResults.has(resultName ?? '') || executionName === 'NOT_VOTED') return { ...base, kind: 'no-consensus', reason: resultName ?? executionName ?? statusName };
  return { ...base, kind: 'unknown', reason: 'Receipt does not provide a confirmed execution outcome' };
}
