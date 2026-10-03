import { describe, it, expect, vi } from 'vitest';
import type { EthereumProvider } from './client';
import { ensureWalletSession, formatWei } from './wallet';
describe('wallet session without stale closures', () => {
  it('connects from the first click and re-reads chain', async () => {
    const request = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([`0x${'2'.repeat(40)}`]).mockResolvedValueOnce('0x107d');
    const provider = { request } as unknown as EthereumProvider;
    expect(await ensureWalletSession(provider)).toMatchObject({ chainId: 4221 });
    expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
  });
  it('keeps balance precision', () => expect(formatWei(1234567890123456789n)).toBe('1.234567890123456789'));
});
