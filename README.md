# Talon web3-components plugin v1.0.0

Premade Solana Mobile web3 components for builds done with [Talon](https://github.com/Luckyisrael/Talon). MIT licensed.

The Talon agent fetches this repo at build time when a task touches wallets,
balances, or transactions. Nothing here installs into your project on its
own: the agent reads a skill, adapts the pattern to the screen it is
building, and writes the code. Dependencies resolve through Talon's normal
install flow.

## Contents

| Skill | Does | Triggers on |
| --- | --- | --- |
| `web3-connect` | Wallet connect button via Mobile Wallet Adapter | wallet connection, connected account |
| `web3-balance` | Address plus SOL balance with TanStack Query | balances, portfolio headers |
| `web3-send` | Build, sign, and send transactions | signing, on-chain writes |

Working starting points live in `references/`. Pinned SDK lines are in each
skill: `@wallet-ui/react-native-kit` 4.x, `@solana/kit` 6.x.

## Use it in a build

Ask Talon for a wallet screen, a balance header, or an on-chain action. The
agent loads the matching skill itself. State-changing mainnet calls always
get your confirmation in the UI before anything is sent.

## Build your own plugin

A Talon plugin is a public repo with a `talon-plugin.json` manifest plus
`skills/*/SKILL.md` files in this exact front-matter shape (`name`,
`description`, `version`, `autoAttach`, `triggers`). See
[`talon-plugin.json`](talon-plugin.json) and
[`skills/web3-connect/SKILL.md`](skills/web3-connect/SKILL.md) as the
reference. Rules: guidance plus templates only, no executables; pin exact
dependency versions; MIT license at root. Read the full plugin guide in the
Talon docs (Plugins section).
