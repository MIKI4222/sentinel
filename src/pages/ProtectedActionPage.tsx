import { useState } from 'react';
import { useContractAction } from '../hooks/useContractAction';
import { useContractState } from '../hooks/useContractState';
export function ProtectedActionPage() {
  const action = useContractAction(); const { state } = useContractState(); const [data, setData] = useState('sentinel-demo');
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Guarded-action demo</h1><section className="card space-y-4"><p>This deployed method is a demonstration, not a transfer or production protocol integration. When ACTIVE it increments guarded_action_count and returns a string. When PAUSED it rejects with “circuit breaker is active”.</p>
    <p>Last observed status: {state?.status ?? 'unavailable'}. This client observation is not the security boundary; the contract checks the pause during execution.</p>
    <label className="block" htmlFor="action-data">Action data</label><input className="input" id="action-data" value={data} onChange={event => setData(event.target.value)} />
    <button className="btn-primary" disabled={action.isExecuting} onClick={() => void action.executeGuardedAction(data)}>Submit guarded action</button>
    <p className="text-sentinel-textMuted">You may submit while PAUSED to test an expected rejection. A wallet transaction may cost testnet gas.</p>
  </section></div>;
}
