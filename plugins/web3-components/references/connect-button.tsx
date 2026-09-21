import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

// Reference: wallet connect button. Adapt the styling to the app's theme;
// keep the flow: one connect per tap, pending state, silent cancel.
export function ConnectButton({ label = 'Connect wallet' }: { label?: string }) {
  const { account, connect } = useMobileWallet()
  const [pending, setPending] = useState(false)

  async function submit() {
    if (pending || account) return
    setPending(true)
    try {
      await connect()
    } finally {
      setPending(false)
    }
  }

  return (
    <Pressable onPress={submit} disabled={pending || !!account}>
      <Text>{pending ? 'Connecting…' : account ? 'Connected' : label}</Text>
    </Pressable>
  )
}
