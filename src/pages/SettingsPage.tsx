import { useTransactions } from '../hooks/useTransactions';
import { CONTRACT_ADDRESS, RPC_URL, CHAIN_ID, PUBLIC_BASE_URL, STALE_AFTER_MINUTES, getExplorerAddressUrl } from '../config';
export function SettingsPage() {
  const { clearHistory } = useTransactions();
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Configuration</h1><section className="card space-y-4"><p>Configuration is validated at startup and set by build-time environment variables. Changes require rebuilding the deployment.</p><p>Chain: {CHAIN_ID}</p><p className="break-all">RPC: {RPC_URL}</p><a className="link break-all" href={getExplorerAddressUrl()}>{CONTRACT_ADDRESS}</a><p>UI stale threshold: {STALE_AFTER_MINUTES} minutes</p><p className="break-all">Public mock origin: {PUBLIC_BASE_URL || 'not configured'}</p></section><section className="card space-y-4"><p>Clearing local history does not cancel on-chain transactions. Keep any hashes you need first.</p><button className="btn-secondary" onClick={() => { if (window.confirm('Clear local transaction history? On-chain transactions are unaffected.')) clearHistory(); }}>Clear local history</button></section></div>;
}
