# moove-payment-api

Talon plugin pack: Moove (moove.xyz) payments — the payment-link API
for taking crypto payments on your own site, plus the send, receive,
and swap flows around it.

**Status: skills authored from the official product docs.** The
source material covers five pages — Overview, Widget, Send, Receive,
Swap — and that is exactly what this pack ships. Deliberately *not*
covered, and called out as such inside the skills: the rest of the
API reference beyond `POST /v1/payment-link`, and the Bridge, Ramp,
Stake, and Agentic Payments pages. The skills point at
`https://docs.moove.xyz/llms.txt` for the full index instead of
inventing endpoints.

Five skills, one job each:

| Skill | Wins this job |
| --- | --- |
| `moove-overview` | Picking the right Moove product; settlement + auto-routing |
| `moove-widget` | The moove.xyz web surface — and why it cannot be embedded |
| `moove-send` | Paying a handle or wallet address |
| `moove-receive` | Payment links (incl. the checkout API) and any-amount shareables |
| `moove-swap` | Swap and bridge flows, quote review |

Four references: `payment-link-client.ts` (keeps `MOOVE_API_KEY`
server-side), `send-screen.tsx`, `receive-screen.tsx`,
`swap-screen.tsx`.

See the root [README](../../README.md) for how plugins load.
