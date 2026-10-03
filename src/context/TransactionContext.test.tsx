import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { TransactionProvider } from './TransactionContext';
import { useTransactions } from '../hooks/useTransactions';
import { STORAGE_KEY, type TransactionRecord } from './transactions';
const sdk = vi.hoisted(() => ({ getTransaction: vi.fn(), final: vi.fn(), refresh: vi.fn() }));
vi.mock('../lib/genlayer/client', () => ({ readClient: { getTransaction: sdk.getTransaction }, pollUntilFinalized: sdk.final }));
vi.mock('../hooks/useContractState', () => ({ useContractState: () => ({ refresh: sdk.refresh }) }));
const hash = `0x${'1'.repeat(64)}`;
const record: TransactionRecord = { id: 'restore', operation: 'health_check', stage: 'submitted', status: 'pending', startTime: 1, hash, finalized: false };
function Wrapper({ children }: { children: ReactNode }) { return <TransactionProvider>{children}</TransactionProvider>; }
describe('pending history actually resumes RPC polling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sdk.getTransaction.mockResolvedValue({ statusName: 'FINALIZED', txExecutionResultName: 'FINISHED_WITH_RETURN' });
    sdk.final.mockResolvedValue({ statusName: 'FINALIZED', kind: 'accepted-return' });
  });
  it('recovers a hash without requesting a wallet signature', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([record]));
    const hook = renderHook(useTransactions, { wrapper: Wrapper });
    await waitFor(() => expect(hook.result.current.history[0]).toMatchObject({ status: 'accepted', finalized: true }));
    expect(sdk.getTransaction).toHaveBeenCalledWith({ hash });
    hook.unmount();
  });
  it('does not leave a hashless record permanently pending', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...record, hash: undefined }]));
    const hook = renderHook(useTransactions, { wrapper: Wrapper });
    await waitFor(() => expect(hook.result.current.history[0].status).toBe('canceled'));
    expect(sdk.getTransaction).not.toHaveBeenCalled();
    hook.unmount();
  });
});
