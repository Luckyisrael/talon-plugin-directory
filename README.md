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
| [`web3-components`](plugins/web3-components) | Wallet connect button, SOL balance view, transaction signing for Solana Mobile | 1.0.0 |

## Use a plugin in a build

Ask Talon for the thing: a wallet screen, a balance header, an on-chain
action. The agent loads the matching skill itself. The first time a new
plugin loads, you approve its manifest, license, and pinned version.
State-changing mainnet calls always get your confirmation in the UI before
anything is sent.

## Build your own plugin

A plugin is a folder with a `talon-plugin.json` manifest plus
`skills/*/SKILL.md` files, then one row in [`registry.json`](registry.json):

```json
{
  "name": "prediction-markets",
  "version": "1.0.0",
  "path": "plugins/prediction-markets",
  "description": "Prediction-market SDK patterns for Solana Mobile.",
  "license": "MIT"
}
```

Each skill file carries `name`, `description`, `version` (pin exact
dependency lines), `autoAttach`, and `triggers`. Rules: guidance plus code
templates only, no executables; MIT license (root file covers every pack
unless a pack names its own); working starting points under `references/`.
Copy [`plugins/web3-components`](plugins/web3-components) as the reference:
manifest, three skills, three references.

Trust rules the agent enforces: skill bodies load on demand and never
auto-apply rules, file hashes pin every version, updates need approval,
dependencies resolve through the install flow, and everything borrowed
lands in the workspace where it can be read. The full guide lives in the
Talon web app under Docs, Plugins.
