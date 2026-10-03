import { useContext } from 'react';
import { TransactionContext } from '../context/transactions';
export function useTransactions() { const context = useContext(TransactionContext); if (!context) throw new Error('Missing TransactionProvider'); return context; }
