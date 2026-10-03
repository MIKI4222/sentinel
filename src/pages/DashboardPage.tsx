import { Link } from 'react-router-dom';
import { ContractEvidence } from '../components/ContractEvidence';
import { useContractAction } from '../hooks/useContractAction';
export function DashboardPage() {
  const action = useContractAction();
  return <div className="space-y-6"><header><p className="text-sentinel-accent">BRADBURY · LIVE CONTRACT</p><h1 className="text-3xl font-bold mt-2">Sentinel dashboard</h1><p className="text-sentinel-textMuted mt-3">Independent validator checks, observable evidence, and a guarded-operation demo.</p></header>
    <ContractEvidence />
    <section className="card flex flex-wrap gap-4"><button className="btn-primary" disabled={action.isExecuting} onClick={() => void action.healthCheck()}>Run health check</button><Link className="btn-secondary" to="/monitor">Configure monitoring</Link><Link className="btn-secondary" to="/protected-action">Try guarded action</Link><Link className="btn-secondary" to="/recovery">Recovery</Link></section>
    <p className="text-sentinel-textMuted">Unknown source data can produce degraded through fail-closed classification. No consensus does not enable the pause. Regular health checks are required for useful protection.</p>
  </div>;
}
