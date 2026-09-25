---
name: panta-markets
description: Browse Panta markets — catalog list, filters, categories, spot prices, and the trade tape for a market or wallet. Load when the task is showing prediction markets, prices, volume, or trades on the Panta API.
version: "1.2.0"
autoAttach: false
triggers: [content:panta markets, content:panta prices, content:panta trades, content:prediction market list]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/panta-api)
---

# Panta market browsing (Talon panta-api v1.2.0)

All endpoints below take `X-Api-Key` or the Bearer JWT. The catalog
comes from the registry — **list responses do not live-RPC prices**;
detail fills spot prices when RPC is available.

## List markets

```bash
curl -sS "https://live-api.panta.market/api/v1/markets/?category=crypto&status=primary&limit=20" \
  -H "X-Api-Key: pk_test_…"
```

`GET /markets/` — query:

| Param | Values |
| --- | --- |
| `category` | One of the `GET /categories/` slugs |
| `status` | Phase: `primary` \| `secondary` \| `resolved` \| `cancelled` |
| `createdBy` | Only `me` — markets this API account created. Omit for the public catalog |
| `cursor` | Opaque `marketId` from the previous page's `nextCursor` |
| `limit` | Page size, default 20, max 50 |

Row fields: `marketId` (event address), `category`, `title`,
`description`, `images[]`, `phase`, `marketType` (`standard` |
`breaking`), `startTime` / `endTime` / `resolutionTime` (Unix
seconds), `region`, `resolved`, `status` (catalog label),
`volumeUsdc` (human decimal), `campaignId`, `createdByPartner`, and
the price fields `yesPrice` / `noPrice` / `primary*` / `secondary*` —
**null on list**, filled on detail.

## Detail, categories, tape

- `GET /markets/{marketId}/` — same row with prices filled from
  on-chain state when RPC is available. Use `shares ×` side price to
  estimate position value client-side. Errors: `MARKET_NOT_FOUND`.
- `GET /categories/` → allowlist: `sports`, `crypto`, `politics`,
  `entertainment`, `finance`, `science`, `world`, `other`. Same slugs
  feed list filters and create-quote `category`.
- `GET /markets/{marketId}/trades/?limit=50` (cap 200) — the public
  tape: `id`, `wallet`, `isPrimary`, `yesAmount` / `noAmount`,
  `feePaid`, `blockTime`, `signature`, `quoteAsset` (`USDC`).
- `GET /wallets/{wallet}/trades/?limit=` — same rows for one wallet
  (base58 address).

Errors across the surface: `UNAUTHORIZED` · `RATE_LIMITED` ·
`INVALID_MARKET_PARAMS` · `MARKET_NOT_FOUND`.

Rules: one skill, one job — creating markets is `panta-create`, your
account's attributed numbers are `panta-account`. The list is a
catalog snapshot: never render live prices from it — fetch detail for
the rows you show prices for. The tape (`/trades/`) is the full public
history and is not attribution. Filter on `phase`; `status` is a
display label.
