# Chainbase CLI

A command-line interface for the [Chainbase Web3 API](https://docs.chainbase.com/api-reference/overview). Designed for both human use and AI agent automation — outputs JSON by default, with an optional `--pretty` flag for human-readable format.

## Install

```bash
npm install -g chainbase-cli
```

Or run directly with npx:

```bash
npx chainbase-cli --help
```

## Quick Start

```bash
# Set your API key (get one at https://platform.chainbase.com)
chainbase config set api-key YOUR_API_KEY

# Get latest Ethereum block number
chainbase block latest

# Get USDT price
chainbase token price 0xdac17f958d2ee523a2206206994597c13d831ec7

# Resolve ENS domain
chainbase domain ens-resolve vitalik.eth

# Query on BSC (chain ID 56)
chainbase token price 0x55d398326f99059fF775485246999027B3197955 --chain 56
```

## Global Options

| Option | Description | Default |
|--------|-------------|---------|
| `--chain <id>` | Chain ID | `1` (Ethereum) |
| `--pretty` | Human-readable output | `false` |
| `--page <n>` | Page number | `1` |
| `--limit <n>` | Results per page | `20` |

## Commands

### `config` — Configuration

```bash
chainbase config set api-key <key>      # Set API key
chainbase config set default-chain 137  # Set default chain to Polygon
chainbase config get api-key            # Get a config value
chainbase config list                   # List all config
```

### `block` — Block Queries

```bash
chainbase block latest                  # Latest block number
chainbase block detail 20000000         # Block details by number
```

### `tx` — Transaction Queries

```bash
chainbase tx detail <hash>                        # Transaction by hash
chainbase tx list <address>                        # Account transactions
chainbase tx list <address> --from-block 20000000  # With block range filter
```

### `token` — Token Queries

```bash
chainbase token metadata <contract>                # Token metadata
chainbase token price <contract>                   # Current price
chainbase token price-history <contract> --from <ts> --to <ts>  # Price history
chainbase token holders <contract>                 # All holders
chainbase token top-holders <contract>             # Top holders
chainbase token transfers --contract <addr>        # Transfer history
```

### `nft` — NFT Queries

```bash
chainbase nft metadata <contract> <token_id>       # NFT metadata
chainbase nft collection <contract>                # Collection info
chainbase nft collection-items <contract>          # Items in collection
chainbase nft search "Bored Ape"                   # Search by name
chainbase nft owner <contract> <token_id>          # Current owner
chainbase nft owners <contract>                    # All owners
chainbase nft owner-history <contract> <token_id>  # Owner history
chainbase nft transfers --contract <addr>          # Transfer history
chainbase nft floor-price <contract>               # Floor price
chainbase nft price-history <contract> --from <ts> --to <ts>  # Price history
chainbase nft trending                             # Trending collections
chainbase nft rarity <contract>                    # Rarity scores
```

### `balance` — Balance & Portfolio

```bash
chainbase balance native <address>                 # Native token balance (ETH, BNB, etc.)
chainbase balance tokens <address>                 # ERC20 token balances
chainbase balance nfts <address>                   # NFTs owned
chainbase balance portfolios <address>             # DeFi positions
chainbase balance portfolios <address> --chains 1,137  # Filter by chains
```

### `domain` — ENS & Space ID

```bash
chainbase domain ens <address>                     # ENS domains held by address
chainbase domain ens-resolve vitalik.eth           # Resolve ENS → address
chainbase domain ens-reverse <address>             # Reverse resolve address → ENS
chainbase domain spaceid-resolve <domain>          # Resolve Space ID (BSC)
chainbase domain spaceid-reverse <address>         # Reverse resolve Space ID
```

### `contract` — Smart Contract

```bash
chainbase contract call \
  --address <contract> \
  --function "balanceOf" \
  --abi '[...]' \
  --params '["0x..."]'
```

### `sql` — SQL Queries

```bash
chainbase sql execute "SELECT number FROM ethereum.blocks LIMIT 5"  # Execute async query
chainbase sql status <execution_id>                                 # Check status
chainbase sql results <execution_id>                                # Get results
```

## Supported Chains

| Chain | ID | Chain | ID |
|-------|----|-------|----|
| Ethereum | `1` | Arbitrum | `42161` |
| BSC | `56` | Optimism | `10` |
| Polygon | `137` | Base | `8453` |
| Avalanche | `43114` | zkSync | `324` |

## Authentication

Get your free API key at [Chainbase Platform](https://platform.chainbase.com):

1. Sign up / log in at https://platform.chainbase.com
2. Navigate to the **API Keys** section in the dashboard
3. Create a new API key and copy it

The API key can be configured in two ways (in priority order):

1. **Environment variable**: `CHAINBASE_API_KEY=xxx chainbase block latest`
2. **Config file**: `chainbase config set api-key xxx` (stored at `~/.chainbase/config.json`, mode 0600)

## For AI Agents

This CLI is designed to be controlled by AI agents. Key features:

- **JSON output by default** — machine-parseable, no colors or formatting
- **Consistent error format** — errors output as `{"error":"message"}` to stderr
- **Discoverable** — `chainbase --help` and `chainbase <command> --help` list all available commands
- **Predictable** — every command follows the same pattern: `chainbase <group> <action> [args] [options]`

Example agent usage:

```bash
# Parse output directly
PRICE=$(chainbase token price 0xdac17f958d2ee523a2206206994597c13d831ec7 | jq '.data.price')

# Check if command succeeded
if chainbase balance native 0x... 2>/dev/null; then
  echo "Success"
fi
```

## Development

```bash
git clone https://github.com/chainbase-labs/cli.git
cd cli
npm install
npm run build      # Build
npm test           # Run tests
npm run lint       # Type-check
npm link           # Install globally for local dev
```

## License

ISC
