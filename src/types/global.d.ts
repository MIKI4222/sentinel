import type { EthereumProvider } from '../lib/genlayer/client';
declare global { interface Window { ethereum?: EthereumProvider } }
export {};
