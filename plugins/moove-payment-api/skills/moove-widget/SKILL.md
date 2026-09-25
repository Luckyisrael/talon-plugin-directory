---
name: moove-widget
description: The moove.xyz web widget — five tabs, deep-link routes, Advanced view, wallet connections, and why it cannot be embedded on another site. Load for embed or frame requests, or when building a surface that mirrors the widget's UI.
version: "1.1.0"
autoAttach: false
triggers: [content:moove widget, content:embed moove, content:advanced view]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/moove-payment-api)
---

# The Moove Widget (Talon moove-payment-api v1.1.0)

The widget is the moove.xyz interface itself — **web only**. The Moove
App uses native screens instead of the widget, with the same products
behind them.

## It cannot be embedded

Despite the name, it is not an embeddable component: moove.xyz sets
frame protections that block any other site from framing it, and there
is no widget script, iframe snippet, or SDK to install. A request to
"embed the Moove widget" ends here — the supported path for taking
payments on your own site is the payment-link API, which lives in
`moove-receive`.

## The five tabs

| Tab | Does | Route |
| --- | --- | --- |
| Profile | The page others pay you from | `/profile` |
| Send | Pay a handle or wallet address | `/send` |
| Receive | Create a payment link | `/receive` |
| Swap | Trade tokens — same chain is a swap, another chain is a bridge, in this one tab | `/swap` |
| Ramp | Preview a local-currency conversion; it completes in the Moove App | `/ramp` |

**Advanced view** (settings icon) adds a **Description** shown to the
payer on Send and Receive — the merchant field, for invoicing: without
it the widget pays a friend, with it it invoices a client. It is a
display toggle, not a plan — no upgrade, no separate pricing, no
entitlement.

Wallets: MetaMask, Phantom, Base, Trust, Solflare, Backpack; 30+
chains. Moove Wallet and Moove Contacts are Moove App products with no
widget tab.

Rules: when imitating the surface in an app, mirror these routes and
tab semantics — the App's native screens map to the same products —
but never ship anything that frames moove.xyz, and link out to
moove.xyz for the real widget. Anything that moves money goes through
the flow skills (`moove-send`, `moove-receive`, `moove-swap`), not a
re-creation of the widget itself.
