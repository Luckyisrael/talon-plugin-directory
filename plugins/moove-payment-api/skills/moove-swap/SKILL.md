---
name: moove-swap
description: Swap tokens or bridge them across chains through Moove — one flow, route picked automatically, quote review before confirm. Load for exchange, trade, or cross-chain move flows.
version: "1.1.0"
autoAttach: false
triggers: [content:moove swap, content:swap tokens, content:bridge tokens]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/moove-payment-api)
---

# Moove Swap & Bridge (Talon moove-payment-api v1.1.0)

One flow, two names: pick two tokens on the **same** chain and it is a
swap; pick tokens on **different** chains and it is a bridge (with a
swap on either side if needed). The user never chooses between them —
on mobile there is no separate bridge screen at all. The route is
picked for you: Moove prices the trade across available liquidity and
executes the best route it finds — no route picker, no venue to
choose, no approvals to chain together, one confirmation. 16,000+
assets.

## The pattern

```tsx
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

// Token shape: what the picker hands back. symbol/chain are display
// state; contract is what must be confirmed for unfamiliar tokens.
type Token = { symbol: string; chain: string; contract: string }

export function SwapScreen({
  from, to, onConfirm,
}: { from: Token; to: Token; onConfirm: () => void }) {
  const [quote, setQuote] = useState<null | { youReceive: string; settles: string }>(null)
  const sameChain = from.chain === to.chain

  return (
    <View>
      <Text>{from.symbol} on {from.chain} → {to.symbol} on {to.chain}</Text>
      <Text>{sameChain ? 'Swap' : 'Bridge (with swap if needed)'}</Text>
      {/* Quote is priced against live liquidity: show exactly what the
          user receives BEFORE they approve, never after. */}
      {quote && <Text>You receive: {quote.youReceive}</Text>}
      <Pressable disabled={!quote} onPress={onConfirm}>
        <Text>Confirm</Text>
      </Pressable>
    </View>
  )
}
```

Rules: never approve without showing exactly what the user receives —
the quote is the screen's job, the confirmation is the user's. Quotes
are priced against live liquidity and live network conditions: if the
route cannot execute inside its tolerance, the swap fails rather than
filling at a worse price — nothing moves, retry against a fresh
quote; never present a stale quote as final. Token picker: search by
name, symbol, or contract address, with Recommended / Stablecoin /
Gas filters and a chain menu — anyone can create a token with any
name, so start from Recommended and confirm the contract address
before swapping into something unfamiliar. Same-chain same-token
moves are free; a swap carries a protocol fee, plus network gas and
the market cost of the route — exact figures at
https://docs.moove.xyz/product-prices/how-product-and-prices-work,
link them rather than quoting numbers. Full working screen:
`references/swap-screen.tsx`.
