---
name: pyth-overview
description: Pyth market data — real-time price feeds, continuous indices, and the data marketplace of publishers. Load when the task needs live prices, an always-on index, or Pyth market data in a build.
version: "1.0.0"
autoAttach: false
triggers: [content:pyth, content:price feed, content:market data, content:oracle price]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/pyth-api)
---

# Pyth market data (Talon pyth-api v1.0.0)

Pyth is the market-data layer of this directory: prices and indices
delivered where they are needed rather than polled from an aggregator.

## The product suite

| Product | What it is |
| --- | --- |
| **Price Feeds** | Real-time prices across global markets. |
| **Indices** | Continuous indexes for always-on markets. |
| **Data Marketplace** | Discover data from leading publishers. |

Pick the product by job: a single asset's live price → Price Feeds;
a continuously-open basket or benchmark → Indices; browsing what
publishers offer → Data Marketplace.

## API specifics — pending

**This section is intentionally not written yet.** Endpoints, auth,
subscription/pull patterns, and feed identifiers for these products
have not been supplied to this pack. **Do not build against guessed
Pyth endpoints** — a wrong guess is worse than no skill. Ask the user
for the API documentation, or wait for this skill to be updated; the
product routing above is safe to use now.

Rules: one skill, one job — route by product, never several loaded
just in case. When the API details land here, mainnet read paths stay
reads: no signing this skill will ever ask for.
