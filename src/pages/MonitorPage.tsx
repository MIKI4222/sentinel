import { useState } from 'react';
import { ContractEvidence } from '../components/ContractEvidence';
import { useContractAction } from '../hooks/useContractAction';
import { useTransactions } from '../hooks/useTransactions';
import { useClock } from '../hooks/useClock';
import { DEFAULT_MONITORED_URL, MOCK_ENDPOINTS } from '../config';
export function MonitorPage() {
  const action = useContractAction(); const now = useClock();
  const [url, setUrl] = useState(DEFAULT_MONITORED_URL); const [validation, setValidation] = useState('');
  const { history } = useTransactions();
  const submittedAt = history.find(tx => tx.operation === 'health_check' && tx.submittedAt)?.submittedAt ?? 0;
  const remaining = Math.max(0, Math.ceil((submittedAt + 30_000 - now) / 1000));
  const check = () => action.healthCheck();
  const change = () => {
    try { const parsed = new URL(url); if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('HTTPS URL without credentials required.'); }
    catch { setValidation('Enter a valid HTTPS URL without credentials.'); return; }
    setValidation(''); void action.setMonitoredUrl(url);
  };
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Monitor</h1><ContractEvidence />
    <section className="card space-y-4"><h2 className="text-xl font-semibold">Check the current source</h2><button className="btn-primary" disabled={action.isExecuting || remaining > 0} onClick={() => void check()}>{remaining ? `Wait ${remaining}s` : 'Run health check'}</button><p>30-second cooldown is a UX safeguard, not a contract rate limit. Anyone can call health_check.</p></section>
    <section className="card space-y-4"><h2 className="text-xl font-semibold">Owner: change endpoint</h2><label className="block" htmlFor="endpoint">HTTPS status endpoint</label><input id="endpoint" className="input" value={url} onChange={event => setUrl(event.target.value)} />
      <p className="text-sentinel-warning">Changing the URL resets the verdict, but does not clear an existing pause. An owner can select a controlled endpoint; this is a trust limitation.</p>
      {validation && <p role="alert">{validation}</p>}<button className="btn-secondary" disabled={action.isExecuting} onClick={change}>Submit URL change</button>
      {MOCK_ENDPOINTS ? <div className="space-y-3">{Object.entries(MOCK_ENDPOINTS).map(([name, endpoint]) => <div key={name} className="flex flex-wrap gap-3"><button className="btn-secondary" onClick={() => setUrl(endpoint)}>Select {name} → {name === 'healthy' ? 'operational (none)' : name === 'degraded' ? 'degraded (major)' : 'degraded (unknown format)'}</button><a className="link break-all" href={endpoint} target="_blank" rel="noreferrer">View fixture</a></div>)}</div> : <p>Mock selection is hidden: set VITE_PUBLIC_BASE_URL to a public HTTPS origin accessible to validators. localhost cannot be fetched by validators.</p>}
    </section>
  </div>;
}
