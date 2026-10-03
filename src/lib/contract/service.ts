import { fetchContractState, submitContract, waitForAccepted, type EthereumProvider, type ActionType } from '../genlayer/client';
import type { Address } from '../../config/env';
import type { StateResult } from '../genlayer/state';
import type { ReceiptOutcome } from '../genlayer/receipt';
import type { Progress } from '../genlayer/poll';
export interface ActionResult { outcome: ReceiptOutcome; hash: string; before: StateResult; after?: StateResult; evidence: string; isDegraded?: boolean }
export interface ActionDependencies {
  read: typeof fetchContractState;
  submit: typeof submitContract;
  wait: typeof waitForAccepted;
}
const defaults: ActionDependencies = { read: fetchContractState, submit: submitContract, wait: waitForAccepted };
export async function performAction(action: ActionType, args: string[], provider: EthereumProvider, account: Address,
  events: { onSignature: () => void; onSubmitted: (hash: string) => void; onProgress: Progress },
  signal?: AbortSignal, deps: ActionDependencies = defaults): Promise<ActionResult> {
  const before = await deps.read();
  // Do not risk an unverifiable health check with no baseline snapshot.
  if (action === 'health_check' && !before.ok) throw new Error(`Cannot establish pre-check state: ${before.error}`);
  events.onSignature();
  const hash = await deps.submit(provider, account, action, args);
  events.onSubmitted(hash);
  const outcome = await deps.wait(hash, events.onProgress, signal);
  if (outcome.kind !== 'accepted-return') return { outcome, hash, before, evidence: 'No successful execution has been confirmed.' };
  const after = await deps.read();
  let evidence = outcome.returnValue ?? 'Operation accepted by the contract.';
  let isDegraded: boolean | undefined;
  if (!after.ok) evidence = `Accepted, but post-transaction state could not be read: ${after.error}`;
  else if (action === 'health_check') {
    if (before.ok && after.state.lastCheckTimestamp === before.state.lastCheckTimestamp) evidence = 'State timestamp did not change. A new health check cannot be confirmed from this snapshot.';
    else evidence = `Observed verdict: ${after.state.lastVerdict}; status: ${after.state.status}; incidents: ${after.state.incidentCount}. Concurrent checks may affect attribution.`;
    isDegraded = after.state.lastVerdict === 'degraded';
  } else if (action === 'set_monitored_url') {
    const verified = after.state.monitoredUrl === args[0] && after.state.lastVerdict === 'not_checked' && after.state.lastCheckedUrl === '';
    evidence = verified ? 'Requested endpoint observed; verdict reset to not_checked. Pause is not cleared.' : 'Accepted, but the expected URL/reset state was not observed. Refresh and inspect concurrent writes.';
  } else if (action === 'emergency_unpause') evidence = after.state.status === 'ACTIVE' ? 'ACTIVE observed after recovery.' : 'Accepted, but PAUSED is still observed; refresh and inspect concurrent checks.';
  return { outcome, hash, before, after, evidence, isDegraded };
}
