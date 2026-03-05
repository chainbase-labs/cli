# Output Format & x402 Payment Info Design

## Overview

Change CLI default output from JSON to human-readable key-value format. Add `--json` flag for machine-parseable output. Show x402 payment transaction details (hash, from, to) when in x402 mode.

## Changes

### 1. Output format flip

- Remove `--pretty` global option
- Add `--json` global option (default false)
- Default: colored key-value pairs (`Key:  Value`) via chalk
- `--json`: raw single-line JSON to stdout

### 2. `formatOutput(data, json)` behavior

- `json=true`: `JSON.stringify(data)` to stdout
- `json=false`: render `data.data` as key-value pairs
  - Primitive values: `Key:  value`
  - Arrays: numbered list or one item per line
  - Nested objects: flatten as `key.subkey: value`
  - Skip metadata fields (`code`, `message`) — only show `data.data`

### 3. `formatError(msg, json)` behavior

- `json=true`: `{"error":"msg"}` to stderr
- `json=false`: `chalk.red('Error: msg')` to stderr (unchanged)

### 4. x402 payment info

- Parse `payment-response` header from axios response using `decodePaymentResponseHeader` from `@x402/axios`
- `ChainbaseClient.request()` returns payment info alongside data when in x402 mode
- Visual mode: display payment block after API result:
  ```
  ── x402 Payment ──
  Tx Hash:   0xfull_hash
  From:      0xfull_address
  To:        0xfull_address
  ```
- JSON mode: append `_x402` field to returned data object

### 5. Command files

All `formatOutput(result, opts.pretty)` calls change to `formatOutput(result, opts.json)`.

### 6. Breaking changes

`--pretty` removed (acceptable at v0.x).
