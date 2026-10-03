import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { fetchContractState, isVerdictStale, type ContractState } from '../lib/genlayer/client';
import { ContractStateContext } from './contract-state';
import { STALE_AFTER_MINUTES } from '../config';
import { useClock } from '../hooks/useClock';

export function ContractStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContractState | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const now = useClock();

  const invalidatePendingReads = useCallback(() => {
    // Invalidate request IDs, not a DOM ref captured by an effect cleanup.
    generation.current += 1;
  }, []);

  const refresh = useCallback(async () => {
    const id = ++generation.current;
    setLoading(true);
    const result = await fetchContractState();
    if (generation.current !== id) return;

    if (result.ok) {
      setState(result.state);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Schedule the asynchronous initial read without synchronous effect state updates.
    const timer = setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      clearTimeout(timer);
      invalidatePendingReads();
    };
  }, [refresh, invalidatePendingReads]);

  const isStale = !state || isVerdictStale(state.lastCheckTimestamp, STALE_AFTER_MINUTES, now);

  return (
    <ContractStateContext.Provider value={{ state, isLoading, error, refresh, isStale, now }}>
      {children}
    </ContractStateContext.Provider>
  );
}
