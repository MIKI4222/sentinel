import { createAccount, createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { config, readClient, readContractState } from './runtime';
import { pollUntilAccepted, delay } from '../src/lib/genlayer/poll';
import { transactionHash } from '../src/lib/genlayer/receipt';
const key = process.env.KEEPER_PRIVATE_KEY;
const interval = Number(process.env.KEEPER_INTERVAL_MS ?? 300_000);
if (!key || !/^0x[\da-fA-F]{64}$/.test(key)) throw new Error('KEEPER_PRIVATE_KEY must be a 0x-prefixed 32-byte hex key');
if (!Number.isSafeInteger(interval) || interval < 60_000) throw new Error('KEEPER_INTERVAL_MS must be at least 60000');
// createAccount derives a local signing account. Never pass a private key as an address.
const account = createAccount(key as `0x${string}`);
const writeClient = createClient({ chain: testnetBradbury, endpoint: config.rpcUrl, account });
const controller = new AbortController();
process.once('SIGINT', () => controller.abort()); process.once('SIGTERM', () => controller.abort());
let outstanding: string | undefined;
async function cycle() {
  if (!outstanding) {
    const hash: unknown = await writeClient.writeContract({ address: config.contractAddress, functionName: 'health_check', args: [], value: 0n });
    outstanding = transactionHash(hash);
    console.log('Submitted health_check:', outstanding);
  }
  const result = await pollUntilAccepted(readClient, outstanding, () => {}, controller.signal);
  console.log('Outcome:', result.kind, 'status:', result.statusName);
  // Unknown is not a failure: keep checking the same tx, never submit an overlapping check.
  if (result.kind === 'unknown' || result.kind === 'pending') return;
  outstanding = undefined;
  if (result.kind === 'accepted-error') console.log('Contract rejected health check:', result.userError ?? 'unrecognized UserError');
  if (result.kind === 'no-consensus') console.log('No consensus; retry on next cycle. This check did not enable the pause.');
  const state = await readContractState();
  if (!state.ok) { console.log('Could not read post-check state'); return; }
  const age = state.state.lastCheckTimestamp ? Math.max(0, Math.floor(Date.now() / 1000 - state.state.lastCheckTimestamp)) : null;
  console.log(JSON.stringify({ verdict: state.state.lastVerdict, status: state.state.status, ageSeconds: age, incidentCount: state.state.incidentCount }));
}
do {
  try { await cycle(); }
  catch { if (!controller.signal.aborted) console.error('Keeper cycle failed. Check network/account funding locally; sensitive SDK error objects are intentionally not logged.'); }
  if (process.argv.includes('--once') || controller.signal.aborted) break;
  try { await delay(interval, controller.signal); } catch { break; }
} while (!controller.signal.aborted);
