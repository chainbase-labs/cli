# Chainbase CLI Design

## Overview

A TypeScript CLI tool wrapping Chainbase's public Web3 API, designed for both human use and AI agent control.

## Decisions

- **Language:** TypeScript (Node.js)
- **CLI framework:** Commander.js
- **Output:** Default JSON, `--pretty` flag for human-readable format (chalk + cli-table3)
- **Command structure:** Grouped subcommands (`chainbase <group> <action> [args]`)
- **Auth:** Config file (`~/.chainbase/config.json`) + `CHAINBASE_API_KEY` env var override
- **Scope:** All 37 API endpoints in initial release

## API Coverage

| Group | Endpoints | Base URL |
|-------|-----------|----------|
| block | latest, detail | `https://api.chainbase.online` |
| tx | detail, list | `https://api.chainbase.online` |
| contract | call | `https://api.chainbase.online` |
| address | labels | `https://api.chainbase.online` |
| token | metadata, transfers, holders, top-holders, price, price-history | `https://api.chainbase.online` |
| nft | metadata, collection, collection-items, search, transfers, owner, owners, owner-history, floor-price, price-history, trending, rarity | `https://api.chainbase.online` |
| balance | native, tokens, portfolios, nfts | `https://api.chainbase.online` |
| domain | ens, ens-resolve, ens-reverse, spaceid-resolve, spaceid-reverse | `https://api.chainbase.online` |
| sql | query, execute, status, results | `https://api.chainbase.com/api/v1` |
| config | set, get, list | local only |

## Command Structure

```
chainbase config set <key> <value>
chainbase config get <key>
chainbase config list

chainbase block latest
chainbase block detail <number>

chainbase tx detail <hash>
chainbase tx list <address>

chainbase contract call (interactive flags)
chainbase address labels <address>

chainbase token metadata <contract>
chainbase token transfers <contract>
chainbase token holders <contract>
chainbase token top-holders <contract>
chainbase token price <contract>
chainbase token price-history <contract>

chainbase nft metadata <contract> <token_id>
chainbase nft collection <contract>
chainbase nft collection-items <contract>
chainbase nft search <name>
chainbase nft transfers <contract>
chainbase nft owner <contract> <token_id>
chainbase nft owners <contract>
chainbase nft owner-history <contract> <token_id>
chainbase nft floor-price <contract>
chainbase nft price-history <contract>
chainbase nft trending
chainbase nft rarity <contract>

chainbase balance native <address>
chainbase balance tokens <address>
chainbase balance portfolios <address>
chainbase balance nfts <address>

chainbase domain ens <address>
chainbase domain ens-resolve <domain>
chainbase domain ens-reverse <address>
chainbase domain spaceid-resolve <domain>
chainbase domain spaceid-reverse <address>

chainbase sql query <sql>
chainbase sql execute <sql>
chainbase sql status <execution_id>
chainbase sql results <execution_id>
```

Global flags: `--chain <id>` (default: 1), `--pretty`, `--page <n>`, `--limit <n>`

## Project Structure

```
src/
├── index.ts          # Entry point, register all command groups
├── client.ts         # HTTP client (axios, auth, error handling)
├── config.ts         # Config management (~/.chainbase/config.json)
├── output.ts         # Output formatting (JSON / pretty)
├── commands/
│   ├── config.ts
│   ├── block.ts
│   ├── tx.ts
│   ├── contract.ts
│   ├── address.ts
│   ├── token.ts
│   ├── nft.ts
│   ├── balance.ts
│   ├── domain.ts
│   └── sql.ts
└── types.ts          # API response type definitions
```

## Key Design

- `client.ts` injects `x-api-key`, handles error codes, provides typed methods
- `output.ts` controls formatting: raw JSON by default, `--pretty` for tables/colors
- Each command file exports a Commander `Command`, registered in `index.ts`
- Config priority: env var `CHAINBASE_API_KEY` > config file > error
- Default chain configurable via `chainbase config set default-chain 1`

## Dependencies

| Package | Purpose |
|---------|---------|
| commander | CLI framework |
| axios | HTTP client |
| chalk | Colored output (pretty mode) |
| cli-table3 | Table output (pretty mode) |
| typescript | Dev dependency |
| tsup | Build/bundle |
