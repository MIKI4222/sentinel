import { Modal } from './Modal';
import { useTransactions } from '../../hooks/useTransactions';
import { getExplorerTransactionUrl } from '../../config';
export function TransactionModal() {
  const { currentTransaction: tx, clearCurrent, recheck } = useTransactions();
  const labels = { pending: 'Transaction in progress', accepted: 'Accepted by consensus', rejected_by_contract: 'Rejected by contract', no_consensus: 'No consensus', unknown: 'Status unknown', canceled: 'Signature canceled' };
  return <Modal isOpen={!!tx} onClose={clearCurrent} title={tx ? labels[tx.status] : 'Transaction'}>
    {tx && <div className="space-y-4" aria-live="polite">
      <p className="font-mono">{tx.operation}</p>
      <p>Stage: {tx.stage} · Network status: {tx.statusName ?? 'not received'}</p>
      <p className={tx.status === 'accepted' ? 'text-sentinel-accent' : tx.status === 'rejected_by_contract' ? 'text-sentinel-warning' : ''}>{tx.message}</p>
      {['accepted', 'rejected_by_contract'].includes(tx.status) && <p>Finalization: {tx.finalized ? 'finalized' : 'awaiting finalization — acceptance is not finality'}</p>}
      {tx.hash && <><code className="block break-all">{tx.hash}</code><a className="link" href={getExplorerTransactionUrl(tx.hash)} target="_blank" rel="noreferrer">Open in explorer</a></>}
      {tx.status === 'unknown' && tx.hash && <button className="btn-secondary" onClick={() => void recheck(tx.id, tx.hash)}>Check again</button>}
      {tx.result?.after?.ok && <dl className="grid grid-cols-2 gap-3"><dt>Observed status</dt><dd>{tx.result.after.state.status}</dd><dt>Observed verdict</dt><dd>{tx.result.after.state.lastVerdict}</dd><dt>Incidents</dt><dd>{tx.result.after.state.incidentCount}</dd><dt>Guarded actions</dt><dd>{tx.result.after.state.guardedActionCount}</dd></dl>}
    </div>}
  </Modal>;
}
