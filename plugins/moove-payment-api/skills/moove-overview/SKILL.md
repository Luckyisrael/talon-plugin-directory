---
name: moove-overview
description: Choose which Moove product fits the request — Send, Receive, Swap, Bridge, Ramp, Widget, Agentic Payments — and how settlement plus auto-routing work. Load when Moove is mentioned but no single flow is named.
version: "1.1.0"
autoAttach: false
triggers: [content:moove.xyz, content:settlement token, content:which moove]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/moove-payment-api)
---

# Which Moove product (Talon moove-payment-api v1.1.0)

moove.xyz moves money every way — send, receive, swap, bridge, and
convert between local currency and crypto. Every product runs on the
same two ideas: you get paid in the **settlement token** you chose
(token and chain a person chose to be paid in), and the swap or bridge
needed to get there is embedded in the transaction rather than left to
the user.

## Route the request

| The user wants to… | Product | Skill here |
| --- | --- | --- |
| Pay a person | Moove Send | `moove-send` |
| Be paid a specific amount | Moove Receive (payment link) | `moove-receive` |
| Be paid any amount (handle, profile, QR) | Moove Receive / Moove Profile | `moove-receive` |
| Change one token for another | Moove Swap | `moove-swap` |
| Move a token to a different chain | Moove Bridge (part of the Swap flow) | `moove-swap` |
| Buy crypto with local currency, or cash out | Moove Ramp — Nigeria, Australia, Hong Kong, in the Moove App (web previews the rate only) | — (no API for it in this pack's source) |
| Take payments on their own website | Moove Agentic Payments or the payment-link API | `moove-receive` |
| Embed the moove.xyz widget | Impossible by design — frame protections, no script or SDK | `moove-widget` |

Rules: read this table when the request says "Moove" without naming a
flow, then load exactly one skill above for the flow itself — never
several. Moove Stake is announced, not built; perpetual and custom
payment links are announced, not built; Moove Handle aliases
(`name.eth`, `name.sol`) are coming soon. The complete doc index:
https://docs.moove.xyz/llms.txt — consult it before using any endpoint
this pack does not cover.
