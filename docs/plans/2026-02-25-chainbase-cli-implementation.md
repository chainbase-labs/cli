# Chainbase CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a TypeScript CLI that wraps all 37 Chainbase public API endpoints, outputting JSON by default for AI agent consumption.

**Architecture:** Commander.js with grouped subcommands. A shared HTTP client (`client.ts`) handles auth and errors. Each command group is a separate file exporting a `Command`. Output defaults to JSON, with `--pretty` for human-readable tables.

**Tech Stack:** TypeScript, Commander.js, axios, chalk, cli-table3, tsup, vitest

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/index.ts` (stub)

**Step 1: Initialize project and install dependencies**

```bash
cd /home/lxcong/projects/chainbase-cli
npm init -y
npm install commander axios chalk cli-table3
npm install -D typescript tsup vitest @types/node @types/cli-table3
```

**Step 2: Write package.json scripts and bin entry**

Edit `package.json` to set:
```json
{
  "name": "chainbase-cli",
  "version": "0.1.0",
  "description": "CLI for Chainbase Web3 API",
  "type": "module",
  "bin": {
    "chainbase": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean",
    "dev": "tsup src/index.ts --format esm --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit"
  },
  "files": ["dist"]
}
```

**Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Write entry point stub**

`src/index.ts`:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('chainbase')
  .description('CLI for Chainbase Web3 API')
  .version('0.1.0');

program.parse();
```

**Step 5: Build and verify**

```bash
npm run build
node dist/index.js --help
```

Expected: Shows help text with name "chainbase".

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: project scaffolding with commander entry point"
```

---

### Task 2: Config Module

**Files:**
- Create: `src/config.ts`
- Create: `src/__tests__/config.test.ts`

**Step 1: Write tests for config module**

`src/__tests__/config.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getConfig, setConfig, listConfig, getApiKey, getConfigDir } from '../config.js';

describe('config', () => {
  let tmpDir: string;
  const originalEnv = process.env;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chainbase-test-'));
    vi.stubEnv('CHAINBASE_CONFIG_DIR', tmpDir);
    vi.stubEnv('CHAINBASE_API_KEY', '');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
    vi.unstubAllEnvs();
  });

  it('sets and gets a config value', () => {
    setConfig('api-key', 'test-key-123');
    expect(getConfig('api-key')).toBe('test-key-123');
  });

  it('returns undefined for missing key', () => {
    expect(getConfig('nonexistent')).toBeUndefined();
  });

  it('lists all config values', () => {
    setConfig('api-key', 'k1');
    setConfig('default-chain', '137');
    expect(listConfig()).toEqual({ 'api-key': 'k1', 'default-chain': '137' });
  });

  it('env var CHAINBASE_API_KEY overrides config file', () => {
    setConfig('api-key', 'from-file');
    vi.stubEnv('CHAINBASE_API_KEY', 'from-env');
    expect(getApiKey()).toBe('from-env');
  });

  it('falls back to config file when env var is empty', () => {
    setConfig('api-key', 'from-file');
    vi.stubEnv('CHAINBASE_API_KEY', '');
    expect(getApiKey()).toBe('from-file');
  });

  it('throws when no api key is configured', () => {
    expect(() => getApiKey()).toThrow();
  });
});
```

**Step 2: Run tests — verify they fail**

```bash
npx vitest run src/__tests__/config.test.ts
```

Expected: FAIL (module not found).

**Step 3: Implement config module**

`src/config.ts`:
```typescript
import fs from 'fs';
import path from 'path';
import os from 'os';

export function getConfigDir(): string {
  return process.env.CHAINBASE_CONFIG_DIR || path.join(os.homedir(), '.chainbase');
}

function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json');
}

function readConfigFile(): Record<string, string> {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function writeConfigFile(config: Record<string, string>): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
}

export function setConfig(key: string, value: string): void {
  const config = readConfigFile();
  config[key] = value;
  writeConfigFile(config);
}

export function getConfig(key: string): string | undefined {
  const config = readConfigFile();
  return config[key];
}

export function listConfig(): Record<string, string> {
  return readConfigFile();
}

export function getApiKey(): string {
  const envKey = process.env.CHAINBASE_API_KEY;
  if (envKey) return envKey;
  const fileKey = getConfig('api-key');
  if (fileKey) return fileKey;
  throw new Error('No API key configured. Run: chainbase config set api-key <your-key>');
}

export function getDefaultChain(): string {
  return getConfig('default-chain') || '1';
}
```

**Step 4: Run tests — verify they pass**

```bash
npx vitest run src/__tests__/config.test.ts
```

Expected: All 6 tests PASS.

**Step 5: Commit**

```bash
git add src/config.ts src/__tests__/config.test.ts && git commit -m "feat: config module with file storage and env var override"
```

---

### Task 3: HTTP Client

**Files:**
- Create: `src/client.ts`
- Create: `src/__tests__/client.test.ts`

**Step 1: Write tests for client**

`src/__tests__/client.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ChainbaseClient } from '../client.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('ChainbaseClient', () => {
  let client: ChainbaseClient;

  beforeEach(() => {
    client = new ChainbaseClient('test-api-key');
    vi.clearAllMocks();
  });

  it('sends GET requests with x-api-key header', async () => {
    mockedAxios.request.mockResolvedValue({ data: { code: 0, data: 'ok' } });
    const result = await client.get('/v1/block/number/latest', { chain_id: 1 });
    expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: 'https://api.chainbase.online/v1/block/number/latest',
      headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }),
      params: { chain_id: 1 },
    }));
    expect(result).toEqual({ code: 0, data: 'ok' });
  });

  it('sends POST requests with JSON body', async () => {
    mockedAxios.request.mockResolvedValue({ data: { code: 0, data: [] } });
    const body = { query: 'SELECT 1' };
    const result = await client.post('/v1/dw/query', body);
    expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      data: body,
    }));
    expect(result).toEqual({ code: 0, data: [] });
  });

  it('uses sql base URL for /query/ and /execution/ paths', async () => {
    mockedAxios.request.mockResolvedValue({ data: { code: 0 } });
    await client.post('/query/execute', { sql: 'SELECT 1' });
    expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://api.chainbase.com/api/v1/query/execute',
    }));
  });

  it('throws descriptive error on non-zero code', async () => {
    mockedAxios.request.mockResolvedValue({ data: { code: 1001, message: 'bad query' } });
    await expect(client.get('/v1/token/price', {})).rejects.toThrow('bad query');
  });

  it('throws on network error', async () => {
    mockedAxios.request.mockRejectedValue(new Error('Network Error'));
    await expect(client.get('/v1/token/price', {})).rejects.toThrow('Network Error');
  });
});
```

**Step 2: Run tests — verify they fail**

```bash
npx vitest run src/__tests__/client.test.ts
```

**Step 3: Implement client**

`src/client.ts`:
```typescript
import axios from 'axios';

const WEB3_BASE = 'https://api.chainbase.online';
const SQL_BASE = 'https://api.chainbase.com/api/v1';

export class ChainbaseClient {
  constructor(private apiKey: string) {}

  private getBaseUrl(path: string): string {
    if (path.startsWith('/query/') || path.startsWith('/execution/')) {
      return SQL_BASE;
    }
    return WEB3_BASE;
  }

  async get(path: string, params: Record<string, unknown>): Promise<unknown> {
    return this.request('GET', path, { params });
  }

  async post(path: string, data: unknown): Promise<unknown> {
    return this.request('POST', path, { data });
  }

  private async request(
    method: string,
    path: string,
    options: { params?: Record<string, unknown>; data?: unknown },
  ): Promise<unknown> {
    const baseUrl = this.getBaseUrl(path);
    const response = await axios.request({
      method,
      url: `${baseUrl}${path}`,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      params: options.params,
      data: options.data,
    });
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body && body.code !== 0) {
      throw new Error(body.message || `API error code: ${body.code}`);
    }
    return body;
  }
}
```

**Step 4: Run tests — verify they pass**

```bash
npx vitest run src/__tests__/client.test.ts
```

**Step 5: Commit**

```bash
git add src/client.ts src/__tests__/client.test.ts && git commit -m "feat: HTTP client with dual base URL and error handling"
```

---

### Task 4: Output Module

**Files:**
- Create: `src/output.ts`
- Create: `src/__tests__/output.test.ts`

**Step 1: Write tests**

`src/__tests__/output.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatOutput } from '../output.js';

describe('output', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('outputs compact JSON by default', () => {
    formatOutput({ price: 1234.56 }, false);
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(JSON.parse(output)).toEqual({ price: 1234.56 });
    expect(output).not.toContain('\n  '); // not indented
  });

  it('outputs indented JSON with pretty flag', () => {
    formatOutput({ price: 1234.56 }, true);
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain('\n  '); // indented
  });
});
```

**Step 2: Implement output module**

`src/output.ts`:
```typescript
import chalk from 'chalk';

export function formatOutput(data: unknown, pretty: boolean): void {
  if (pretty) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  } else {
    process.stdout.write(JSON.stringify(data) + '\n');
  }
}

export function formatError(message: string, pretty: boolean): void {
  const error = { error: message };
  if (pretty) {
    process.stderr.write(chalk.red(`Error: ${message}`) + '\n');
  } else {
    process.stderr.write(JSON.stringify(error) + '\n');
  }
}
```

**Step 3: Run tests — verify they pass**

```bash
npx vitest run src/__tests__/output.test.ts
```

**Step 4: Commit**

```bash
git add src/output.ts src/__tests__/output.test.ts && git commit -m "feat: output formatting module (JSON default, pretty optional)"
```

---

### Task 5: Types

**Files:**
- Create: `src/types.ts`

**Step 1: Write API response types**

`src/types.ts` — define interfaces for all API responses. Key types:

```typescript
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  next_page?: number;
  count?: number;
}

// Token types
export interface TokenMetadata { contract_address: string; name: string; symbol: string; decimals: number; total_supply: string; logos: string[]; urls: string[]; current_usd_price: number; }
export interface TokenTransfer { block_number: number; block_timestamp: string; transaction_hash: string; from_address: string; to_address: string; value: string; }
export interface TokenPrice { price: number; symbol: string; decimals: number; updated_at: string; }
export interface TokenHolder { wallet_address: string; original_amount: string; amount: string; usd_value: string; }

// NFT types
export interface NftMetadata { contract_address: string; token_id: string; name: string; description: string; image_uri: string; traits: unknown[]; }
export interface NftCollection { contract_address: string; name: string; symbol: string; description: string; banner_image_url: string; image_url: string; total: number; floor_price: number; }
export interface NftOwner { wallet_address: string; token_id: string; }
export interface NftFloorPrice { floor_price: number; symbol: string; }
export interface NftTrending { contract_address: string; name: string; volume: number; sales: number; floor_price: number; }

// Balance types
export interface NativeBalance { balance: string; }
export interface TokenBalance { contract_address: string; name: string; symbol: string; decimals: number; balance: string; current_usd_price: number; }
export interface Portfolio { protocol: string; chain: string; positions: unknown[]; }

// Domain types
export interface EnsDomain { name: string; address: string; registrant: string; owner: string; resolver: string; }
export interface EnsRecord { name: string; address: string; text_records: Record<string, string>; }

// Block/Tx types
export interface BlockDetail { number: number; hash: string; timestamp: number; transactions_count: number; miner: string; gas_used: number; gas_limit: number; }
export interface TxDetail { hash: string; block_number: number; from_address: string; to_address: string; value: string; gas: number; gas_price: string; status: number; }
export interface AddressLabel { address: string; labels: string[]; }

// SQL types
export interface SqlQueryResult { task_id: string; rows: unknown[]; total_count: number; }
export interface SqlExecutionStatus { executionId: string; status: string; progress: number; submittedAt: string; expiresAt: string; }
```

**Step 2: Commit**

```bash
git add src/types.ts && git commit -m "feat: API response type definitions"
```

---

### Task 6: Config Command

**Files:**
- Create: `src/commands/config.ts`

**Step 1: Implement config command**

`src/commands/config.ts`:
```typescript
import { Command } from 'commander';
import { setConfig, getConfig, listConfig } from '../config.js';
import { formatOutput } from '../output.js';

export function createConfigCommand(): Command {
  const cmd = new Command('config').description('Manage CLI configuration');

  cmd
    .command('set <key> <value>')
    .description('Set a config value (api-key, default-chain)')
    .action((key: string, value: string) => {
      setConfig(key, value);
      const pretty = cmd.parent?.opts().pretty ?? false;
      formatOutput({ status: 'ok', key, value: key === 'api-key' ? '***' : value }, pretty);
    });

  cmd
    .command('get <key>')
    .description('Get a config value')
    .action((key: string) => {
      const pretty = cmd.parent?.opts().pretty ?? false;
      const value = getConfig(key);
      formatOutput({ key, value: value ?? null }, pretty);
    });

  cmd
    .command('list')
    .description('List all config values')
    .action(() => {
      const pretty = cmd.parent?.opts().pretty ?? false;
      const config = listConfig();
      // Mask api-key in output
      const safe = { ...config };
      if (safe['api-key']) safe['api-key'] = '***' + safe['api-key'].slice(-4);
      formatOutput(safe, pretty);
    });

  return cmd;
}
```

**Step 2: Commit**

```bash
git add src/commands/config.ts && git commit -m "feat: config command (set/get/list)"
```

---

### Task 7: Command Helper & Block/Tx/Contract/Address Commands

**Files:**
- Create: `src/commands/block.ts`
- Create: `src/commands/tx.ts`
- Create: `src/commands/contract.ts`
- Create: `src/commands/address.ts`

Each command follows the same pattern: create a `Command`, add subcommands, each subcommand resolves chain + apiKey, calls `client.get()`/`client.post()`, then `formatOutput()`.

**Step 1: Create a shared helper for resolving options**

Add to `src/client.ts` a factory function:
```typescript
import { getApiKey, getDefaultChain } from './config.js';

export function createClient(opts: { chain?: string }): { client: ChainbaseClient; chainId: string } {
  const apiKey = getApiKey();
  const chainId = opts.chain || getDefaultChain();
  return { client: new ChainbaseClient(apiKey), chainId };
}
```

**Step 2: Implement block command**

`src/commands/block.ts`:
```typescript
import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createBlockCommand(): Command {
  const cmd = new Command('block').description('Block queries');

  cmd
    .command('latest')
    .description('Get latest block number')
    .action(async () => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/block/number/latest', { chain_id: chainId });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('detail <number>')
    .description('Get block by number')
    .action(async (number: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/block/detail', { chain_id: chainId, number });
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
```

**Step 3: Implement tx command** — same pattern with `/v1/tx/detail` (hash param) and `/v1/account/txs` (address + pagination).

**Step 4: Implement contract command** — POST to `/v1/contract/call` with `--address`, `--function`, `--abi`, `--params` flags.

**Step 5: Implement address command** — GET `/v1/address/labels` with address arg.

**Step 6: Build and smoke-test**

```bash
npm run build && node dist/index.js block --help
```

**Step 7: Commit**

```bash
git add src/commands/block.ts src/commands/tx.ts src/commands/contract.ts src/commands/address.ts src/client.ts && git commit -m "feat: block, tx, contract, address commands"
```

---

### Task 8: Token Commands

**Files:**
- Create: `src/commands/token.ts`

**Step 1: Implement all 6 token subcommands**

Endpoints:
- `token metadata <contract>` → GET `/v1/token/metadata` (chain_id, contract_address)
- `token transfers` → GET `/v1/token/transfers` (chain_id, optional contract_address/address + pagination + block/time filters)
- `token holders <contract>` → GET `/v1/token/holders` (chain_id, contract_address + pagination)
- `token top-holders <contract>` → GET `/v1/token/top-holders` (chain_id, contract_address + pagination)
- `token price <contract>` → GET `/v1/token/price` (chain_id, contract_address)
- `token price-history <contract>` → GET `/v1/token/price/history` (chain_id, contract_address, from_timestamp, end_timestamp)

For `transfers`: add `--address`, `--from-block`, `--to-block`, `--from-timestamp`, `--end-timestamp` flags.
For `price-history`: add `--from <timestamp>` and `--to <timestamp>` required flags.
All paginated commands get `--page` and `--limit` from global opts.

**Step 2: Build and test**

```bash
npm run build && node dist/index.js token --help
```

**Step 3: Commit**

```bash
git add src/commands/token.ts && git commit -m "feat: token commands (metadata, transfers, holders, price)"
```

---

### Task 9: NFT Commands

**Files:**
- Create: `src/commands/nft.ts`

**Step 1: Implement all 12 NFT subcommands**

Endpoints:
- `nft metadata <contract> <token_id>` → GET `/v1/nft/metadata`
- `nft collection <contract>` → GET `/v1/nft/collection`
- `nft collection-items <contract>` → GET `/v1/nft/collection/items` + pagination
- `nft search <name>` → GET `/v1/nft/search` (chain_id, name, optional contract_address + pagination)
- `nft transfers` → GET `/v1/nft/transfers` (optional contract_address, token_id, address + block/time filters + pagination)
- `nft owner <contract> <token_id>` → GET `/v1/nft/owner`
- `nft owners <contract>` → GET `/v1/nft/owners` + pagination
- `nft owner-history <contract> <token_id>` → GET `/v1/nft/owner/history` + block/time filters + pagination
- `nft floor-price <contract>` → GET `/v1/nft/floor_price`
- `nft price-history <contract>` → GET `/v1/nft/price/history` (from_timestamp, end_timestamp)
- `nft trending` → GET `/v1/nft/collection/trending` (optional --range, --exchange, --sort + pagination)
- `nft rarity <contract>` → GET `/v1/nft/rarity` (optional token_id, rank_min, rank_max + pagination)

**Step 2: Build and test**

```bash
npm run build && node dist/index.js nft --help
```

**Step 3: Commit**

```bash
git add src/commands/nft.ts && git commit -m "feat: nft commands (12 subcommands)"
```

---

### Task 10: Balance Commands

**Files:**
- Create: `src/commands/balance.ts`

**Step 1: Implement 4 balance subcommands**

- `balance native <address>` → GET `/v1/account/balance` (chain_id, address, optional --to-block)
- `balance tokens <address>` → GET `/v1/account/tokens` (chain_id, address, optional --contract + pagination)
- `balance portfolios <address>` → GET `/v1/account/portfolios` (address, optional --chain repeatable)
- `balance nfts <address>` → GET `/v1/account/nfts` (chain_id, address, optional --contract + pagination)

**Step 2: Commit**

```bash
git add src/commands/balance.ts && git commit -m "feat: balance commands (native, tokens, portfolios, nfts)"
```

---

### Task 11: Domain Commands

**Files:**
- Create: `src/commands/domain.ts`

**Step 1: Implement 5 domain subcommands**

- `domain ens <address>` → GET `/v1/account/ens`
- `domain ens-resolve <domain>` → GET `/v1/ens/records`
- `domain ens-reverse <address>` → GET `/v1/ens/reverse`
- `domain spaceid-resolve <domain>` → GET `/v1/space-id/records`
- `domain spaceid-reverse <address>` → GET `/v1/space-id/reverse`

All take `--to-block` optional flag.

**Step 2: Commit**

```bash
git add src/commands/domain.ts && git commit -m "feat: domain commands (ENS + Space ID)"
```

---

### Task 12: SQL Commands

**Files:**
- Create: `src/commands/sql.ts`

**Step 1: Implement 4 SQL subcommands**

- `sql query <sql>` → POST `/v1/dw/query` (body: { query }). Supports `--task-id` for pagination.
- `sql execute <sql>` → POST `/query/execute` (body: { sql }). Uses SQL_BASE.
- `sql status <execution_id>` → GET `/execution/{id}/status`. Uses SQL_BASE.
- `sql results <execution_id>` → GET `/execution/{id}/results`. Uses SQL_BASE.

Note: `query` goes to `api.chainbase.online`, while `execute/status/results` go to `api.chainbase.com/api/v1`.

**Step 2: Commit**

```bash
git add src/commands/sql.ts && git commit -m "feat: sql commands (query, execute, status, results)"
```

---

### Task 13: Wire Up Entry Point & Error Handling

**Files:**
- Modify: `src/index.ts`

**Step 1: Register all command groups and add global options + error handling**

`src/index.ts`:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { createConfigCommand } from './commands/config.js';
import { createBlockCommand } from './commands/block.js';
import { createTxCommand } from './commands/tx.js';
import { createContractCommand } from './commands/contract.js';
import { createAddressCommand } from './commands/address.js';
import { createTokenCommand } from './commands/token.js';
import { createNftCommand } from './commands/nft.js';
import { createBalanceCommand } from './commands/balance.js';
import { createDomainCommand } from './commands/domain.js';
import { createSqlCommand } from './commands/sql.js';
import { formatError } from './output.js';

const program = new Command();

program
  .name('chainbase')
  .description('CLI for Chainbase Web3 API')
  .version('0.1.0')
  .option('--chain <id>', 'Chain ID (default: from config or 1)')
  .option('--pretty', 'Pretty-print output for humans', false)
  .option('--page <n>', 'Page number', '1')
  .option('--limit <n>', 'Results per page', '20');

program.addCommand(createConfigCommand());
program.addCommand(createBlockCommand());
program.addCommand(createTxCommand());
program.addCommand(createContractCommand());
program.addCommand(createAddressCommand());
program.addCommand(createTokenCommand());
program.addCommand(createNftCommand());
program.addCommand(createBalanceCommand());
program.addCommand(createDomainCommand());
program.addCommand(createSqlCommand());

// Global error handler
const originalParse = program.parseAsync.bind(program);
program.parseAsync = async (argv?: string[]) => {
  try {
    return await originalParse(argv);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    formatError(message, program.opts().pretty);
    process.exit(1);
  }
};

program.parseAsync();
```

**Step 2: Build and full smoke-test**

```bash
npm run build
node dist/index.js --help
node dist/index.js token --help
node dist/index.js nft --help
node dist/index.js sql --help
```

**Step 3: Commit**

```bash
git add src/index.ts && git commit -m "feat: wire up all commands with global options and error handling"
```

---

### Task 14: CLAUDE.md & Final Polish

**Files:**
- Create: `CLAUDE.md`
- Create: `.gitignore`

**Step 1: Write .gitignore**

```
node_modules/
dist/
*.tgz
```

**Step 2: Write CLAUDE.md**

Document build commands, architecture, how to add new commands.

**Step 3: Full test suite + build**

```bash
npm test && npm run build && npm run lint
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: CLAUDE.md, .gitignore, final polish"
```
