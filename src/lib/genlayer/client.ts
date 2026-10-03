import { createClient } from "genlayer-js";
import { CONTRACT_ADDRESS, RPC_URL, CHAIN, validateConfig } from "../../config";

validateConfig();

let readClientInstance: any = null;
let writeClientInstance: any = null;

export function getReadClient(): any {
  if (!readClientInstance) {
    readClientInstance = createClient({
      chain: CHAIN,
      endpoint: RPC_URL,
    });
  }
  return readClientInstance;
}

export function getWriteClient(provider?: any, account?: `0x${string}`): any {
  if (!writeClientInstance || provider) {
    writeClientInstance = createClient({
      chain: CHAIN,
      endpoint: RPC_URL,
      provider,
      account,
    });
  }
  return writeClientInstance;
}

export function resetWriteClient(): void {
  writeClientInstance = null;
}

export interface ContractState {
  status: "ACTIVE" | "PAUSED";
  monitoredUrl: string;
  lastVerdict: "not_checked" | "operational" | "degraded";
  lastCheckedUrl: string;
  incidentCount: number;
  lastCheckTimestamp: number;
  guardedActionCount: number;
}

export interface TransactionResult {
  hash: string;
  status: "ACCEPTED" | "FINALIZED" | "FINISHED_WITH_ERROR" | "FINISHED_WITH_RETURN" | "UNDETERMINED" | "NOT_VOTED" | "LEADER_TIMEOUT";
  executionResult?: {
    returnValue?: unknown;
    error?: string;
  };
  receipt?: any;
}

export async function fetchContractState(): Promise<ContractState | null> {
  try {
    const client = getReadClient();
    const contract = client.contract({
      address: CONTRACT_ADDRESS,
      abi: [
        { name: "get_status", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
        { name: "get_monitored_url", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
        { name: "get_last_verdict", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
        { name: "get_last_checked_url", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
        { name: "get_incident_count", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
        { name: "get_last_check_timestamp", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint64" }] },
        { name: "get_guarded_action_count", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
      ],
    });

    const [status, monitoredUrl, lastVerdict, lastCheckedUrl, incidentCount, lastCheckTimestamp, guardedActionCount] =
      await Promise.all([
        contract.read.get_status(),
        contract.read.get_monitored_url(),
        contract.read.get_last_verdict(),
        contract.read.get_last_checked_url(),
        contract.read.get_incident_count(),
        contract.read.get_last_check_timestamp(),
        contract.read.get_guarded_action_count(),
      ]);

    return {
      status: status as "ACTIVE" | "PAUSED",
      monitoredUrl: monitoredUrl as string,
      lastVerdict: lastVerdict as "not_checked" | "operational" | "degraded",
      lastCheckedUrl: lastCheckedUrl as string,
      incidentCount: Number(incidentCount),
      lastCheckTimestamp: Number(lastCheckTimestamp),
      guardedActionCount: Number(guardedActionCount),
    };
  } catch (error) {
    console.error("Failed to fetch contract state:", error);
    return null;
  }
}

export async function writeContract(
  provider: any,
  account: `0x${string}`,
  functionName: "set_monitored_url" | "health_check" | "execute_guarded_action" | "emergency_unpause",
  args: unknown[]
): Promise<TransactionResult> {
  const client = getWriteClient(provider, account);
  const contract = client.contract({
    address: CONTRACT_ADDRESS,
    abi: [
      { name: "set_monitored_url", type: "function", stateMutability: "nonpayable", inputs: [{ name: "new_url", type: "string" }], outputs: [{ type: "bool" }] },
      { name: "health_check", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [{ type: "bool" }] },
      { name: "execute_guarded_action", type: "function", stateMutability: "nonpayable", inputs: [{ name: "action_data", type: "string" }], outputs: [{ type: "string" }] },
      { name: "emergency_unpause", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [{ type: "bool" }] },
    ],
  });

  try {
    const hash = await contract.write[functionName](...args);
    
    // Wait for ACCEPTED (consensus reached)
    const receipt = await client.waitForTransactionReceipt({ hash, status: "ACCEPTED" });
    
    return {
      hash,
      status: receipt.status,
      executionResult: receipt.executionResult,
      receipt,
    };
  } catch (error) {
    console.error(`Contract write ${functionName} failed:`, error);
    throw error;
  }
}

export async function waitForFinalized(hash: string, timeoutMs = 300000): Promise<TransactionResult> {
  const client = getReadClient();
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const receipt = await client.getTransactionReceipt({ hash });
      if (receipt.status === "FINALIZED" || receipt.status === "FINISHED_WITH_RETURN" || receipt.status === "FINISHED_WITH_ERROR") {
        return {
          hash,
          status: receipt.status,
          executionResult: receipt.executionResult,
          receipt,
        };
      }
    } catch (error) {
      // Transaction not found yet
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  
  throw new Error("Finalization timeout");
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTxHash(hash: string, chars = 6): string {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function formatTimestamp(timestamp: number | bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatRelativeTime(timestamp: number | bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function isVerdictStale(lastCheckTimestamp: number, staleAfterMinutes: number): boolean {
  if (lastCheckTimestamp === 0) return true;
  const ageMinutes = (Date.now() - lastCheckTimestamp * 1000) / 60000;
  return ageMinutes > staleAfterMinutes;
}