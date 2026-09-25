// Panta create-market flow — quote → build → sign → register.
// The signing step is injected: the wallet stays yours (on Solana
// Mobile, MWA signs outside this code; key material never appears
// here). Costs real USDC — your UI must have confirmed the action
// with the user before signAndBroadcast runs.
import { PantaError, call } from './panta-client'

const BASE = 'https://live-api.panta.market/api/v1'

export type CreateMarketInput = {
  wallet: string // fee payer + signer (base58) — must sign every step
  question: string // max 512
  resolutionRule: string // max 2048
  sourcesOfTruth: string[] // 1–20 URLs
  category: string // from GET /categories/
  startTime: number // unix s: ≥ now + 3600 (standard markets)
  endTime: number // unix s
  resolutionTime: number // unix s: ≥ endTime
  imageUrl: string // public http/https, ≤2048
  marketType?: 'standard' | 'breaking'
  eventInProgress?: boolean // breaking markets only
  title?: string // defaults to question
  description?: string
  region?: string // defaults to Global
}

export type FlowStep = 'quoted' | 'built' | 'signed' | 'registered'

export type CreateResult = {
  marketId: string // event PDA — the id every later API uses
  signature: string
  feeUsdc: number // creation fee, human USDC
  liquidityUsdc: number
  platformUsdc: number
}

type Quote = {
  createId: string
  expectedEventPda: string
  paymentUsdc: string // base units (6 decimals)
  liquidityInjectionUsdc: string
  platformRevenueUsdc: string
  expiresAt: string
  blockhashExpiryHintSec: number
}

type Build = {
  createId: string
  transaction: string // base64 unsigned VersionedTransaction
  recentBlockhash: string
  lastValidBlockHeight: number
  buildFingerprint: string
}

const auth = { apiKey: process.env.PANTA_API_KEY } // server-side only

const toUsdc = (baseUnits: string) => Number(baseUnits) / 1e6

// Blockhashes age out (~60s per the hint): rebuild once with the same
// createId; re-quote only when the session itself expired.
async function buildWithRetry(createId: string, wallet: string): Promise<Build> {
  try {
    return await call<Build>('/markets/create/build/', {
      method: 'POST',
      auth,
      body: { createId, wallet },
    })
  } catch (err) {
    if (err instanceof PantaError && err.code === 'CREATE_EXPIRED') {
      return call<Build>('/markets/create/build/', {
        method: 'POST',
        auth,
        body: { createId, wallet },
      })
    }
    throw err
  }
}

export async function createMarket(
  input: CreateMarketInput,
  signAndBroadcast: (unsignedTxBase64: string) => Promise<string>,
  onStep?: (step: FlowStep, detail?: string) => void,
): Promise<CreateResult> {
  // 1 — Quote: validates every field, reserves the session, prices the fee.
  const quote = await call<Quote>('/markets/create/quote/', {
    method: 'POST',
    auth,
    body: input,
  })
  onStep?.('quoted', quote.createId)

  // 2 — Build: unsigned versioned transaction bound to the session.
  const build = await buildWithRetry(quote.createId, input.wallet)
  onStep?.('built')

  // 3 — Sign + broadcast in the wallet. Mainnet spend: the confirmation
  // dialog belongs in your UI, shown BEFORE this call.
  const signature = await signAndBroadcast(build.transaction)
  onStep?.('signed', signature)

  // 4 — Register: fail-closed verification, idempotent on this signature.
  const reg = await call<{ marketId: string; status: string }>(
    '/markets/register/',
    { method: 'POST', auth, body: { createId: quote.createId, signature } },
  )
  onStep?.('registered', reg.marketId)

  return {
    marketId: reg.marketId,
    signature,
    feeUsdc: toUsdc(quote.paymentUsdc),
    liquidityUsdc: toUsdc(quote.liquidityInjectionUsdc),
    platformUsdc: toUsdc(quote.platformRevenueUsdc),
  }
}
