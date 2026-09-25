---
name: panta-buy
description: Buy shares in a Panta market — primary order quote, slippage, build, sign, submit — plus trade reporting and status. Load when the task is buying into a market, taking a position, or reporting a trade on the Panta API.
version: "1.2.0"
autoAttach: false
triggers: [content:panta buy, content:primary order, content:buy shares, content:panta trade]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/panta-api)
---

# Panta primary buy (Talon panta-api v1.2.0)

Buying happens in the **primary phase** only (`MARKET_NOT_IN_PRIMARY`
otherwise) and follows quote → build → sign → submit. All endpoints
take `X-Api-Key` or the Bearer JWT.

## 1. Quote — `POST /primaryorderquote/`

Simulates the fill and fee, then opens a short-lived session:

| Body | |
| --- | --- |
| `wallet` | Buyer (base58) |
| `marketId` | Event / market address |
| `side` | `yes` or `no` (case-insensitive) |
| `amountUsdc` | Deposit in **human-readable USDC** (`"20.00"`) |
| `userId` | Optional attribution id — may also ride as `X-User-Id` |

→ `quoteId`, `shares` (estimated), `avgPrice`, `feeUsdc` (human USDC),
`expiresAt`, `blockhashExpiryHintSec: 60`.
Errors: `MARKET_NOT_FOUND` · `MARKET_NOT_IN_PRIMARY` ·
`AMOUNT_TOO_SMALL` · `INVALID_MARKET_PARAMS` · `RATE_LIMITED`.

## 2. Build — `POST /primaryorderbuild/`

`{ "quoteId": "qt_…", "wallet": "…", "maxSlippageBps": 100 }` —
wallet must match the quote; `userId`, if sent, must not contradict
the quote binding. `maxSlippageBps` defaults to **100 (1%)**, maximum
5000. → `orderId`, `instructions[]` (ordered Solana instructions:
`programId`, base64 `data`, `accounts`), `expectedShares`, `feeUsdc`,
`recentBlockhash`, `lastValidBlockHeight`, `derived`, `expiresAt`.

If the curve moved beyond your slippage the build is rejected with
`QUOTE_STALE` — re-quote and build again (also on `QUOTE_EXPIRED`).
Fresh quotes live ~60s per the hint.

## 3. Sign and broadcast

Compile a versioned transaction from `instructions` +
`recentBlockhash`, sign with the **same wallet**, broadcast. This
spends real USDC: the user confirms in the UI before signing
(Talon's mainnet rule); on Solana Mobile the wallet signs via MWA.

## 4. Submit — `POST /primaryordersubmit/`

`{ "orderId": "ord_…", "signature": "…" }` → `status: "submitted"`.
This registers the signature for asynchronous confirmation — it does
**not** wait for finalization. Repeating the same `orderId` +
`signature` is safe to retry.

## After the trade: attribution

- `POST /trades/` — `{ signature, wallet, marketId, quoteId?,
  clientOrderId?, userId? }` → `status: "processed"`, `kind`
  (`buy` | `claim`), `side`. Verification is fail-closed: the
  transaction must invoke the USDC program as `primary_order_usdc` or
  `claim_win_usdc`. Idempotent per signature. Buys carrying an
  attribution memo may be ingested automatically — this explicit path
  is the reliable one. Creator-fee claims are **not** attributable
  here (they return `TX_MISMATCH` — see `panta-positions`).
- `GET /trades/{signature}/` — status: `processed` (stored) ·
  `pending_attribution` (seen on-chain, not yet attributed) ·
  `unknown` · `failed`. The `userId` query scopes visibility;
  responses never expose another account's attribution fields.

Orchestration starting point: `references/buy-flow.ts`.

Rules: one skill — buying and attribution live here; holdings and
claims are `panta-positions`. `amountUsdc` is a **human decimal**
(the create flow's fees are base units — never mix them). Show
`expectedShares` and `feeUsdc` in the confirmation UI, default
slippage unless the market needs more, and poll trade status rather
than assuming `processed` after submit.
