import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { fetchContractState, type ContractState } from "../lib/genlayer/client";
import { STALE_AFTER_MINUTES } from "../config";

interface ContractStateContextType {
  state: ContractState | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isStale: boolean;
}

const ContractStateContext = createContext<ContractStateContextType | null>(null);

export function ContractStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContractState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contractState = await fetchContractState();
      setState(contractState);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contract state");
      setState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isStale = state ? (Date.now() - state.lastCheckTimestamp * 1000) / 60000 > STALE_AFTER_MINUTES : true;

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ContractStateContext.Provider
      value={{
        state,
        isLoading,
        error,
        refresh,
        isStale,
      }}
    >
      {children}
    </ContractStateContext.Provider>
  );
}

export function useContractState() {
  const context = useContext(ContractStateContext);
  if (!context) {
    throw new Error("useContractState must be used within a ContractStateProvider");
  }
  return context;
}