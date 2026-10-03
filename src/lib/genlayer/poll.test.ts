import { describe, it, expect, vi } from 'vitest';
import { pollUntilAccepted, pollUntilFinalized } from './poll';
const hash = `0x${'1'.repeat(64)}`;
describe('real lifecycle polling', () => {
  it('continues beyond pending NOT_VOTED', async () => {
    vi.useFakeTimers();
    const getTransaction = vi.fn().mockResolvedValueOnce({ statusName: 'PENDING', txExecutionResultName: 'NOT_VOTED' }).mockResolvedValue({ statusName: 'ACCEPTED', txExecutionResultName: 'FINISHED_WITH_RETURN' });
    const promise = pollUntilAccepted({ getTransaction }, hash);
    await vi.advanceTimersByTimeAsync(4000);
    expect((await promise).kind).toBe('accepted-return');
    expect(getTransaction).toHaveBeenCalledTimes(2);
  });
  it('deadline gives unknown, not success/failure', async () => {
    vi.useFakeTimers();
    const promise = pollUntilAccepted({ getTransaction: vi.fn().mockResolvedValue({ statusName: 'PENDING' }) }, hash, undefined, undefined, { timeout: 8000 });
    await vi.advanceTimersByTimeAsync(9000);
    expect((await promise).kind).toBe('unknown');
  });
  it('does not infer finality from ACCEPTED', async () => {
    vi.useFakeTimers();
    const getTransaction = vi.fn().mockResolvedValueOnce({ statusName: 'ACCEPTED', txExecutionResultName: 'FINISHED_WITH_RETURN' }).mockResolvedValue({ statusName: 'FINALIZED', txExecutionResultName: 'FINISHED_WITH_RETURN' });
    const promise = pollUntilFinalized({ getTransaction }, hash, () => {}, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(5000);
    expect((await promise).statusName).toBe('FINALIZED');
  });
});
