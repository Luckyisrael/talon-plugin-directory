---
name: moove-receive
description: Get paid with Moove — create payment links (including the payment-link API for taking payments on your own site), and share handle, profile, or QR for any-amount payments. Load for invoices, checkouts, checkout APIs, or receive screens.
version: "1.1.0"
autoAttach: false
triggers: [content:payment link, content:api.moove.xyz, content:MOOVE_API_KEY, content:moove profile]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/moove-payment-api)
---

# Moove Receive (Talon moove-payment-api v1.1.0)

Two ways to be paid, split by who names the amount: a **payment
link** with the amount you set — invoices, checkouts, fixed prices —
or shareables (handle `@yourname`, profile `moove.xyz/@yourname`, QR)
where the payer names the amount — tips, donations, bio links. Either
way the payer can pay in whatever they hold, on whatever chain: no
Moove account needed, and any swap or bridge runs inside their
payment, landing in your wallet in your settlement token.

## The payment-link API — taking payments on your own site

One call creates the link; send the payer to the `url` in the
response. Base `https://api.moove.xyz/v1`, authenticated with an
`X-API-Key` header (create keys at
https://docs.moove.xyz/manage/moove-api-keys).

```bash
curl -sS -X POST "https://api.moove.xyz/v1/payment-link" \
  -H "X-API-Key: $MOOVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "toAmount": "49.99", "description": "INV-2026-0142", "maxUsage": 1 }'
```

- `toAmount` — string, the amount asked for, in your settlement token.
- `description` — shown to the payer on checkout; up to **500**
  characters through the API (the Moove Widget field caps at 160).
- `maxUsage` — payments the link accepts before it completes. Widget
  links are always 1; the API is also the only way to set an expiry
  (field documented in the API reference below).
- Response: at least `url` — that is the checkout page the payer opens.

The full endpoint reference:
https://docs.moove.xyz/api-reference/moove-receive/moove-payment-links
— this pack's source covers this one route; fetch
https://docs.moove.xyz/llms.txt for the complete index before calling
anything else. Keep `MOOVE_API_KEY` server-side: never ship it in the
app bundle — route the call through the app's backend.

Client that keeps the key out of the bundle:
`references/payment-link-client.ts`.

## Link rules

Statuses: **Active** (accepting payments) → **Completed** (hit its
usage cap) or **Inactive** (deactivated, or expired). Widget-created
links are single-use and never expire — they complete when paid once.
Track and deactivate in the web dashboard.

Cost: a payment needing no swap or bridge is free; cross-token or
cross-chain takes a protocol fee, and on a **payment link the payer
covers it** — you receive exactly `toAmount`. On a Profile, the payer
names the amount, so the fee comes out of what reaches you: invoice
with a link when the amount must arrive whole.

## Shareables (any amount)

The Moove App's Receive tab shares the handle (copy `@yourname`), the
profile link (copy `moove.xyz/@yourname`), or a QR code (Share QR
code). For a fixed amount on mobile, create the link on the web and
share it from the phone — the link works anywhere. Screen pattern:
`references/receive-screen.tsx`.

Rules: one skill, two sub-flows — pick by who sets the amount, never
offer both in one screen. Describe links as single-use unless the API
set a higher cap. Perpetual and custom links are announced but not
built: do not design around them. Payer-facing copy promises "any
crypto, any chain" only for the routing Moove actually performs; exact
fees and tolerances live at
https://docs.moove.xyz/product-prices/how-product-and-prices-work —
link the pricing page rather than quoting numbers.
