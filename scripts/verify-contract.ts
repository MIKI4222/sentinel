import { config, readClient } from './runtime';
// Do not remove indentation: whitespace within Python code and literals can be meaningful.
// Normalize CRLF, trailing spaces/tabs, blank lines at EOF, and BOM only.
export function normalizeCode(source: string): string {
  return source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n').map(line => line.replace(/[ \t]+$/, '')).join('\n').trimEnd();
}
const repoUrl = 'https://raw.githubusercontent.com/MIKI4222/genlayer-emergency-circuit-breaker/main/contract.py';
const [deployed, response] = await Promise.all([readClient.getContractCode(config.contractAddress), fetch(repoUrl, { signal: AbortSignal.timeout(30_000) })]);
if (!response.ok) throw new Error(`Source fetch failed: HTTP ${response.status}`);
const reference = await response.text();
const match = normalizeCode(deployed) === normalizeCode(reference);
console.log(match ? 'MATCH' : 'MISMATCH');
if (!match) process.exitCode = 1;
