import { useTransactions } from '../hooks/useTransactions';
import { getExplorerTransactionUrl } from '../config';
export function ActivityPage() {
  const { history, openTransaction } = useTransactions();
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Activity</h1><p>Last 50 transactions stored locally in this browser. This is not a complete on-chain history.</p>
    {history.length === 0 && <section className="card">No locally recorded transactions.</section>}
    {history.map(tx => <section className="card space-y-3" key={tx.id}><div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">{tx.operation}</h2><span>{tx.status.replaceAll('_', ' ')} · {tx.finalized ? 'finalized' : tx.statusName ?? tx.stage}</span></div><p>{tx.message}</p><div className="flex flex-wrap gap-4"><button className="btn-secondary" onClick={() => openTransaction(tx.id)}>Details / check again</button>{tx.hash && <a className="link break-all" href={getExplorerTransactionUrl(tx.hash)} target="_blank" rel="noreferrer">{tx.hash}</a>}</div></section>)}
  </div>;
}
