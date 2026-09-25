---
name: moove-overview
description: Moove payment API integration patterns for Talon builds. Load when the task needs the Moove payment API.
version: "1.0.0"
autoAttach: false
license: MIT (see ../../../LICENSE)
source: https://github.com/Luckyisrael/talon-plugin-directory (plugins/moove-payment-api)
---

# Moove payment API overview (Talon moove-payment-api v1.0.0)

**Skill data pending.** The pack structure is published — manifest, hashes,
registry row — but the API details (endpoints, auth, request/response
patterns, and the working starting points under `references/`) are being
authored and land here next.

Until this body is filled: **do not build against guessed endpoints or
invented auth for this API — and never fabricate a payment flow.** A wrong
guess is worse than no skill: ask the user for the API documentation, or
search for a plugin that covers the job.
