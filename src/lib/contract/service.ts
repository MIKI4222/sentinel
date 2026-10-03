import { fetchContractState, writeContract, type ContractState, type TransactionResult } from "../genlayer/client";
import { CONTRACT_ADDRESS } from "../../config";

export type { ContractState, TransactionResult };

export async function readContractState(): Promise<ContractState | null> {
  return fetchContractState();
}

export interface HealthCheckResult {
  isDegraded: boolean;
  transactionResult: TransactionResult;
  stateBefore: ContractState | null;
  stateAfter: ContractState | null;
}

export async function healthCheck(
  provider: any,
  account: `0x${string}`
): Promise<HealthCheckResult> {
  const stateBefore = await fetchContractState();
  const result = await writeContract(provider, account, "health_check", []);
  const stateAfter = await fetchContractState();
  
  return {
    isDegraded: stateAfter?.lastVerdict === "degraded" || false,
    transactionResult: result,
    stateBefore,
    stateAfter,
  };
}

export interface GuardedActionResult {
  success: boolean;
  message?: string;
  transactionResult: TransactionResult;
  stateBefore: ContractState | null;
  stateAfter: ContractState | null;
}

export async function executeGuardedAction(
  provider: any,
  account: `0x${string}`,
  actionData: string
): Promise<GuardedActionResult> {
  const stateBefore = await fetchContractState();
  const result = await writeContract(provider, account, "execute_guarded_action", [actionData]);
  const stateAfter = await fetchContractState();
  
  const isUserError = result.status === "FINISHED_WITH_ERROR" && result.executionResult?.error;
  const isCircuitBreaker = isUserError && result.executionResult?.error?.includes("circuit breaker is active");
  
  return {
    success: result.status === "FINISHED_WITH_RETURN" && !isCircuitBreaker,
    message: isCircuitBreaker ? "circuit breaker is active" : result.executionResult?.returnValue as string,
    transactionResult: result,
    stateBefore,
    stateAfter,
  };
}

export interface SetMonitoredUrlResult {
  success: boolean;
  transactionResult: TransactionResult;
  stateBefore: ContractState | null;
  stateAfter: ContractState | null;
}

export async function setMonitoredUrl(
  provider: any,
  account: `0x${string}`,
  newUrl: string
): Promise<SetMonitoredUrlResult> {
  const stateBefore = await fetchContractState();
  const result = await writeContract(provider, account, "set_monitored_url", [newUrl]);
  const stateAfter = await fetchContractState();
  
  return {
    success: result.status === "FINISHED_WITH_RETURN",
    transactionResult: result,
    stateBefore,
    stateAfter,
  };
}

export interface EmergencyUnpauseResult {
  success: boolean;
  transactionResult: TransactionResult;
  stateBefore: ContractState | null;
  stateAfter: ContractState | null;
}

export async function emergencyUnpause(
  provider: any,
  account: `0x${string}`
): Promise<EmergencyUnpauseResult> {
  const stateBefore = await fetchContractState();
  const result = await writeContract(provider, account, "emergency_unpause", []);
  const stateAfter = await fetchContractState();
  
  return {
    success: result.status === "FINISHED_WITH_RETURN",
    transactionResult: result,
    stateBefore,
    stateAfter,
  };
}

export function getExplorerAddressUrl(): string {
  return `https://explorer-bradbury.genlayer.com/address/${CONTRACT_ADDRESS}`;
}

export function getExplorerTransactionUrl(txHash: string): string {
  return `https://explorer-bradbury.genlayer.com/tx/${txHash}`;
}