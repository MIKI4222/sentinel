import { useContext } from 'react';
import { ContractStateContext } from '../context/contract-state';
export function useContractState() { const context = useContext(ContractStateContext); if (!context) throw new Error('Missing ContractStateProvider'); return context; }
