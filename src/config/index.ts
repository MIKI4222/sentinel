import { testnetBradbury } from 'genlayer-js/chains';
import { parseEnv } from './env';
export { USER_ERROR_MESSAGES, getUserErrorMessage } from './errors';
export type { UserErrorCode } from './errors';
const config = parseEnv(import.meta.env ?? {});
export const CONTRACT_ADDRESS = config.contractAddress;
export const RPC_URL = config.rpcUrl;
export const EXPLORER_URL = config.explorerUrl;
export const CHAIN_ID = config.chainId;
export const OWNER_ADDRESS_HINT = config.ownerAddress;
export const STALE_AFTER_MINUTES = config.staleAfterMinutes;
export const PUBLIC_BASE_URL = config.publicBaseUrl;
export const CHAIN = testnetBradbury;
export function getExplorerAddressUrl(address: string = CONTRACT_ADDRESS): string { return `${EXPLORER_URL}/address/${encodeURIComponent(address)}`; }
export function getExplorerTransactionUrl(hash: string): string { return `${EXPLORER_URL}/tx/${encodeURIComponent(hash)}`; }
export const DEFAULT_MONITORED_URL = 'https://www.githubstatus.com/api/v2/status.json';
export const MOCK_ENDPOINTS = PUBLIC_BASE_URL ? {
  healthy: `${PUBLIC_BASE_URL}/mock/healthy.json`,
  degraded: `${PUBLIC_BASE_URL}/mock/degraded.json`,
  unknown: `${PUBLIC_BASE_URL}/mock/unknown.json`,
} : null;
export const TRANSACTION_STAGES = ['awaiting_signature', 'submitted', 'processing', 'accepted', 'finalized'] as const;
export type TransactionStageId = typeof TRANSACTION_STAGES[number];
