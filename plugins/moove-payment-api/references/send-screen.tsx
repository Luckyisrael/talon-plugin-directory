import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

// Reference: Moove Send flow — collect recipient + amount, review with
// the fields the docs require, then hand off to the wallet. No Moove
// send endpoint exists in the source material: the wallet sheet
// approves the transfer, so this screen never moves funds itself.
// Adapt styling to the app's theme; keep the flow.
export function SendScreen({ onConfirm }: { onConfirm: (to: string, amount: string) => void }) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const trimmed = recipient.trim()
  const isHandle = trimmed.startsWith('@')
  const ready = trimmed.length > 0 && amount.trim().length > 0

  if (reviewing) {
    // Confirmation screen: chain, sending wallet, recipient, gas fee,
    // latest quote (rate with protocol fees included), settlement-time
    // estimate — populate those from your wallet/provider layer. The
    // first send to a new recipient adds Handle / Username / Wallet /
    // Receives in as a deliberate check before funds move.
    return (
      <View>
        <Text>To: {trimmed}</Text>
        {!isHandle && <Text>Raw address — goes exactly as typed, on that chain.</Text>}
        <Text>You send: {amount}</Text>
        <Pressable onPress={() => onConfirm(trimmed, amount)}>
          <Text>Confirm in wallet</Text>
        </Pressable>
        <Pressable onPress={() => setReviewing(false)}>
          <Text>Edit</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View>
      <TextInput
        value={recipient}
        onChangeText={setRecipient}
        placeholder="@handle or wallet address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount you are sending"
        keyboardType="decimal-pad"
      />
      <Pressable disabled={!ready} onPress={() => setReviewing(true)}>
        <Text>Review</Text>
      </Pressable>
    </View>
  )
}
