import { testnetBradbury } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? "0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000";
export const RPC_URL = import.meta.env.VITE_RPC_URL ?? "https://rpc-bradbury.genlayer.com";
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL ?? "https://explorer-bradbury.genlayer.com";
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 4221);
export const OWNER_ADDRESS_HINT = import.meta.env.VITE_OWNER_ADDRESS ?? undefined;
export const STALE_AFTER_MINUTES = Number(import.meta.env.VITE_STALE_AFTER_MINUTES ?? 10);
export const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL ?? (import.meta.env.DEV ? "" : "https://your-domain.com");

export const CHAIN = testnetBradbury;

// Backward compatibility exports
export const SENTINEL_CONTRACT_ADDRESS = CONTRACT_ADDRESS;
export const GENLAYER_BRADBURY_CHAIN = {
  id: 4221,
  name: "GenLayer Bradbury",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc-bradbury.genlayer.com"] } },
  blockExplorers: { default: { name: "Bradbury Explorer", url: "https://explorer-bradbury.genlayer.com" } },
  testnet: true,
};
export const EXPLORER_BASE_URL = EXPLORER_URL;
export const CONTRACT_ABI = [] as const;

export const USER_ERROR_MESSAGES = {
  "only owner can change monitored URL": "Only the contract owner can change the monitored URL.",
  "monitored URL must not be empty": "The monitored URL cannot be empty.",
  "circuit breaker is active": "The circuit breaker is active. Protected operations are blocked until recovery.",
  "only owner can unpause": "Only the contract owner can unpause the circuit breaker.",
  "operational health check required": "A fresh operational health check is required before recovery.",
  "operational verdict belongs to another URL": "The operational verdict belongs to a different URL. Run a fresh health check on the current endpoint.",
} as const;

export type UserErrorCode = keyof typeof USER_ERROR_MESSAGES;

export function getUserErrorMessage(error: string): string {
  return USER_ERROR_MESSAGES[error as UserErrorCode] ?? error;
}

export function getExplorerAddressUrl(address: string = CONTRACT_ADDRESS): string {
  return `${EXPLORER_URL}/address/${address}`;
}

export function getExplorerTransactionUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`;
}

export function validateConfig(): void {
  if (!CONTRACT_ADDRESS || !/^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS)) {
    throw new Error("Invalid VITE_CONTRACT_ADDRESS");
  }
  if (!RPC_URL || !/^https?:\/\//.test(RPC_URL)) {
    throw new Error("Invalid VITE_RPC_URL");
  }
  if (!EXPLORER_URL || !/^https?:\/\//.test(EXPLORER_URL)) {
    throw new Error("Invalid VITE_EXPLORER_URL");
  }
  if (!Number.isInteger(CHAIN_ID) || CHAIN_ID <= 0) {
    throw new Error("Invalid VITE_CHAIN_ID");
  }
  if (OWNER_ADDRESS_HINT && !/^0x[a-fA-F0-9]{40}$/.test(OWNER_ADDRESS_HINT)) {
    throw new Error("Invalid VITE_OWNER_ADDRESS");
  }
  if (!Number.isInteger(STALE_AFTER_MINUTES) || STALE_AFTER_MINUTES <= 0) {
    throw new Error("Invalid VITE_STALE_AFTER_MINUTES");
  }
}

export const DEFAULT_MONITORED_URL = "https://www.githubstatus.com/api/v2/status.json";
export const OUTAGE_TEST_URL = "https://httpbin.org/status/503";

export const VERDICT_LABELS: Record<string, { label: string; variant: "active" | "paused" | "warning" | "neutral" | "info" }> = {
  not_checked: { label: "Not Checked", variant: "neutral" },
  operational: { label: "Operational", variant: "active" },
  degraded: { label: "Degraded", variant: "warning" },
};

export const STATUS_LABELS: Record<string, { label: string; variant: "active" | "paused" }> = {
  ACTIVE: { label: "ACTIVE", variant: "active" },
  PAUSED: { label: "PAUSED", variant: "paused" },
};

export const TRANSACTION_STAGES = [
  { id: "awaiting_signature", label: "Awaiting Signature", description: "Waiting for wallet confirmation" },
  { id: "submitted", label: "Submitted", description: "Transaction sent to mempool" },
  { id: "accepted", label: "Accepted (Consensus)", description: "Validators reached consensus" },
  { id: "finalized", label: "Finalized", description: "Transaction finalized and immutable" },
  // Legacy stages for backward compatibility with existing pages
  { id: "evm-inclusion", label: "EVM Inclusion", description: "Transaction included in block" },
  { id: "genlayer-processing", label: "GenLayer Processing", description: "Intelligent Contract queued for execution" },
  { id: "consensus", label: "Consensus", description: "Validators reaching consensus" },
  { id: "decision", label: "Decision Reached", description: "Consensus decision accepted" },
  { id: "finalizing", label: "Finalizing", description: "Waiting for finality window" },
] as const;

export type TransactionStageId = typeof TRANSACTION_STAGES[number]["id"];

export const MOCK_ENDPOINTS = {
  healthy: `${PUBLIC_BASE_URL}/mock/healthy.json`,
  degraded: `${PUBLIC_BASE_URL}/mock/degraded.json`,
  unknown: `${PUBLIC_BASE_URL}/mock/unknown.json`,
} as const;