import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Address, Instruction } from '@solana/kit'
import { getAddMemoInstruction } from '@solana-program/memo'

// Reference: sign-and-send wrapper plus a memo example. Build real
// instructions for the task at hand; confirm mainnet writes in the UI
// before calling send.
export function useSendInstructions() {
  const { sendTransactions } = useMobileWallet()
  const [pending, setPending] = useState(false)

  async function send(instructions: Instruction[]) {
    if (pending) return
    setPending(true)
    try {
      await sendTransactions(instructions)
    } catch {
      // Declined sheet: normal outcome, back to ready.
    } finally {
      setPending(false)
    }
  }

  return { send, pending }
}

export function MemoButton({ address }: { address: Address }) {
  const { send, pending } = useSendInstructions()
  return (
    <Pressable
      disabled={pending}
      onPress={() => send([getAddMemoInstruction({ memo: `gm from ${address}` })])}
    >
      <Text>{pending ? 'Waiting for approval…' : 'Send memo'}</Text>
    </Pressable>
  )
}
