# web3-components plugin v1.0.0

Wallet connect button, SOL balance view, and transaction signing for
Solana Mobile builds. Part of the [Talon plugin directory](../..).

| Skill | Does | Triggers on |
| --- | --- | --- |
| `web3-connect` | Wallet connect button via Mobile Wallet Adapter | wallet connection, connected account |
| `web3-balance` | Address plus SOL balance with TanStack Query | balances, portfolio headers |
| `web3-send` | Build, sign, and send transactions | signing, on-chain writes |

Working starting points live in `references/`. Pinned SDK lines are in each
skill: `@wallet-ui/react-native-kit` 4.x, `@solana/kit` 6.x.
