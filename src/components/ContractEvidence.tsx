import { useContractState } from '../hooks/useContractState';
import { STALE_AFTER_MINUTES } from '../config';
export function ContractEvidence() {
  const { state, error, isLoading, refresh, isStale, now } = useContractState();
  if (error) return <section className="card space-y-3" role="alert"><h2>Could not read contract</h2><p>{error}</p>{state && <p>Previously loaded evidence is retained but must not be treated as current.</p>}<button className="btn-secondary" onClick={() => void refresh()}>Retry read</button></section>;
  if (!state) return <section className="card">{isLoading ? 'Reading live contract state…' : 'No contract data available.'}</section>;
  const age = state.lastCheckTimestamp ? Math.max(0, Math.floor(now / 1000 - state.lastCheckTimestamp)) : null;
  const fields = [['Status', state.status], ['Monitored URL', state.monitoredUrl], ['Verdict', state.lastVerdict], ['Last checked URL', state.lastCheckedUrl || 'Not checked'],
    ['Last check', state.lastCheckTimestamp ? new Date(state.lastCheckTimestamp * 1000).toISOString() : 'Never'], ['Verdict age', age === null ? 'No verdict' : `${Math.floor(age / 60)} minutes ${age % 60} seconds`],
    ['Cumulative incidents', String(state.incidentCount)], ['Guarded actions', String(state.guardedActionCount)]];
  return <section className="card space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">On-chain evidence</h2><button className="btn-secondary" disabled={isLoading} onClick={() => void refresh()}>Refresh</button></div>
    <dl className="grid md:grid-cols-[180px_1fr] gap-x-6 gap-y-3">{fields.map(([label, value]) => <div className="contents" key={label}><dt className="text-sentinel-textMuted">{label}</dt><dd className="break-all">{value}</dd></div>)}</dl>
    {isStale && <p className="text-sentinel-warning">Verdict is stale or absent (UI threshold: {STALE_AFTER_MINUTES} minutes). The contract does not enforce freshness.</p>}
    {state.lastCheckedUrl !== state.monitoredUrl && <p className="text-sentinel-warning">The last checked URL does not match the current endpoint. Recovery requires a matching operational verdict.</p>}
  </section>;
}
