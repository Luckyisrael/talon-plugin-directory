---
name: panta-create
description: Create a Panta market end to end — image upload, quote, build the transaction, sign and broadcast, then register. Load when the task is launching a prediction market on the Panta API.
version: "1.2.0"
autoAttach: false
triggers: [content:panta create, content:panta quote, content:create market, content:panta register]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/panta-api)
---

# Panta market creation (Talon panta-api v1.2.0)

The create flow is four steps in a fixed order — each is a state
transition, and the session status tells you where you are:
`pending` (quote reserved) → `built` (unsigned tx built) →
`registered` (on-chain create verified and cataloged). Requires
`canCreateMarkets` on the account, else `CREATE_NOT_PERMITTED`.

## 0. Image (optional) — signed Cloudinary upload

If you don't host images yourself: `POST /markets/create/image-upload/`
with your key and an empty JSON body → `uploadUrl`, `fields`,
`publicId`, `expiresAt` (**~5 minutes**). Build
`multipart/form-data` with every key in `fields` plus `file`, POST it
to `uploadUrl`, and pass Cloudinary's `secure_url` as `imageUrl`.
Image bytes never pass through Panta; the Cloudinary API secret never
appears in the response. Prefer a square 1024×1024 asset.

## 1. Quote — `POST /markets/create/quote/`

Validates everything, reserves the session, and returns the USDC
creation fee (fee amounts are **base units**, integer strings, 6
decimals):

| Body field | Rule |
| --- | --- |
| `wallet` | Fee payer + signer (base58) — derives the event address with `question` |
| `question` | Max 512 |
| `resolutionRule` | Max 2048 — how it resolves |
| `sourcesOfTruth` | 1–20 URLs |
| `category` | From the `GET /categories/` allowlist |
| `startTime` | Unix s; `< endTime`, and ≥ now + `minimumStartDelay` (typically **3600s**) |
| `endTime` | Unix s; `≤ resolutionTime` |
| `resolutionTime` | Unix s |
| `imageUrl` | Required, public `http`/`https` (no localhost/private hosts), ≤2048 |
| `marketType` | `standard` (default) or `breaking` |
| `eventInProgress` | Only with `breaking` — skips the start delay; `endTime` must still be future |
| `title`, `description`, `region` | Optional — title defaults to question, region to `Global` |
| `oracle` | Defaults to `sourcesOfTruth` joined by `,` |

Response: `createId`, `expectedEventPda`, `paymentUsdc` (total fee,
base units), `liquidityInjectionUsdc` + `platformRevenueUsdc` (the
split), `expiresAt`, `blockhashExpiryHintSec: 60`.
Errors: `INVALID_MARKET_PARAMS` · `DUPLICATE_MARKET` ·
`CREATE_NOT_PERMITTED` · `RATE_LIMITED`; field failures return HTTP
400 with `code` plus per-field `fields`.

## 2. Build — `POST /markets/create/build/`

`{ "createId": "cr_…", "wallet": "…" }` (wallet, if set, must equal
the quote's) → base64 unsigned `VersionedTransaction`,
`recentBlockhash`, `lastValidBlockHeight`, `buildFingerprint`
(checked at register), `derived` account addresses. On
`CREATE_EXPIRED` (blockhash ages out — the hint says ~60s) call build
again with the same `createId`; re-quote only if the session itself
expired.

## 3. Sign and broadcast — the wallet's job

Decode the transaction, sign with the **same wallet** from the quote,
and broadcast. This spends real USDC: the user must have confirmed the
action in the UI before signing (Talon's mainnet rule). On Solana
Mobile the wallet signs via MWA — this code never touches key
material.

## 4. Register — `POST /markets/register/`

`{ "createId": "cr_…", "signature": "<base58>" }` → `marketId` (the
event PDA used by every later API), `status: "registered"`, `images`.
Verification is fail-closed (transaction presence and success,
program, accounts, fee match) and idempotent: repeating the same
`createId` + `signature` succeeds; a different signature for the same
`createId` is rejected. Errors: `CREATE_EXPIRED` · `TX_NOT_FOUND` ·
`TX_FAILED` · `TX_MISMATCH` · `TX_FEE_MISMATCH`.

Orchestration starting point: `references/create-market-flow.ts`.

Rules: one skill, one flow — the order never varies, and the wallet
that quoted must be the wallet that signs. Show the fee
(`paymentUsdc ÷ 1e6` USDC) before signing, confirm in the UI, register
before the market appears in the catalog. Browsing is
`panta-markets`; keys and metrics are `panta-account`.
