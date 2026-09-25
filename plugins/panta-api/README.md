# panta-api

Talon plugin pack: Panta (panta.market) — the prediction-market API for
building around live happenings across the globe and Nigeria: the
USDC market catalog, spot prices, the trade tape, the on-chain
quote → build → sign → register create flow, primary buys, holdings,
and claims.

**Status: skills authored from the official product docs.** The source
material covers three pages — Auth & Account, Markets & Creation, and
Buy, Positions & Claims — and that is exactly what this pack ships.
Deliberately *not* covered, and called out as such inside the skills:
every API-reference page outside those three. The skills point at
`https://docs.panta.market/llms.txt` for the full index instead of
inventing endpoints.

Seven skills, one job each:

| Skill | Wins this job |
| --- | --- |
| `panta-overview` | Picking the right surface; API-key vs JWT auth; error codes & amounts |
| `panta-auth` | Register, login, JWT rotation, read/rename the account |
| `panta-account` | API keys (issue/list/revoke), dashboard, metrics, attributed trades |
| `panta-markets` | Catalog browsing, categories, spot prices, market & wallet trade tape |
| `panta-create` | Market creation: image, quote, build, sign, register |
| `panta-buy` | Primary buy: quote, slippage, build, sign, submit + trade reporting/status |
| `panta-positions` | Holdings, position valuation, win claims, creator-fee claims |

Four references: `panta-client.ts` (typed client keeping
`PANTA_API_KEY` server-side), `create-market-flow.ts` (the four-step
creation orchestration with a `CREATE_EXPIRED` rebuild),
`buy-flow.ts` (quote → build → sign → submit → report with a
`QUOTE_STALE` re-quote), and `markets-screen.tsx` (category-filtered
browse screen with cursor pagination).

Base URL: `https://live-api.panta.market/api/v1` · auth via
`X-Api-Key: pk_test_…` / `pk_live_…` or `Authorization: Bearer <jwt>`.

See the root [README](../../README.md) for how plugins load.
