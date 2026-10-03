import { createContext } from 'react';
import type { ContractState } from '../lib/genlayer/state';
export interface ContractStateContextType { state: ContractState | null; isLoading: boolean; error: string | null; refresh: () => Promise<void>; isStale: boolean; now: number }
export const ContractStateContext = createContext<ContractStateContextType | null>(null);
