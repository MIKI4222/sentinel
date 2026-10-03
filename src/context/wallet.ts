import { createContext } from 'react';
import type { Address } from '../config/env';
export interface WalletSession { address: Address; chainId: number }
export interface WalletContextType {
  address: Address | null; chainId: number | null; balance: string | null; error: string | null;
  isConnected: boolean; isConnecting: boolean; isCorrectNetwork: boolean;
  connect: () => Promise<WalletSession>; ensureWallet: () => Promise<WalletSession>;
  switchNetwork: () => Promise<WalletSession>; disconnect: () => void;
}
export const WalletContext = createContext<WalletContextType | null>(null);
