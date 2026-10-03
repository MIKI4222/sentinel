import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getReadClient, getWriteClient, resetWriteClient } from "../lib/genlayer/client";
import { CHAIN_ID, RPC_URL, validateConfig } from "../config";

validateConfig();

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  balance: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<boolean>;
  readClient: ReturnType<typeof getReadClient>;
  getWriteClient: (provider: any, account: `0x${string}`) => any;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readClient = getReadClient();

  const checkConnection = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("No wallet detected. Please install MetaMask or a compatible wallet.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        await connect();
      }
    } catch (err) {
      console.error("Failed to check connection:", err);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No wallet detected");
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const userAddress = accounts[0] as `0x${string}`;
      const network = await window.ethereum.request({ method: "eth_chainId" });
      const userChainId = parseInt(network, 16);

      setAddress(userAddress);
      setChainId(userChainId);
      setIsCorrectNetwork(userChainId === CHAIN_ID);
      setIsConnected(true);

      // Get balance
      try {
        const balanceHex = await window.ethereum.request({
          method: "eth_getBalance",
          params: [userAddress, "latest"],
        });
        const balanceInWei = BigInt(balanceHex);
        const balanceInGen = Number(balanceInWei) / 1e18;
        setBalance(balanceInGen.toFixed(4));
      } catch (err) {
        console.error("Failed to get balance:", err);
      }

      // Reset write client with new provider/account
      getWriteClient(window.ethereum, userAddress);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    setBalance(null);
    setError(null);
    resetWriteClient();
  }, []);

  const switchNetwork = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
      return true;
    } catch (err: any) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: `0x${CHAIN_ID.toString(16)}`,
              chainName: "GenLayer Bradbury",
              nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
              rpcUrls: [RPC_URL],
              blockExplorerUrls: ["https://explorer-bradbury.genlayer.com"],
            }],
          });
          return true;
        } catch (addErr) {
          console.error("Failed to add network:", addErr);
          return false;
        }
      }
      console.error("Failed to switch network:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect();
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      setIsCorrectNetwork(newChainId === CHAIN_ID);
      if (newChainId === CHAIN_ID && address) {
        connect();
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [checkConnection, connect, disconnect, address]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        chainId,
        isCorrectNetwork,
        balance,
        error,
        connect,
        disconnect,
        switchNetwork,
        readClient,
        getWriteClient,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}