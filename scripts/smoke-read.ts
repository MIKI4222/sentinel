import { readContractState } from './runtime';
const result = await readContractState();
if (!result.ok) { console.error('READ FAILED:', result.error); process.exitCode = 1; }
else console.log(JSON.stringify(result.state, null, 2));
