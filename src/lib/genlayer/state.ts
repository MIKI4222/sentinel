export interface ContractState {
  status: 'ACTIVE' | 'PAUSED';
  monitoredUrl: string;
  lastVerdict: 'not_checked' | 'operational' | 'degraded';
  lastCheckedUrl: string;
  incidentCount: number;
  lastCheckTimestamp: number;
  guardedActionCount: number;
}
export type StateResult = { ok: true; state: ContractState } | { ok: false; error: string };
export function normalizeString(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new Error(`${name}: expected string`);
  return value;
}
export function normalizeUint(value: unknown, bits: 32 | 64, name: string): number {
  if (typeof value !== 'bigint' && typeof value !== 'number') throw new Error(`${name}: expected number or bigint`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0 || BigInt(n) > (1n << BigInt(bits)) - 1n) throw new Error(`${name}: invalid or unsafe u${bits}`);
  return n;
}
export const VIEW_METHODS = ['get_status', 'get_monitored_url', 'get_last_verdict', 'get_last_checked_url', 'get_incident_count', 'get_last_check_timestamp', 'get_guarded_action_count'] as const;
export async function readState(read: (functionName: string) => Promise<unknown>): Promise<StateResult> {
  try {
    const [status, url, verdict, checkedUrl, incidents, timestamp, actions] = await Promise.all(VIEW_METHODS.map(read));
    if (status !== 'ACTIVE' && status !== 'PAUSED') throw new Error('get_status: unexpected value');
    if (verdict !== 'not_checked' && verdict !== 'operational' && verdict !== 'degraded') throw new Error('get_last_verdict: unexpected value');
    return { ok: true, state: { status, monitoredUrl: normalizeString(url, 'get_monitored_url'), lastVerdict: verdict,
      lastCheckedUrl: normalizeString(checkedUrl, 'get_last_checked_url'), incidentCount: normalizeUint(incidents, 32, 'get_incident_count'),
      lastCheckTimestamp: normalizeUint(timestamp, 64, 'get_last_check_timestamp'), guardedActionCount: normalizeUint(actions, 32, 'get_guarded_action_count') } };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Could not read contract' }; }
}
