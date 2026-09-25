---
name: panta-overview
description: Choose the right Panta surface — user auth, account & keys, market browsing, or market creation — and how API-key vs JWT auth, USDC amounts, and the create flow fit together. Load when Panta or panta.market is mentioned but no single job is named.
version: "1.1.0"
autoAttach: false
triggers: [content:panta, content:panta.market, content:prediction market, content:which panta]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/panta-api)
---

# Which Panta job (Talon panta-api v1.1.0)

Panta (panta.market) is a prediction-market platform: markets on live
happenings — sports, crypto, politics, entertainment, world events —
priced in USDC on Solana, created through an on-chain
quote → build → sign → register flow. This pack covers exactly the
source pages it was authored from (Auth & Account, Markets &
Creation); the full documentation index lives at
https://docs.panta.market/llms.txt — fetch it before calling anything
this pack does not name.

## Route the request

| The builder wants to… | Skill here |
| --- | --- |
| Register a user, log in, refresh a JWT, read/rename the profile | `panta-auth` |
| Manage API keys, dashboard, usage metrics, attributed trades | `panta-account` |
| Browse markets, spot prices, categories, the trade tape | `panta-markets` |
| Create a market (quote → build → sign → register) | `panta-create` |

## Base + auth (applies to every skill)

- Base URL: `https://live-api.panta.market/api/v1`
- Two credentials, interchangeable on every non-public endpoint:
  - **API key** — `X-Api-Key: pk_test_…` / `pk_live_…` for
    server-side and partner calls.
  - **User JWT** — `Authorization: Bearer <access>` for a
    logged-in user.
- Public (no credential): register, login, refresh — see `panta-auth`.
- Errors return `{ "code": "…" }`. Codes this pack handles:
  `UNAUTHORIZED` (401) · `RATE_LIMITED` · `INVALID_MARKET_PARAMS` ·
  `MARKET_NOT_FOUND` · `EMAIL_TAKEN` (409) · `CREATE_NOT_PERMITTED` ·
  `DUPLICATE_MARKET` · `CREATE_EXPIRED` · `TX_NOT_FOUND` ·
  `TX_FAILED` · `TX_MISMATCH` · `TX_FEE_MISMATCH`.
- Amounts come in two shapes and must never be mixed in one field:
  human decimal strings (`"20.00"`) and USDC **base units** integer
  strings — 6 decimals, so `"20000000"` is $20.00.
- Pagination on list endpoints is a cursor: pass `nextCursor` back as
  `cursor` until it is null.

## Trust rules

Keep `PANTA_API_KEY` server-side — never in the app bundle; route
partner calls through your backend. A user JWT belongs to the session
that earned it. The create flow spends real USDC: every state-changing
mainnet step asks the user in the UI before anything is signed.

Rules: pick the skill by job and load one at a time — never several
just in case. Do not build against guessed endpoints or invented auth:
if the job is outside this pack (positions, partner trade reporting,
the create-quote fees page), fetch https://docs.panta.market/llms.txt
for the real reference first.
