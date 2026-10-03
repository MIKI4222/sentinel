# Architecture

React 19 + Router 7 route-lazy UI -> typed action hook -> direct genlayer-js 1.1.8 readContract/writeContract -> unchanged Bradbury EmergencyCircuitBreaker.

- config/env.ts: pure validated browser/Node configuration.
- genlayer/client.ts: read client without a wallet; provider/account-keyed write client; runtime validation of SDK's untyped write result.
- genlayer/state.ts: seven parallel view reads, explicit ok/error result, safe integer conversion.
- genlayer/receipt.ts: pure union parser, SDK numeric maps, known UserErrors, cautious return extraction.
- genlayer/poll.ts: six-minute acceptance deadline (unknown, not failed) and abortable finalization polling without a finality deadline.
- contract/service.ts: before/after observations and evidence caveats.
- useContractAction: sole transaction creator, wallet session from returned value, no TDZ callbacks.
- WalletProvider: silent eth_accounts restore, event subscriptions, returned fresh session, BigInt balance.
- TransactionProvider: immutable reducer, localStorage outside updaters, pending recovery and finality jobs with abort cleanup.
- Common accessible TransactionModal: accepted execution/rejection/no-consensus/unknown/canceled outcomes; acceptance separate from finality.
- Keeper: env-only local signer, sequential non-overlapping cycles, no automatic workflow schedule.

The SDK chunk is explicitly grouped via Vite 8/Rolldown codeSplitting. Chunking alone does not eliminate initial SDK download: providers still import SDK for startup reads. Measure both entry size and total initially requested JS. No 500KB performance claim is made without the real Vite output.

Known limitations and trust boundaries are documented in README.md; contract state is mutable across transactions, not “immutable storage”.
