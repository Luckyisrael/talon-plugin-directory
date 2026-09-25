---
name: panta-auth
description: Register, log in, rotate refresh JWTs, and read or rename the Panta account. Load when the task is user signup, login, session refresh, or profile on the Panta API.
version: "1.2.0"
autoAttach: false
triggers: [content:panta auth, content:panta login, content:panta register, content:panta jwt]
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/panta-api)
---

# Panta user auth (Talon panta-api v1.2.0)

Register, login, and refresh are **public** — no API key required.
Register and login return the same envelope:

| Field | Meaning |
| --- | --- |
| `userId` | Account id (`usr_…`) |
| `email`, `name` | Login email and display name |
| `access` | JWT access token — send as `Authorization: Bearer <access>` |
| `refresh` | JWT refresh token — **rotated** on every refresh call |

```bash
curl -sS -X POST https://live-api.panta.market/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"a-strong-password","name":"Acme"}'
```

- `POST /auth/register/` — body: `email`, `password` (min 8, max 128,
  Django validators), `name` optional (defaults from the email
  local-part). 201 → envelope. Duplicate email → 409 `EMAIL_TAKEN`.
  New accounts get `canCreateMarkets: true`.
- `POST /auth/token/` — `email` + `password` → same envelope. Bad
  credentials **or a suspended account** → 401 `UNAUTHORIZED`.
- `POST /auth/token/refresh/` — `{ "refresh": "<jwt>" }` → `{ access,
  refresh }`. Refresh tokens are one-time: the previous refresh token
  is invalidated the moment a new one is issued. Invalid or expired →
  401 `UNAUTHORIZED`.
- `GET /account/` — alias `GET /whoami/`. Accepts `X-Api-Key` or the
  Bearer JWT. Returns `userId`, `email`, `name`, `status`
  (`active` | `suspended`), `canCreateMarkets`, `createdAt`, and
  `apiKeyId` when authenticated with a key.
- `PATCH /account/` — `{ "name": "…" }` (non-empty, max 255) → the
  account shape above.

Rules: one skill, one job — API keys, dashboard, and metrics live in
`panta-account`. Keep the access token in memory/session and rotate it
through refresh; persist the rotated refresh token immediately, because
the old one dies on first use. Treat 401 as "re-login", never as
"retry" — and surface a suspended account as signed-out, not as a
silent loop. Passwords never leave the client in plaintext beyond the
one register/login call.
