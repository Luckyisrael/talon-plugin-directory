// Panta primary buy flow — quote → build → sign → submit → report.
// Signing is injected so the wallet stays yours (on Solana Mobile,
// MWA signs outside this code): the buy build returns *instructions*,
// and compile→sign→broadcast happens in your wallet layer. This
// spends real USDC — confirm with the user in the UI before running.
import { PantaError, attribution, primary, type Instruction } from './panta-client'

export type BuyInput = {
  wallet: string // buyer + signer (base58)
  marketId: string
  side: 'yes' | 'no'
  amountUsdc: string // HUMAN decimals: "20.00"
  userId?: string // attribution id
  maxSlippageBps?: number // default 100 (1%), max 5000
}

export type BuyResult = {
  orderId: string
  signature: string
  expectedShares: string
  feeUsdc: string // human USDC
  attribution: { status: string; kind: string } | null
}

// Compile a VersionedTransaction from these instructions +
// recentBlockhash (@solana/kit or web3.js), sign with BuyInput.wallet,
// broadcast, and return the base58 signature.
export type SignStep = (instructions: Instruction[], recentBlockhash: string) => Promise<string>

export type FlowStep = 'quoted' | 'built' | 'signed' | 'submitted' | 'reported'

export async function buyShares(
  auth: { apiKey?: string; bearer?: string },
  input: BuyInput,
  signAndBroadcast: SignStep,
  onStep?: (step: FlowStep, detail?: string) => void,
  report = true, // explicit attribution is the reliable path
): Promise<BuyResult> {
  // 1 — Quote: simulates fill + fee, opens the short-lived session.
  const quote = await primary.quote(auth, {
    wallet: input.wallet,
    marketId: input.marketId,
    side: input.side,
    amountUsdc: input.amountUsdc,
    userId: input.userId,
  })
  onStep?.('quoted', quote.quoteId)

  // 2 — Build against the live curve. QUOTE_STALE / QUOTE_EXPIRED mean
  // the curve moved or the session aged (~60s): re-quote once, rebuild.
  let order: Awaited<ReturnType<typeof primary.build>>
  try {
    order = await primary.build(auth, {
      quoteId: quote.quoteId,
      wallet: input.wallet,
      userId: input.userId,
      maxSlippageBps: input.maxSlippageBps,
    })
  } catch (err) {
    if (!(err instanceof PantaError) || (err.code !== 'QUOTE_STALE' && err.code !== 'QUOTE_EXPIRED')) {
      throw err
    }
    const fresh = await primary.quote(auth, {
      wallet: input.wallet,
      marketId: input.marketId,
      side: input.side,
      amountUsdc: input.amountUsdc,
      userId: input.userId,
    })
    order = await primary.build(auth, {
      quoteId: fresh.quoteId,
      wallet: input.wallet,
      userId: input.userId,
      maxSlippageBps: input.maxSlippageBps,
    })
  }
  onStep?.('built', order.orderId)

  // 3 — Sign + broadcast in the wallet. Show expectedShares and feeUsdc
  // in the confirmation dialog BEFORE this call.
  const signature = await signAndBroadcast(order.instructions, order.recentBlockhash)
  onStep?.('signed', signature)

  // 4 — Submit: registers the signature for async confirmation.
  // Same orderId + signature is safe to retry.
  await primary.submit(auth, { orderId: order.orderId, signature, wallet: input.wallet })
  onStep?.('submitted')

  // 5 — Attribution (fail-closed, idempotent). Buys with an attribution
  // memo may auto-ingest; this explicit report is the reliable path.
  let reportResult: BuyResult['attribution'] = null
  if (report) {
    try {
      const r = await attribution.report(auth, {
        signature,
        wallet: input.wallet,
        marketId: input.marketId,
        quoteId: quote.quoteId,
        userId: input.userId,
      })
      reportResult = { status: r.status, kind: r.kind }
      onStep?.('reported', r.status)
    } catch {
      // Not fatal — poll attribution.status(signature) later instead.
    }
  }

  return {
    orderId: order.orderId,
    signature,
    expectedShares: order.expectedShares,
    feeUsdc: order.feeUsdc,
    attribution: reportResult,
  }
}
