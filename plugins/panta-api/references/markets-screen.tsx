import { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import type { MarketRow } from './panta-client'

// Reference: markets browse screen — catalog list with category chips
// and cursor pagination. List rows are a registry snapshot: prices are
// null here by design, so this screen shows volume and end time, and
// fetches detail (GET /markets/{id}/) only when a price must render.
// Adapt styling to the app's theme; keep the flow.
const CATEGORIES = ['sports', 'crypto', 'politics', 'entertainment', 'finance', 'science', 'world', 'other']

const PHASE_LABEL: Record<MarketRow['phase'], string> = {
  primary: 'Live',
  secondary: 'Secondary',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
}

export function MarketsScreen({
  listMarkets,
  onOpen,
}: {
  // Injected so this screen never holds a key: pass
  // (page) => markets.list(auth, { category, cursor: page })
  listMarkets: (cursor?: string) => Promise<{ items: MarketRow[]; nextCursor: string | null }>
  onOpen: (marketId: string) => void
}) {
  const [items, setItems] = useState<MarketRow[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (reset: boolean) => {
      const page = await listMarkets(reset ? undefined : cursor)
      setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
      setCursor(page.nextCursor ?? undefined)
    },
    [cursor, listMarkets],
  )

  useEffect(() => {
    load(true).catch(() => setItems([])) // UNAUTHORIZED / RATE_LIMITED — surface in your UI
  }, [category, load])

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(m) => m.marketId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true)
              await load(true).catch(() => undefined)
              setRefreshing(false)
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <CategoryChip label="All" active={category === undefined} onPress={() => setCategory(undefined)} />
            {CATEGORIES.map((c) => (
              <CategoryChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpen(item.marketId)}>
            <Text>{item.title}</Text>
            <Text>
              {item.category} · {PHASE_LABEL[item.phase]} · vol ${item.volumeUsdc}
            </Text>
            {/* Ends: format item.endTime (unix s) with the user's locale. */}
            <Text>Ends {new Date(item.endTime * 1000).toLocaleDateString()}</Text>
            {/* Prices are null on list rows — for live yes/no, fetch
                detail before rendering them (see panta-markets). */}
          </Pressable>
        )}
        ListFooterComponent={
          cursor ? (
            <Pressable onPress={() => load(false)}>
              <Text>Load more</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  )
}

function CategoryChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={{ opacity: active ? 1 : 0.5 }}>{label}</Text>
    </Pressable>
  )
}
