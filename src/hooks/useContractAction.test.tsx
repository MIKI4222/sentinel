import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useContractAction } from './useContractAction';
const mocks = vi.hoisted(() => ({ ensureWallet: vi.fn(), start: vi.fn(), patch: vi.fn(), watch: vi.fn(), refresh: vi.fn(), read: vi.fn(), submit: vi.fn(), wait: vi.fn() }));
vi.mock('./useWallet', () => ({ useWallet: () => ({ ensureWallet: mocks.ensureWallet }) }));
vi.mock('./useTransactions', () => ({ useTransactions: () => ({ startTransaction: mocks.start, patchTransaction: mocks.patch, watchFinalization: mocks.watch }) }));
vi.mock('./useContractState', () => ({ useContractState: () => ({ refresh: mocks.refresh }) }));
vi.mock('../lib/genlayer/wallet', () => ({ getProvider: () => ({}) }));
vi.mock('../lib/genlayer/client', () => ({ fetchContractState: mocks.read, submitContract: mocks.submit, waitForAccepted: mocks.wait }));
const hash = `0x${'1'.repeat(64)}`;
const state = { status: 'ACTIVE', monitoredUrl: 'https://status.test', lastVerdict: 'operational', lastCheckedUrl: 'https://status.test', incidentCount: 0, lastCheckTimestamp: 1, guardedActionCount: 0 };
describe('useContractAction regression and outcomes', () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.ensureWallet.mockResolvedValue({ address: `0x${'2'.repeat(40)}`, chainId: 4221 });
    mocks.start.mockReturnValue('tx-id'); mocks.read.mockResolvedValue({ ok: true, state }); mocks.submit.mockResolvedValue(hash);
    mocks.wait.mockResolvedValue({ kind: 'accepted-return', statusName: 'ACCEPTED', receipt: {}, executionName: 'FINISHED_WITH_RETURN' });
  });
  it('success never enters error handling (TDZ regression); one record only', async () => {
    const { result } = renderHook(useContractAction);
    await act(async () => { expect((await result.current.executeGuardedAction('demo')).kind).toBe('result'); });
    expect(mocks.start).toHaveBeenCalledTimes(1); expect(mocks.watch).toHaveBeenCalledWith('tx-id', hash);
    expect(mocks.patch).toHaveBeenCalledWith('tx-id', expect.objectContaining({ status: 'accepted', finalized: false }));
    expect(mocks.patch).not.toHaveBeenCalledWith('tx-id', expect.objectContaining({ status: 'unknown' }));
  });
  it('first click uses the returned fresh wallet session (D6)', async () => {
    const { result } = renderHook(useContractAction);
    await act(async () => { await result.current.healthCheck(); });
    expect(mocks.ensureWallet).toHaveBeenCalledTimes(1);
    expect(mocks.submit).toHaveBeenCalledWith(expect.anything(), `0x${'2'.repeat(40)}`, 'health_check', []);
  });
  it('accepted UserError is a contract rejection, not success', async () => {
    mocks.wait.mockResolvedValue({ kind: 'accepted-error', statusName: 'ACCEPTED', error: 'circuit breaker is active', userError: 'circuit breaker is active', receipt: {} });
    const { result } = renderHook(useContractAction);
    await act(async () => { await result.current.executeGuardedAction('demo'); });
    expect(mocks.patch).toHaveBeenCalledWith('tx-id', expect.objectContaining({ status: 'rejected_by_contract' }));
  });
  it.each([['no-consensus', 'UNDETERMINED', 'no_consensus'], ['unknown', 'PENDING', 'unknown']])('%s is never accepted', async (kind, statusName, status) => {
    mocks.wait.mockResolvedValue({ kind, statusName, reason: 'unconfirmed', receipt: {} });
    const { result } = renderHook(useContractAction);
    await act(async () => { await result.current.healthCheck(); });
    expect(mocks.patch).toHaveBeenCalledWith('tx-id', expect.objectContaining({ status })); expect(mocks.watch).not.toHaveBeenCalled();
  });
  it('4001 signature rejection is canceled', async () => {
    mocks.submit.mockRejectedValue({ code: 4001, message: 'User rejected' });
    const { result } = renderHook(useContractAction);
    await act(async () => { expect((await result.current.healthCheck()).kind).toBe('canceled'); });
    expect(mocks.patch).toHaveBeenCalledWith('tx-id', expect.objectContaining({ status: 'canceled' }));
  });
  it('unchanged timestamp does not claim a completed check', async () => {
    const { result } = renderHook(useContractAction);
    await act(async () => { const completion = await result.current.healthCheck(); if (completion.kind === 'result') expect(completion.result.evidence).toContain('did not change'); });
  });
});
