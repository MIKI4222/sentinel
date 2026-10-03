import { useContext } from 'react';
import { WalletContext } from '../context/wallet';
export function useWallet() { const context = useContext(WalletContext); if (!context) throw new Error('Missing WalletProvider'); return context; }
