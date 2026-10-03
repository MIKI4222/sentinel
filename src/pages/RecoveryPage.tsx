import { useContractAction } from '../hooks/useContractAction';
import { useContractState } from '../hooks/useContractState';
import { useWallet } from '../hooks/useWallet';
import { OWNER_ADDRESS_HINT } from '../config';
export function RecoveryPage() {
  const action = useContractAction(); const { state, isStale, error } = useContractState(); const wallet = useWallet();
  const checks = [['Paused now', state?.status === 'PAUSED'], ['Operational verdict', state?.lastVerdict === 'operational'], ['Verdict matches current endpoint', !!state?.lastCheckedUrl && state.lastCheckedUrl === state.monitoredUrl], ['Freshness hint only (not enforced on chain)', !!state && !isStale]] as const;
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Owner recovery</h1><section className="card space-y-4"><p>Recovery requires owner authorization and a stored operational verdict for the current URL. A healthy check does not automatically unpause. The contract does not check verdict age.</p>
    {error && <p role="alert">Live evidence unavailable: {error}</p>}
    <ul className="space-y-3">{checks.map(([label, done]) => <li key={label}>{done ? '✓' : '○'} {label}</li>)}<li>Owner authorization: checked by the contract when submitted; no get_owner view exists.</li></ul>
    {OWNER_ADDRESS_HINT && <p className="text-sentinel-warning">Configured-owner hint: {wallet.address?.toLowerCase() === OWNER_ADDRESS_HINT.toLowerCase() ? 'wallet matches' : 'wallet does not match or is not connected'}. This is not an on-chain verification.</p>}
    <p className="text-sentinel-warning">Owner identity cannot be verified here. The contract is authoritative. Review the endpoint and verdict before submitting.</p>
    <div className="flex flex-wrap gap-4"><button className="btn-secondary" disabled={action.isExecuting} onClick={() => void action.healthCheck()}>Run operational check first</button><button className="btn-primary" disabled={action.isExecuting} onClick={() => void action.emergencyUnpause()}>Submit owner unpause</button></div>
  </section></div>;
}
