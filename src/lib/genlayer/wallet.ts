import { address } from '../../config/env';
import { CHAIN_ID, CHAIN, EXPLORER_URL, RPC_URL } from '../../config';
import type { EthereumProvider } from './client';
import type { WalletSession } from '../../context/wallet';
export function formatWei(value: bigint): string {
  const unit = 10n ** 18n;
  return `${value / unit}.${(value % unit).toString().padStart(18, '0')}`;
}
export function getProvider(): EthereumProvider { if (!window.ethereum) throw new Error('No EIP-1193 wallet found. Install MetaMask or a compatible wallet.'); return window.ethereum; }
export async function readSession(provider: EthereumProvider, requestAccounts = false): Promise<WalletSession | null> {
  const accounts: unknown = await provider.request({ method: requestAccounts ? 'eth_requestAccounts' : 'eth_accounts' });
  if (!Array.isArray(accounts) || !accounts.length) return null;
  const chainHex: unknown = await provider.request({ method: 'eth_chainId' });
  if (typeof chainHex !== 'string' || !/^0x[\da-f]+$/i.test(chainHex)) throw new Error('Wallet returned an invalid chain ID');
  return { address: address(accounts[0]), chainId: Number(BigInt(chainHex)) };
}
export async function switchToBradbury(provider: EthereumProvider): Promise<void> {
  const chainId = `0x${CHAIN_ID.toString(16)}`;
  try { await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] }); }
  catch (error) {
    if (!error || typeof error !== 'object' || !('code' in error) || Number(error.code) !== 4902) throw error;
    await provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId, chainName: CHAIN.name, nativeCurrency: CHAIN.nativeCurrency, rpcUrls: [RPC_URL], blockExplorerUrls: [EXPLORER_URL] }] });
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
  }
}
export async function ensureWalletSession(provider: EthereumProvider): Promise<WalletSession> {
  let session = await readSession(provider);
  if (!session) session = await readSession(provider, true);
  if (!session) throw new Error('No wallet account selected');
  if (session.chainId !== CHAIN_ID) { await switchToBradbury(provider); session = await readSession(provider); }
  if (!session || session.chainId !== CHAIN_ID) throw new Error('Wrong network. Switch to GenLayer Bradbury.');
  return session;
}
