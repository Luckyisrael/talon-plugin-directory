---
name: wallet-connect
description: Connect a Solana wallet with Mobile Wallet Adapter via the wallet-ui kit. Load when the task touches wallet connection or the connected account.
version: "@wallet-ui/react-native-kit@4.x, @solana/kit@6.x"
autoAttach: true
triggers: [import:useMobileWallet, import:mobile-wallet-adapter, pkg:@wallet-ui, content:connect()]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/talon-mobile-ui)
---

# Wallet connect button (Talon talon-mobile-ui v1.0.0)

Everything goes through the `useMobileWallet()` hook from
`@wallet-ui/react-native-kit`. There is no browser wallet, no
`@solana/wallet-adapter-react`, no injected provider, no `@solana/web3.js`.

**Pinned:** `@wallet-ui/react-native-kit` (4.x), `@solana/kit` (6.x) —
both already installed in Talon workspaces. If the installed minor differs,
read the installed `.d.ts` before relying on a signature:
`node_modules/@wallet-ui/react-native-kit/dist/types/index.d.ts`.

## The pattern

```tsx
import { useState } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

export function ConnectButton({ label = 'Connect wallet' }: { label?: string }) {
  const { account, connect } = useMobileWallet()
  const [pending, setPending] = useState(false)

  async function submit() {
    setPending(true)
    try {
      await connect()
    } finally {
      // A cancelled wallet sheet is a normal outcome, not an error state.
      setPending(false)
    }
  }

  return (
    <Pressable onPress={submit} disabled={pending || !!account}>
      <Text>{account ? 'Connected' : label}</Text>
    </Pressable>
  )
}
```

Rules: one connect call per tap, pending state on the button, cancelled
sheets return to ready silently. Never gate the rest of the screen on
connection — render disconnected states with the same care. Full working
version with the app's own button and theme: `references/connect-button.tsx`.
