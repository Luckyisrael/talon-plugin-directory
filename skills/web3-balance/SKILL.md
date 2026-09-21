---
name: web3-balance
description: Display an address and its SOL balance with TanStack Query. Load when the task touches balances, portfolio headers, or address display.
version: "@wallet-ui/react-native-kit@4.x, @solana/kit@6.x"
autoAttach: false
triggers: [import:getBalance, content:getBalance, content:lamports]
license: MIT (see ../../LICENSE)
source: https://github.com/Luckyisrael/talon-web3-components
---

# SOL balance view (Talon web3-components v1.0.0)

Balance reads go through the wallet kit's RPC client inside a TanStack
Query — cached, retried, refetchable. Never fetch in an effect.

**Pinned:** `@wallet-ui/react-native-kit` (4.x), `@solana/kit` (6.x).

## The pattern

```tsx
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Address } from '@solana/kit'

export function useSolBalance(address: Address) {
  const { chain, client } = useMobileWallet()
  return useQuery({
    queryKey: ['sol-balance', chain, address],
    queryFn: () => client.rpc.getBalance(address).send(),
  })
}
```

Display rules: format lamports to SOL with grouping (`38,412 SOL`, never
raw lamports), middle-ellipsis addresses (`8x…3fQ2`), tabular numerals so
money never reflows width, and a loading state that keeps the row's shape.
Full working version: `references/balance-view.tsx`.
