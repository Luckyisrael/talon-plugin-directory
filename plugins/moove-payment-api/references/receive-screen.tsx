import { Pressable, Share, Text, View } from 'react-native'

// Reference: any-amount receive screen — the three shareables from the
// Moove App's Receive tab: handle, profile link, QR. The payer names
// the amount (tips, donations, bio links); settlement routing is
// Moove's job. Adapt styling to the app's theme; keep the flow.
export function ReceiveScreen({ handle }: { handle: string }) {
  const profileUrl = `https://www.moove.xyz/@${handle}`
  const copyable = [`@${handle}`, profileUrl]

  // Render your QR from profileUrl with a QR library added through the
  // normal install flow; Share QR code = Share({ message: profileUrl }).
  async function share(kind: string) {
    const message = kind === 'handle' ? `@${handle}` : profileUrl
    await Share.share({ message })
  }

  return (
    <View>
      <Text>Paid any amount, in the crypto you choose</Text>
      {copyable.map((item) => (
        <Pressable key={item} onPress={() => share(item.startsWith('@') ? 'handle' : 'profile')}>
          <Text>{item}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => share('profile')}>
        <Text>Share QR code</Text>
      </Pressable>
      {/* Fixed amount instead? That is a payment link — see the
          payment-link API in references/payment-link-client.ts. */}
    </View>
  )
}
