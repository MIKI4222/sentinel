import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { parseEnv } from '../src/config/env';
import { readState } from '../src/lib/genlayer/state';
export const config = parseEnv(process.env);
export const readClient = createClient({ chain: testnetBradbury, endpoint: config.rpcUrl });
export function readContractState() { return readState(functionName => readClient.readContract({ address: config.contractAddress, functionName, args: [] })); }
