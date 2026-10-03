import { useWallet } from "../context/WalletContext";
import { useContractState } from "../context/ContractStateContext";

export function useGenLayer() {
  const wallet = useWallet();
  const { state: contractState, isLoading: isLoadingState, refresh } = useContractState();

  return {
    wallet: {
      isConnected: wallet.isConnected,
      address: wallet.address,
      chainId: wallet.chainId,
      isCorrectNetwork: wallet.isCorrectNetwork,
      balance: wallet.balance,
      isConnecting: wallet.isConnecting,
      error: wallet.error,
    },
    contractState,
    isLoadingState,
    connectWallet: wallet.connect,
    disconnectWallet: wallet.disconnect,
    switchNetwork: wallet.switchNetwork,
    refreshContractState: refresh,
  };
}