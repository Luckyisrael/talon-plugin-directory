---
name: web3-send
description: Build, sign, and send Solana transactions through the connected wallet. Load when the task touches signing, sending, memos, or on-chain writes.
version: "@wallet-ui/react-native-kit@4.x, @solana/kit@6.x, @solana-program/memo@0.11.x"
autoAttach: false
triggers: [import:sendTransactions, content:sendTransactions, content:Instruction]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/web3-components)
---

# Sign and send (Talon web3-components v1.0.0)

Transactions are built from `@solana/kit` instructions and sent through
`sendTransactions` from `useMobileWallet()`. The wallet sheet approves;
the app never sees key material.

**Pinned:** `@wallet-ui/react-native-kit` (4.x), `@solana/kit` (6.x).

## The pattern

```tsx
import { useState } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Address, Instruction } from '@solana/kit'

export function useSendInstructions() {
  const { sendTransactions } = useMobileWallet()
  const [pending, setPending] = useState(false)

  async function send(instructions: Instruction[]) {
    setPending(true)
    try {
      await sendTransactions(instructions)
    } catch {
      // The user declining the sheet is normal, not an error state.
    } finally {
      setPending(false)
    }
  }

  return { send, pending }
}
```

Rules: real instructions only, never placeholder transfers on mainnet
without the user typing the amount first; a declined sheet returns to
ready silently; every send has visible pending state. State-changing
mainnet calls get explicit user confirmation in the UI before
`sendTransactions` runs. Full working version:
`references/send-transaction.tsx`.
