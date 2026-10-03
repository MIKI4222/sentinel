import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { WalletContext, type WalletSession } from './wallet';
import { CHAIN_ID } from '../config';
import { errorMessage } from '../config/errors';
import { resetWriteClient } from '../lib/genlayer/client';
import {
  getProvider,
  readSession,
  ensureWalletSession,
  switchToBradbury,
  formatWei,
} from '../lib/genlayer/wallet';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [isConnecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const epoch = useRef(0);

  const invalidatePendingBalance = useCallback(() => {
    // Invalidate request IDs, not a DOM ref captured by an effect cleanup.
    epoch.current += 1;
  }, []);

  const apply = useCallback(async (next: WalletSession | null) => {
    const id = ++epoch.current;
    resetWriteClient();
    setSession(next);
    setBalance(null);
    setError(next && next.chainId !== CHAIN_ID ? 'Wrong network. Switch to Bradbury.' : null);
    if (!next) return;

    try {
      const wei: unknown = await getProvider().request({
        method: 'eth_getBalance',
        params: [next.address, 'latest'],
      });
      if (id === epoch.current && typeof wei === 'string') {
        setBalance(formatWei(BigInt(wei)));
      }
    } catch {
      // Balance display must not prevent wallet connection.
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const next = await readSession(getProvider(), true);
      if (!next) throw new Error('No wallet account selected');
      await apply(next);
      return next;
    } catch (error) {
      setError(errorMessage(error));
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [apply]);

  const ensureWallet = useCallback(async () => {
    setConnecting(true);
    try {
      const next = await ensureWalletSession(getProvider());
      await apply(next);
      return next;
    } catch (error) {
      setError(errorMessage(error));
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [apply]);

  const switchNetwork = useCallback(async () => {
    try {
      await switchToBradbury(getProvider());
      return await ensureWallet();
    } catch (error) {
      setError(errorMessage(error));
      throw error;
    }
  }, [ensureWallet]);

  const disconnect = useCallback(() => {
    invalidatePendingBalance();
    resetWriteClient();
    setSession(null);
    setBalance(null);
    setError(null);
  }, [invalidatePendingBalance]);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;
    let active = true;

    const restore = async () => {
      // Invalidate clients immediately on account/network events, before awaiting RPC.
      resetWriteClient();
      try {
        const next = await readSession(provider);
        if (active) await apply(next);
      } catch (error) {
        if (active) setError(errorMessage(error));
      }
    };

    const listener = () => {
      void restore();
    };

    void restore();
    provider.on('accountsChanged', listener);
    provider.on('chainChanged', listener);

    return () => {
      active = false;
      invalidatePendingBalance();
      provider.removeListener('accountsChanged', listener);
      provider.removeListener('chainChanged', listener);
    };
  }, [apply, invalidatePendingBalance]);

  return (
    <WalletContext.Provider
      value={{
        address: session?.address ?? null,
        chainId: session?.chainId ?? null,
        balance,
        error,
        isConnected: !!session,
        isConnecting,
        isCorrectNetwork: session?.chainId === CHAIN_ID,
        connect,
        ensureWallet,
        switchNetwork,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
