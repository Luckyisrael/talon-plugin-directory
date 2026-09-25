# panta-api

Talon plugin pack: Panta (panta.market) — the prediction-market API for
building around live happenings across the globe and Nigeria: the
USDC market catalog, spot prices, the trade tape, and the on-chain
quote → build → sign → register create flow.

**Status: skills authored from the official product docs.** The source
material covers two pages — Auth & Account, and Markets & Creation —
and that is exactly what this pack ships. Deliberately *not* covered,
and called out as such inside the skills: positions, partner trade
reporting, and every other API-reference page. The skills point at
`https://docs.panta.market/llms.txt` for the full index instead of
inventing endpoints.

Five skills, one job each:

| Skill | Wins this job |
| --- | --- |
| `panta-overview` | Picking the right surface; API-key vs JWT auth; error codes & amounts |
| `panta-auth` | Register, login, JWT rotation, read/rename the account |
| `panta-account` | API keys (issue/list/revoke), dashboard, metrics, attributed trades |
| `panta-markets` | Catalog browsing, categories, spot prices, market & wallet trade tape |
| `panta-create` | Market creation: image, quote, build, sign, register |

Three references: `panta-client.ts` (typed client keeping
`PANTA_API_KEY` server-side), `create-market-flow.ts` (the four-step
orchestration with a `CREATE_EXPIRED` rebuild), and
`markets-screen.tsx` (category-filtered browse screen with cursor
pagination).

Base URL: `https://live-api.panta.market/api/v1` · auth via
`X-Api-Key: pk_test_…` / `pk_live_…` or `Authorization: Bearer <jwt>`.

See the root [README](../../README.md) for how plugins load.
