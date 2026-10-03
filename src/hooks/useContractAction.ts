import { useCallback, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useTransaction } from "../context/TransactionContext";
import { useContractState } from "../context/ContractStateContext";
import {
  healthCheck,
  executeGuardedAction,
  setMonitoredUrl,
  emergencyUnpause,
} from "../lib/contract/service";
import { getUserErrorMessage } from "../config";

type ActionType = "health_check" | "execute_guarded_action" | "set_monitored_url" | "emergency_unpause";

interface UseContractActionOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export function useContractAction() {
  const { isConnected, address, connect, isCorrectNetwork, switchNetwork } = useWallet();
  const { startTransaction, updateStage, completeTransaction, failTransaction } = useTransaction();
  const { refresh } = useContractState();
  const [isExecuting, setIsExecuting] = useState(false);

  const ensureWallet = useCallback(async (): Promise<`0x${string}` | null> => {
    if (!isConnected) {
      await connect();
    }
    if (!isConnected || !address) {
      return null;
    }
    if (!isCorrectNetwork) {
      const switched = await switchNetwork();
      if (!switched) return null;
    }
    return address;
  }, [isConnected, address, connect, isCorrectNetwork, switchNetwork]);

  const executeAction = useCallback(
    async (
      actionType: ActionType,
      args: unknown[],
      options: UseContractActionOptions = {}
    ): Promise<any> => {
      const userAddress = await ensureWallet();
      if (!userAddress) {
        const error = "Wallet not connected or wrong network";
        options.onError?.(error);
        throw new Error(error);
      }

      setIsExecuting(true);
      const txId = startTransaction(actionType);

      try {
        updateStage(txId, "awaiting_signature");
        updateStage(txId, "submitted");

        let result: any;

        switch (actionType) {
          case "health_check":
            result = await healthCheck(window.ethereum, userAddress);
            break;
          case "execute_guarded_action":
            result = await executeGuardedAction(window.ethereum, userAddress, args[0] as string);
            break;
          case "set_monitored_url":
            result = await setMonitoredUrl(window.ethereum, userAddress, args[0] as string);
            break;
          case "emergency_unpause":
            result = await emergencyUnpause(window.ethereum, userAddress);
            break;
          default:
            throw new Error(`Unknown action type: ${actionType}`);
        }

        updateStage(txId, "accepted");

        // Check for UserError in execution result
        const isUserError = result.transactionResult.status === "FINISHED_WITH_ERROR";
        const userErrorMessage = isUserError
          ? getUserErrorMessage(result.transactionResult.executionResult?.error || "")
          : null;

        if (userErrorMessage) {
          updateStage(txId, "finalized");
          failTransaction(txId, userErrorMessage);
          options.onError?.(userErrorMessage);
          await refresh();
          return { ...result, userError: userErrorMessage };
        }

        if (result.transactionResult.status === "UNDETERMINED" || 
            result.transactionResult.status === "NOT_VOTED" || 
            result.transactionResult.status === "LEADER_TIMEOUT") {
          updateStage(txId, "finalized");
          const error = "Validators did not reach consensus. Contract state unchanged. You can retry.";
          failTransaction(txId, error);
          options.onError?.(error);
          await refresh();
          return { ...result, consensusError: error };
        }

        // For successful transactions, wait for finalization in background
        updateStage(txId, "finalized");
        completeTransaction(txId, result.transactionResult.hash, result.stateAfter);
        options.onSuccess?.(result);
        await refresh();
        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Transaction failed";
        failTransaction(txId, errorMessage);
        options.onError?.(errorMessage);
        throw error;
      } finally {
        setIsExecuting(false);
      }
    },
    [ensureWallet, startTransaction, updateStage, completeTransaction, failTransaction, refresh]
  );

  const healthCheckAction = useCallback(
    (options?: UseContractActionOptions) => executeAction("health_check", [], options),
    [executeAction]
  );

  const executeGuardedActionAction = useCallback(
    (actionData: string, options?: UseContractActionOptions) =>
      executeAction("execute_guarded_action", [actionData], options),
    [executeAction]
  );

  const setMonitoredUrlAction = useCallback(
    (newUrl: string, options?: UseContractActionOptions) =>
      executeAction("set_monitored_url", [newUrl], options),
    [executeAction]
  );

  const emergencyUnpauseAction = useCallback(
    (options?: UseContractActionOptions) => executeAction("emergency_unpause", [], options),
    [executeAction]
  );

  return {
    isExecuting,
    healthCheck: healthCheckAction,
    executeGuardedAction: executeGuardedActionAction,
    setMonitoredUrl: setMonitoredUrlAction,
    emergencyUnpause: emergencyUnpauseAction,
  };
}