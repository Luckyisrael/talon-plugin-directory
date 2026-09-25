---
name: panta-account
description: Manage Panta API keys (issue, list, revoke), read the dashboard, usage metrics, create sessions, and attributed trades. Load when the task is partner keys, usage numbers, volume or fee reporting on the Panta API.
version: "1.2.0"
autoAttach: false
triggers: [content:panta api key, content:panta metrics, content:panta dashboard, content:panta volume]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/panta-api)
---

# Panta account, keys & metrics (Talon panta-api v1.2.0)

Everything here authenticates with `X-Api-Key: pk_…` **or** the user
Bearer JWT. This is the partner surface: your keys and the numbers
attributed to them.

## API keys

- `GET /account/keys/` → `{ keys: [...] }` — `id`, `name`, `prefix`
  (recognition only), `env` (`test` | `live`), `status`
  (`active` | `revoked`), `createdAt`, `revokedAt`. Secrets are never
  returned again.
- `POST /account/keys/` — body `{ "env": "test", "name": "ci",
  "revokeOthers": false }` → key metadata **plus `secret` — this is the
  only time the full key (`pk_test_…` / `pk_live_…`) exists in a
  response.** Persist it immediately; it cannot be retrieved.
- `POST /account/keys/{id}/revoke/` — empty body; idempotent if
  already revoked.

`revokeOthers: true` revokes every other active key for the account —
destructive, so confirm it in the UI before issuing such a key.

## Account, dashboard, metrics

- `GET /account/` — account shape (see `panta-auth`), including
  `status` and `canCreateMarkets`.
- `GET /account/dashboard/` → `account`, `keys` counts
  (`active`/`revoked`/`total`), `metrics` totals, `permissions`.
- `GET /account/metrics/?limit=50` (cap 200) → `summary` +
  recent rows:
  - `creates`: `total`, `byStatus` (`pending` = quote reserved,
    `built` = unsigned tx built, `registered` = on-chain create
    verified and cataloged).
  - `trades`: `total`, `volumeUsdcBase` (USDC base units, 6 decimals),
    `byKind` (`buy` | `claim`) — **attributed** volume for this account
    only.
  - `keys`: `active`, `revoked`, `total`.
- `GET /account/creates/?limit=&status=` → create-session rows:
  `createId`, `wallet`, `eventPda`, `signature`, `status`,
  `paymentUsdc` (human) + `paymentUsdcBase` (base units), timestamps.
  Prefer `GET /markets/?createdBy=me` for catalog DTOs of the markets
  you created — this endpoint is create-session metrics.
- `GET /account/trades/?limit=&kind=buy|claim` → partner attribution
  rows: `signature`, `wallet`, `marketId`, `side`, `amountUsdc`,
  `amountUsdcBase`, `status`, `createdAt`.

## Fees are not in metrics

Metrics never return trading fees. Estimate client-side from
**attributed buy volume only** (ignore `claim`):

```text
fee ≈ amountUsdc × primaryFeeBps / 10_000
estFeesUsdcBase ≈ volumeUsdcBase × primaryFeeBps / 10_000
```

`primaryFeeBps` comes from on-chain `MarketConfig` — commonly `200`
(2%). Unreported buys are not in `volumeUsdcBase`, so this is a rough
partner estimate, not an invoice.

Rules: one skill, one job — user JWT flows live in `panta-auth`, the
public market tape in `panta-markets`. Attribution rows are your
account's slice, never the full tape; writing attribution
(report/status) lives in `panta-buy`. Show dollars as
`base units ÷ 1e6`, and label fee numbers as estimates.
