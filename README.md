# Talon plugin directory

Public plugin packs for builds done with [Talon](https://github.com/Luckyisrael/Talon).
One repo, many plugins, so a new pack never needs a new home. MIT licensed.

The Talon agent fetches a pack at build time when a task touches its area.
Nothing installs into your project on its own: the agent reads a skill,
adapts the pattern to the screen it is building, and writes the code.
Dependencies resolve through Talon's normal install flow.

## Plugins

| Plugin | Does | Version |
| --- | --- | --- |
| [`talon-mobile-ui`](plugins/talon-mobile-ui) | Wallet connect button, SOL balance view, transaction signing for Solana Mobile. | 1.0.0 |
| [`panta-api`](plugins/panta-api) | Panta API integration patterns for Talon builds. Skill data in authoring. | 1.0.0 |
| [`moove-payment-api`](plugins/moove-payment-api) | Moove payment API integration patterns for Talon builds. Skill data in authoring. | 1.0.0 |

## Use a plugin in a build

When a build needs a capability the project doesn't have — a payment
provider, a new API — the agent searches this directory with
`search_plugins`: matches are ranked by your request's words against each
plugin's name, description, and `keywords`, and each hit shows its
manifest name, version, and license before anything is enabled. Pick the
one that fits; the agent adds its pin to `.talon/plugins.json` — that
file is what you review, and nothing loads without it:

```json
{ "plugins": { "talon-mobile-ui": "1.0.0" } }
```

Then ask Talon for the thing: a wallet screen, a balance header, an
on-chain action. The agent loads the one matching skill itself, one at a
time, and reads its full starting point only when the skill names it.
State-changing mainnet calls always get your confirmation in the UI
before anything is sent.

Updates never land silently: when the directory publishes a newer version,
your build keeps serving the pinned bytes (from verified cache if needed)
and the log tells you the exact version to adopt. Edit the pin to update,
nothing else.

## Build your own plugin

A plugin is a folder with a `talon-plugin.json` manifest plus
`skills/*/SKILL.md` files, then one row in [`registry.json`](registry.json):

```json
{
  "name": "prediction-markets",
  "version": "1.0.0",
  "path": "plugins/prediction-markets",
  "description": "Prediction-market SDK patterns for Solana Mobile.",
  "license": "MIT",
  "keywords": ["prediction", "market", "odds", "trading"]
}
```

`keywords` (optional) are the plain-words jobs your pack wins — the
agent's `search_plugins` ranks matches on name, description, and these,
so write them the way a user would ask for the capability ("card
payment", "market odds"), not as internal codenames.

Each skill file carries `name`, `description`, `version` (pin exact
dependency lines), `autoAttach`, and `triggers`. Rules: guidance plus code
templates only, no executables; MIT license (root file covers every pack
unless a pack names its own); working starting points under `references/`.
Copy [`plugins/talon-mobile-ui`](plugins/talon-mobile-ui) as the reference:
manifest, three skills, three references.

Trust rules the agent enforces: skill bodies load on demand and never
auto-apply rules, file hashes pin every version, updates need approval,
dependencies resolve through the install flow, and everything borrowed
lands in the workspace where it can be read. The full guide lives in the
Talon web app under Docs, Plugins.

## Maintainer checklist (repo owner)

New packs and version bumps follow the same loop so the agent never sees a
half-published plugin:

1. Add the pack under `plugins/<name>/` with manifest, skills, and references.
2. Recompute file hashes into the pack manifest (every file except the
   manifest itself) and bump its version.
3. Add or update the pack row in `registry.json`, keeping name, version, and
   path in sync with the manifest, and its `keywords` pointing at the jobs
   the skills win (this is what `search_plugins` ranks on).
4. Keep skill descriptions mutually exclusive and triggers narrow: the agent
   loads one skill at a time through `read_skill`, so each skill must win
   exactly one job (connect vs balance vs send, never two).
5. Commit and push `main`. Pinned builds keep serving the old bytes until
   their pin moves, so publishing is always safe.
