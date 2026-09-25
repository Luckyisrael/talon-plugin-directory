import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

// Reference: swap/bridge screen — one flow where the destination chain
// decides the name: same chain = swap, different chain = bridge (with
// a swap on either side if needed). The route is picked automatically;
// the screen's job is showing exactly what the user receives BEFORE
// they approve. Adapt styling to the app's theme; keep the flow.
type Token = { symbol: string; chain: string; contract: string }

export function SwapScreen({
  from,
  to,
  quoteFor,
  onConfirm,
}: {
  from: Token
  to: Token
  /** Ask your liquidity/route layer for a live quote; prices move. */
  quoteFor: (from: Token, to: Token) => Promise<string>
  onConfirm: () => void
}) {
  const [youReceive, setYouReceive] = useState<string | null>(null)
  const sameChain = from.chain === to.chain

  async function refreshQuote() {
    // Priced against live liquidity and network conditions: re-quote
    // on every entry. If the route cannot execute inside its
    // tolerance the swap fails and nothing moves — retry fresh,
    // never force-fill at a worse price.
    setYouReceive(await quoteFor(from, to))
  }

  return (
    <View>
      <Text>
        {from.symbol} ({from.chain}) → {to.symbol} ({to.chain})
      </Text>
      <Text>{sameChain ? 'Swap' : 'Bridge'}</Text>
      <Pressable onPress={refreshQuote}>
        <Text>{youReceive ? `You receive: ${youReceive}` : 'Get quote'}</Text>
      </Pressable>
      <Pressable disabled={!youReceive} onPress={onConfirm}>
        <Text>Confirm</Text>
      </Pressable>
      {/* Picker rules: search by name/symbol/contract, filters
          Recommended / Stablecoin / Gas. Anyone can name a token —
          start from Recommended and confirm the contract address
          before trading something unfamiliar. */}
    </View>
  )
}
