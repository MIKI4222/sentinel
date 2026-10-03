import { describe, it, expect, vi } from 'vitest';
import { normalizeUint, normalizeString, readState, VIEW_METHODS } from './state';
describe('state normalization', () => {
  it.each([0, 42, 42n, 4294967295n])('normalizes u32 %s', value => expect(normalizeUint(value, 32, 'count')).toBe(Number(value)));
  it('normalizes safe u64 bigint', () => expect(normalizeUint(1700000000n, 64, 'timestamp')).toBe(1700000000));
  it.each([NaN, Infinity, -1, 1.5, '42', 4294967296n])('rejects invalid u32 %s', value => expect(() => normalizeUint(value, 32, 'count')).toThrow());
  it('rejects unsafe u64', () => expect(() => normalizeUint(9007199254740992n, 64, 'timestamp')).toThrow());
  it('does not silently stringify objects', () => expect(() => normalizeString({}, 'url')).toThrow());
  it('reads all seven views', async () => {
    const values = ['ACTIVE', 'https://status.test', 'operational', 'https://status.test', 1n, 1700000000n, 2];
    const read = vi.fn(async (method: string) => values[VIEW_METHODS.indexOf(method as typeof VIEW_METHODS[number])]);
    expect(await readState(read)).toMatchObject({ ok: true, state: { incidentCount: 1, guardedActionCount: 2 } });
    expect(read).toHaveBeenCalledTimes(7);
  });
  it('returns an explicit read error', async () => expect(await readState(async () => { throw new Error('RPC down'); })).toEqual({ ok: false, error: 'RPC down' }));
});
