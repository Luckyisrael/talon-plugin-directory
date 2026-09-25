# pyth-api

Talon plugin pack: Pyth — real-time price feeds, continuous indices,
and a data marketplace for discovering publishers of market data.

**Status: overview skill authored, API details in authoring.** The
product suite (Price Feeds, Indices, Data Marketplace) is published and
routable now; endpoints, auth, and pull patterns arrive when the API
docs are supplied. The overview skill says so in its own body and
forbids building against guessed endpoints until then — that rule is
the point, not a placeholder.

One skill for now:

| Skill | Wins this job |
| --- | --- |
| `pyth-overview` | Routing a market-data need to the right Pyth product |

See the root [README](../../README.md) for how plugins load.
