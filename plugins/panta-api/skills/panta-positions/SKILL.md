---
name: panta-positions
description: Show a wallet's Panta holdings, estimate position value, and claim winnings or creator fees. Load when the task is positions, portfolio value, or claiming on the Panta API.
version: "1.2.0"
autoAttach: false
triggers: [content:panta positions, content:claim winnings, content:portfolio value, content:panta claim]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/panta-api)
---

# Panta positions & claims (Talon panta-api v1.2.0)

## List positions — `GET /positions/?wallet=`

`wallet` (base58, required) → `wallet` echo + `positions[]`:

| Field | |
| --- | --- |
| `marketId`, `category` | Event address; catalog category when available |
| `side` | `yes` or `no` |
| `shares` | Human-readable share quantity |
| `phase` | `primary` \| `secondary` \| `resolved` \| `cancelled` |
| `claimable` | Claim construction allowed for this side |
| `claimed` | A claim account already exists |
| `outcome` | `yes` / `no` after resolution, else `null` |

A holding with **both** YES and NO shares returns **two rows** (one per
side) for the same `marketId` — expected, not a duplicate. Indexer
balances may lag the chain briefly after a purchase; result sets are
capped (typically 200 rows). Empty array when the wallet holds
nothing. Errors: `INVALID_MARKET_PARAMS` · `RATE_LIMITED`.

## Estimating position value (client-side)

Positions return **shares, not dollars** — combine two reads:

1. `GET /positions/?wallet=` → `shares`, `side`, `claimable`, `outcome`
2. `GET /markets/{marketId}/` → spot `yesPrice` / `noPrice` (list rows
   often leave them `null`)

| Situation | Estimate |
| --- | --- |
| Open (`outcome` null, not claimable) | `shares ×` side price — `yesPrice` for yes, `noPrice` for no |
| Resolved winner (`side === outcome`) / claimable | ≈ **1 USDC per share** (or `winningShares` from claim build) |
| Resolved loser (`side !== outcome`) | ≈ `0` |

Once a market **resolved**, stop using live spot prices — settlement is
win ≈ $1/share, lose = $0. Spot prices are for open markets only.
Example: `38.40 × 0.52 ≈ 19.97`. This is mark-to-market for display,
not a guaranteed settlement. Cache market detail per `marketId` instead
of refetching the same market for every row.

## Win claim — `POST /claim/build/`

`{ "wallet": "…", "marketId": "…" }` → `outcome`, `winningShares`,
`instructions[]`, `derived` (`winClaim`, `positionPda`,
`vaultAuthority`), `recentBlockhash`, `lastValidBlockHeight`. Check
`claimable` from the positions list first; the endpoint re-validates
on-chain and **fails closed**. Errors: `MARKET_NOT_FOUND` ·
`NOT_CLAIMABLE` · `INVALID_MARKET_PARAMS`. Compile → sign (the
claimant wallet) → broadcast. Optionally report it for attribution —
`POST /trades/` with `kind: claim` (see `panta-buy`).

## Creator fees — `POST /claim/creator-fees/build/`

For the market **creator** of a **graduated** market — a different
path from win claims: `{ "wallet": "…", "marketId": "…" }` →
`claimableFeesUsdc` in **base units** (`"2500000"` = 2.50 USDC),
`instructions[]` (may include a create-ATA step), `derived`
(`creatorFeeVault`, `creatorFeeVaultTokenAccount`,
`creatorTokenAccount`, `marketConfig`), `recentBlockhash`,
`lastValidBlockHeight`. The wallet must match the on-chain creator,
and the vault must hold nonzero `accumulated_fees`. Errors:
`MARKET_NOT_FOUND` · `NOT_MARKET_CREATOR` · `MARKET_NOT_GRADUATED` ·
`NO_CREATOR_FEES` · `INVALID_MARKET_PARAMS`. Creator-fee signatures
are **not** attributable — reporting them returns `TX_MISMATCH`.

Rules: one skill — buying is `panta-buy`. Claim only what
`claimable` says (and expect fail-closed anyway); before signing a
mainnet claim, show winning shares and the ≈$1/share expectation in
the UI. Positions are per-wallet reads: never build a claim for a
wallet that did not sign it.
