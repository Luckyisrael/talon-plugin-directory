---
name: moove-send
description: Send money to a Moove handle or wallet address — recipient resolution, settlement token, quote and confirmation screen, failure semantics. Load for pay-a-person flows and send screens.
version: "1.1.0"
autoAttach: false
triggers: [content:moove handle, content:@handle, content:send to]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/moove-payment-api)
---

# Moove Send (Talon moove-payment-api v1.1.0)

Pay a handle like `@theirname` or a full wallet address, on any chain.
The sender chooses **what they send** — they never pick the
recipient's chain: a handle resolves to the recipient's default
wallet, their settlement token (token and chain they chose to be paid
in) is read from their settings, and any swap or bridge runs inside
the same transaction. SOL on Solana can reach someone who settles in
USDC on Base, and neither side thinks about it.

No Moove send endpoint exists in this pack's source: sending is a
wallet flow — the wallet sheet approves, the app never sees key
material. The screen collects and presents; it never moves funds
itself.

## The pattern

```tsx
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

export function SendScreen({ onConfirm }: { onConfirm: (to: string, amount: string) => void }) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const isHandle = recipient.startsWith('@')
  const ready = recipient.trim().length > 0 && amount.trim().length > 0

  if (reviewing) {
    // The confirmation screen the docs require: chain, sending wallet,
    // recipient, gas fee, latest quote (rate with protocol fees
    // included), and settlement-time estimate — then the wallet sheet.
    return (
      <View>
        <Text>To: {recipient}</Text>
        <Text>You send: {amount}</Text>
        <Pressable onPress={() => onConfirm(recipient.trim(), amount)}>
          <Text>Confirm in wallet</Text>
        </Pressable>
      </View>
    )
  }
  return (
    <View>
      <TextInput value={recipient} onChangeText={setRecipient}
        placeholder="@handle or wallet address" autoCapitalize="none" />
      <TextInput value={amount} onChangeText={setAmount}
        placeholder="Amount you are sending" keyboardType="decimal-pad" />
      <Pressable disabled={!ready} onPress={() => setReviewing(true)}>
        <Text>Review</Text>
      </Pressable>
      {!isHandle && recipient.length > 0 && (
        <Text>Raw address: sent exactly as typed on that chain.</Text>
      )}
    </View>
  )
}
```

Rules: a raw address goes to *that address on that chain* exactly as
given — no handle resolution, no settlement preference, so surface a
confirm step and never silently rewrite it. Show the latest quote and
the settlement-time estimate (seconds to days by route) before
confirming; balance changes on screen are estimates — amounts are not
guaranteed until the transaction settles. The first send to a new
recipient shows their Handle, Username, Wallet, and Receives in as a
deliberate check before funds move. If a route cannot execute inside
its tolerance the transaction fails and nothing moves — retry against
a fresh quote, never force-fill. Cost: same-chain same-token sends are
free; anything needing a swap or bridge takes a protocol fee out of
the amount while it converts (the recipient receives slightly less)
plus network gas. State-changing mainnet calls get explicit user
confirmation in the UI before anything is sent. Full working screen:
`references/send-screen.tsx`.
