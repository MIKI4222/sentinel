import { testnetBradbury } from 'genlayer-js/chains';
export type Address = `0x${string}`;
export function address(value: unknown, name = 'address'): Address {
  if (typeof value !== 'string' || !/^0x[\da-fA-F]{40}$/.test(value)) throw new Error(`Invalid ${name}`);
  return value as Address;
}
function url(value: string, name: string): string {
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(`Invalid ${name}`);
  return value.replace(/\/+$/, '');
}
export function parseEnv(env: Record<string, unknown>) {
  const str = (key: string, fallback: string) => typeof env[key] === 'string' && env[key] !== '' ? env[key] as string : fallback;
  const chainId = Number(str('VITE_CHAIN_ID', '4221'));
  if (chainId !== testnetBradbury.id) throw new Error('VITE_CHAIN_ID must match SDK Bradbury chain 4221');
  const staleAfterMinutes = Number(str('VITE_STALE_AFTER_MINUTES', '10'));
  if (!Number.isSafeInteger(staleAfterMinutes) || staleAfterMinutes <= 0) throw new Error('Invalid VITE_STALE_AFTER_MINUTES');
  const publicBaseUrl = str('VITE_PUBLIC_BASE_URL', '');
  if (publicBaseUrl) {
    const parsed = new URL(publicBaseUrl);
    if (parsed.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('VITE_PUBLIC_BASE_URL must be a public HTTPS origin');
  }
  const owner = str('VITE_OWNER_ADDRESS', '');
  return {
    contractAddress: address(str('VITE_CONTRACT_ADDRESS', '0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000'), 'VITE_CONTRACT_ADDRESS'),
    rpcUrl: url(str('VITE_RPC_URL', 'https://rpc-bradbury.genlayer.com'), 'VITE_RPC_URL'),
    explorerUrl: url(str('VITE_EXPLORER_URL', 'https://explorer-bradbury.genlayer.com'), 'VITE_EXPLORER_URL'),
    chainId, staleAfterMinutes,
    ownerAddress: owner ? address(owner, 'VITE_OWNER_ADDRESS') : undefined,
    publicBaseUrl: publicBaseUrl ? url(publicBaseUrl, 'VITE_PUBLIC_BASE_URL') : '',
  };
}
