import { createClient } from 'genlayer-js';
import type { EIP1193Provider } from 'viem';
import { CONTRACT_ADDRESS, RPC_URL, CHAIN, CHAIN_ID } from '../../config';
import type { Address } from '../../config/env';
import { readState } from './state';
import { transactionHash } from './receipt';
import { pollUntilAccepted, pollUntilFinalized as pollFinal, type Progress } from './poll';
export type { ContractState, StateResult } from './state';
export type { ReceiptOutcome } from './receipt';
export type GenLayerClient = ReturnType<typeof createClient>;
// SDK 1.1.8 refers to an undeclared global EthereumProvider; use its installed viem EIP-1193 type.
export type EthereumProvider = EIP1193Provider;
export const readClient = createClient({ chain: CHAIN, endpoint: RPC_URL });
export function getReadClient(): GenLayerClient { return readClient; }
let cached: { provider: EthereumProvider; account: Address; client: GenLayerClient } | undefined;
export function getWriteClient(provider: EthereumProvider, account: Address): GenLayerClient {
  if (cached && cached.provider === provider && cached.account === account) return cached.client;
  const client = createClient({ chain: CHAIN, endpoint: RPC_URL, provider, account });
  cached = { provider, account, client };
  return client;
}
export function resetWriteClient(): void { cached = undefined; }
export function fetchContractState() { return readState(functionName => readClient.readContract({ address: CONTRACT_ADDRESS, functionName, args: [] })); }
export type ActionType = 'health_check' | 'execute_guarded_action' | 'set_monitored_url' | 'emergency_unpause';
export async function submitContract(provider: EthereumProvider, account: Address, functionName: ActionType, args: string[]): Promise<string> {
  const currentChain: unknown = await provider.request({ method: 'eth_chainId' });
  const accounts: unknown = await provider.request({ method: 'eth_accounts' });
  if (typeof currentChain !== 'string' || Number(BigInt(currentChain)) !== CHAIN_ID) { resetWriteClient(); throw new Error('Network changed before submission. Switch to Bradbury and retry.'); }
  if (!Array.isArray(accounts) || typeof accounts[0] !== 'string' || accounts[0].toLowerCase() !== account.toLowerCase()) { resetWriteClient(); throw new Error('Wallet account changed before submission. Review the active account and retry.'); }
  // SDK 1.1.8 declares Promise<any>; contain it as unknown and validate at runtime.
  const hash: unknown = await getWriteClient(provider, account).writeContract({ address: CONTRACT_ADDRESS, functionName, args, value: 0n });
  return transactionHash(hash);
}
export function waitForAccepted(hash: string, onProgress?: Progress, signal?: AbortSignal) { return pollUntilAccepted(readClient, hash, onProgress, signal); }
export function pollUntilFinalized(hash: string, onProgress: Progress, signal: AbortSignal) { return pollFinal(readClient, hash, onProgress, signal); }
export function formatAddress(value: string, chars = 4): string { return value ? `${value.slice(0, chars + 2)}...${value.slice(-chars)}` : ''; }
export function formatTxHash(value: string, chars = 6): string { return formatAddress(value, chars); }
export function formatTimestamp(timestamp: number | bigint): string { return new Date(Number(timestamp) * 1000).toLocaleString(); }
export function formatRelativeTime(timestamp: number | bigint, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor(now / 1000 - Number(timestamp)));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}
export function isVerdictStale(timestamp: number, minutes: number, now = Date.now()): boolean { return timestamp === 0 || now - timestamp * 1000 > minutes * 60_000; }
