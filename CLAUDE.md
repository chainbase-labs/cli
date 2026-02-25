# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run build          # Build with tsup (ESM output to dist/)
npm run dev            # Watch mode build
npm test               # Run tests (vitest)
npm run test:watch     # Watch mode tests
npm run lint           # Type-check without emit (tsc --noEmit)
npx vitest run src/__tests__/config.test.ts  # Run a single test file
```

After building, test the CLI directly: `node dist/index.js --help`

## Architecture

This is a TypeScript ESM CLI wrapping the [Chainbase Web3 API](https://docs.chainbase.com/api-reference/overview). Output is JSON by default (for AI agent consumption), with `--pretty` for human-readable format.

### Core Modules

- **`src/index.ts`** — Entry point. Registers all command groups on a Commander program with global options (`--chain`, `--pretty`, `--page`, `--limit`). Wraps execution in async error handler.
- **`src/client.ts`** — `ChainbaseClient` class wrapping axios. Dual base URL routing: paths starting with `/query/` or `/execution/` go to `https://api.chainbase.com/api/v1` (SQL API), everything else goes to `https://api.chainbase.online` (Web3 API). `createClient(opts)` factory resolves API key and chain ID from config/env.
- **`src/config.ts`** — Config file management at `~/.chainbase/config.json`. Priority: `CHAINBASE_API_KEY` env var > config file. Testable via `CHAINBASE_CONFIG_DIR` env var override.
- **`src/output.ts`** — `formatOutput(data, pretty)` writes JSON to stdout. `formatError(msg, pretty)` writes to stderr.
- **`src/types.ts`** — TypeScript interfaces for all API responses.

### Command Pattern

Each file in `src/commands/` exports a `createXxxCommand()` function returning a Commander `Command`. Every command action:
1. Gets global opts via `cmd.parent!.opts()`
2. Calls `createClient(opts)` to get an authenticated client + resolved chain ID
3. Calls `client.get()` or `client.post()` with the API path
4. Outputs via `formatOutput(result, opts.pretty)`

### Command Groups (37 endpoints total)

| Group | File | Subcommands |
|-------|------|-------------|
| config | `commands/config.ts` | set, get, list |
| block | `commands/block.ts` | latest, detail |
| tx | `commands/tx.ts` | detail, list |
| contract | `commands/contract.ts` | call |
| address | `commands/address.ts` | labels |
| token | `commands/token.ts` | metadata, transfers, holders, top-holders, price, price-history |
| nft | `commands/nft.ts` | metadata, collection, collection-items, search, transfers, owner, owners, owner-history, floor-price, price-history, trending, rarity |
| balance | `commands/balance.ts` | native, tokens, portfolios, nfts |
| domain | `commands/domain.ts` | ens, ens-resolve, ens-reverse, spaceid-resolve, spaceid-reverse |
| sql | `commands/sql.ts` | query, execute, status, results |

## Adding a New Command

1. Create `src/commands/yourgroup.ts` exporting `createYourGroupCommand()`
2. Follow the pattern: import `createClient` + `formatOutput`, define subcommands on a `new Command('yourgroup')`
3. Register in `src/index.ts` with `program.addCommand(createYourGroupCommand())`
4. API paths starting with `/query/` or `/execution/` auto-route to the SQL base URL; all others go to Web3 base URL

## Chainbase API Notes

- Auth: `x-api-key` header on all requests
- Chain IDs: 1 (Ethereum), 56 (BSC), 137 (Polygon), 42161 (Arbitrum), 10 (Optimism), 8453 (Base), 43114 (Avalanche), 324 (zkSync)
- Pagination: most list endpoints accept `page` (default 1) and `limit` (1-100, default 20)
- SQL API classic (`/v1/dw/query`) returns max 100k rows, 1k per page, task_id valid for 1 hour
- SQL API alpha (`/query/execute`) is async: execute → poll status → get results
