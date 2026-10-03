import { describe, it, expect } from 'vitest';
import { parseEnv } from './env';
describe('validated environment', () => {
  it('has safe defaults with mock controls hidden', () => expect(parseEnv({})).toMatchObject({ chainId: 4221, publicBaseUrl: '', staleAfterMinutes: 10 }));
  it.each([{ VITE_CONTRACT_ADDRESS: 'bad' }, { VITE_RPC_URL: 'file:///bad' }, { VITE_CHAIN_ID: '41234' }, { VITE_STALE_AFTER_MINUTES: 'NaN' }, { VITE_OWNER_ADDRESS: '0x1' }, { VITE_PUBLIC_BASE_URL: 'https://localhost' }, { VITE_PUBLIC_BASE_URL: 'https://example.com/path' }])('rejects invalid env %j', env => expect(() => parseEnv(env)).toThrow());
});
