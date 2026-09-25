// Panta API client — starting point; adapt to your session layer.
// Keep PANTA_API_KEY server-side: this module runs in your backend,
// never in the app bundle. User JWTs pass through as `bearer`.
// Endpoints covered are exactly the ones this pack was authored from;
// anything else: fetch https://docs.panta.market/llms.txt first.

const BASE = 'https://live-api.panta.market/api/v1'

export type PantaAuth = { apiKey?: string; bearer?: string }

export class PantaError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(`panta: ${code} (${status})`)
    this.name = 'PantaError'
  }
}

type Opts = {
  method?: 'GET' | 'POST' | 'PATCH'
  auth?: PantaAuth
  body?: unknown
  query?: Record<string, string | number | undefined>
}

async function call<T>(path: string, opts: Opts = {}): Promise<T> {
  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v))
  }
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.auth?.apiKey) headers['X-Api-Key'] = opts.auth.apiKey
  if (opts.auth?.bearer) headers['Authorization'] = `Bearer ${opts.auth.bearer}`

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  })
  if (!res.ok) {
    // Error envelope: { "code": "UNAUTHORIZED" | "RATE_LIMITED" | … }
    let code = res.statusText || 'HTTP_ERROR'
    try {
      const parsed = (await res.json()) as { code?: string }
      if (parsed?.code) code = parsed.code
    } catch {
      /* non-JSON body — keep the status text */
    }
    throw new PantaError(code, res.status)
  }
  return (await res.json()) as T
}

// ── Auth (public — no key required) ────────────────────────────────
export type AuthEnvelope = {
  userId: string
  email: string
  name: string
  access: string
  refresh: string
}

export const auth = {
  register: (email: string, password: string, name?: string) =>
    call<AuthEnvelope>('/auth/register/', {
      method: 'POST',
      body: { email, password, ...(name ? { name } : {}) },
    }),
  login: (email: string, password: string) =>
    call<AuthEnvelope>('/auth/token/', { method: 'POST', body: { email, password } }),
  // Rotated: the old refresh token dies the moment this returns.
  refresh: (refresh: string) =>
    call<{ access: string; refresh: string }>('/auth/token/refresh/', {
      method: 'POST',
      body: { refresh },
    }),
}

// ── Account, keys, metrics ─────────────────────────────────────────
export type Account = {
  userId: string
  email: string
  name: string
  status: 'active' | 'suspended'
  canCreateMarkets: boolean
  createdAt: string
  apiKeyId?: string
}

export type ApiKey = {
  id: string
  name: string | null
  prefix: string
  env: 'test' | 'live'
  status: 'active' | 'revoked'
  createdAt: string
  revokedAt: string | null
}

export const account = {
  get: (a: PantaAuth) => call<Account>('/account/', { auth: a }),
  rename: (a: PantaAuth, name: string) =>
    call<Account>('/account/', { method: 'PATCH', auth: a, body: { name } }),
  listKeys: (a: PantaAuth) => call<{ keys: ApiKey[] }>('/account/keys/', { auth: a }),
  // The plaintext secret exists only in this response — persist it now.
  createKey: (a: PantaAuth, body: { env: 'test' | 'live'; name?: string; revokeOthers?: boolean }) =>
    call<ApiKey & { secret: string }>('/account/keys/', { method: 'POST', auth: a, body }),
  revokeKey: (a: PantaAuth, id: string) =>
    call<ApiKey>(`/account/keys/${id}/revoke/`, { method: 'POST', auth: a }),
  metrics: (a: PantaAuth, limit = 50) =>
    call<Record<string, unknown>>('/account/metrics/', { auth: a, query: { limit } }),
}

// ── Markets ────────────────────────────────────────────────────────
export type MarketRow = {
  marketId: string
  category: string
  title: string
  description: string
  images: string[]
  phase: 'primary' | 'secondary' | 'resolved' | 'cancelled'
  marketType: 'standard' | 'breaking'
  startTime: number
  endTime: number
  resolutionTime: number
  region: string
  resolved: boolean
  status: string
  volumeUsdc: string
  createdByPartner: boolean
  // Null on list rows; filled on GET /markets/{id}/ when RPC is up.
  yesPrice: string | null
  noPrice: string | null
}

export const markets = {
  categories: (a: PantaAuth) => call<{ categories: string[] }>('/categories/', { auth: a }),
  list: (
    a: PantaAuth,
    q: {
      category?: string
      status?: MarketRow['phase']
      createdBy?: 'me'
      cursor?: string
      limit?: number
    } = {},
  ) => call<{ items: MarketRow[]; nextCursor: string | null }>('/markets/', { auth: a, query: q }),
  get: (a: PantaAuth, marketId: string) => call<MarketRow>(`/markets/${marketId}/`, { auth: a }),
  trades: (a: PantaAuth, marketId: string, limit = 50) =>
    call<{ marketId: string; items: TradeRow[] }>(`/markets/${marketId}/trades/`, {
      auth: a,
      query: { limit },
    }),
  walletTrades: (a: PantaAuth, wallet: string, limit = 50) =>
    call<{ wallet: string; items: TradeRow[] }>(`/wallets/${wallet}/trades/`, {
      auth: a,
      query: { limit },
    }),
}

export type TradeRow = {
  id: string | number
  marketId: string
  wallet: string
  isPrimary: boolean
  yesAmount: string | number
  noAmount: string | number
  feePaid: string | number
  blockTime: number | null
  signature: string
  quoteAsset: string
}

// Cursor pagination: follow nextCursor until it is null.
export async function listAllMarkets(a: PantaAuth, q: Parameters<typeof markets.list>[1] = {}) {
  const all: MarketRow[] = []
  let cursor: string | undefined
  do {
    const page = await markets.list(a, { ...q, cursor })
    all.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return all
}
