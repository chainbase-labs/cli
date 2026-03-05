# x402 Payment Support Design

## Overview

Add x402 payment protocol support to Chainbase CLI, allowing users to pay per API call ($0.002 USDC) via on-chain micropayments instead of using a traditional API key.

## Background

x402 is an open standard by Coinbase using HTTP 402 Payment Required for automated on-chain micropayments. Chainbase Web3 API supports x402 on all endpoints at `https://api.chainbase.com/v1/`.

## Design Decisions

### Enabling x402 mode
- Global CLI flag `--x402` (per-command)
- Config setting `chainbase config set payment-mode x402` (persistent)
- Flag takes priority over config

### Private key management
- Environment variable `CHAINBASE_PRIVATE_KEY` (highest priority)
- Config file `chainbase config set private-key <key>` (stored at `~/.chainbase/config.json`, file mode 0o600)
- Follows same priority pattern as existing API key resolution

### Scope
- x402 supported on Web3 API endpoints only
- SQL API endpoints (`/query/`, `/execution/`) throw an error in x402 mode: "SQL API does not support x402 payment mode"

### Implementation approach
- Use official `@x402/axios` library with `withPaymentInterceptor` to wrap axios instance
- Use `@x402/evm` + `viem` for EVM signer from private key

## Changes

### New dependencies
- `@x402/axios` — axios interceptor for x402 payment flow
- `@x402/evm` — EVM payment scheme registration
- `viem` — wallet/account utilities (`privateKeyToAccount`)

### `src/config.ts`
- Add `getPrivateKey(): string` — resolves private key from env var or config, throws if missing
- Add `isX402Mode(opts: { x402?: boolean }): boolean` — checks flag then config `payment-mode`

### `src/client.ts`
- New constant: `X402_BASE = 'https://api.chainbase.com/v1'`
- `ChainbaseClient` constructor accepts optional `x402Options?: { privateKey: string }`
- When x402 enabled:
  - Create `x402Client`, register `registerExactEvmScheme` with signer
  - Wrap axios instance with `withPaymentInterceptor`
  - Set `x-api-key: "x402"`
  - Use `X402_BASE` for Web3 API paths
- SQL API paths in x402 mode throw before making request
- `createClient(opts)` reads x402 mode and private key, passes to constructor

### `src/index.ts`
- Add global option: `.option('--x402', 'Enable x402 payment mode', false)`
- No other changes needed — commands already forward global opts to `createClient`

### Command files (`src/commands/*.ts`)
- No changes required

## Testing
- Unit tests for `getPrivateKey` priority (env > config > error)
- Unit tests for `isX402Mode` priority (flag > config)
- Unit tests for SQL API rejection in x402 mode
