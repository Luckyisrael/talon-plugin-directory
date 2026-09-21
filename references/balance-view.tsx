import { Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Address } from '@solana/kit'

// Reference: address plus SOL balance. Adapt layout to the screen; keep the
// query shape (cached per chain + address) and the formatting rules.
export function useSolBalance(address: Address) {
  const { chain, client } = useMobileWallet()
  return useQuery({
    queryKey: ['sol-balance', chain, address],
    queryFn: () => client.rpc.getBalance(address).send(),
  })
}

export function BalanceView({ address }: { address: Address }) {
  const { data, isLoading } = useSolBalance(address)
  const sol = Number(data?.value ?? 0n) / 1_000_000_000
  const addr = address.toString()
  const short = addr.length > 10 ? `${addr.slice(0, 2)}…${addr.slice(-4)}` : addr
  return (
    <View>
      <Text>{short}</Text>
      <Text>{isLoading ? 'Loading…' : `${sol.toLocaleString()} SOL`}</Text>
    </View>
  )
}
