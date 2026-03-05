# x402 Payment Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add x402 micropayment support to Chainbase CLI so users can pay per API call with USDC instead of using a traditional API key.

**Architecture:** Extend `config.ts` with private key resolution and x402 mode detection. Refactor `ChainbaseClient` to use an axios instance (currently uses static `axios.request`), then conditionally wrap it with `@x402/axios` interceptor. Add `--x402` global flag to CLI entry point.

**Tech Stack:** `@x402/axios`, `@x402/evm`, `viem`, TypeScript, vitest

---

### Task 1: Install dependencies

**Step 1: Install x402 and viem packages**

Run: `npm install @x402/axios @x402/evm viem`

**Step 2: Verify installation**

Run: `npm ls @x402/axios @x402/evm viem`
Expected: All three packages listed without errors

**Step 3: Verify build still works**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add x402 and viem dependencies"
```

---

### Task 2: Add `getPrivateKey()` and `isX402Mode()` to config

**Files:**
- Modify: `src/config.ts`
- Test: `src/__tests__/config.test.ts`

**Step 1: Write failing tests**

Add to `src/__tests__/config.test.ts`:

```typescript
import { getConfig, setConfig, listConfig, getApiKey, getConfigDir, getPrivateKey, isX402Mode } from '../config.js';

// Inside the existing describe('config', () => { ... }) block, add:

  describe('getPrivateKey', () => {
    it('returns env var CHAINBASE_PRIVATE_KEY when set', () => {
      vi.stubEnv('CHAINBASE_PRIVATE_KEY', '0xabc123');
      expect(getPrivateKey()).toBe('0xabc123');
    });

    it('falls back to config file when env var is empty', () => {
      vi.stubEnv('CHAINBASE_PRIVATE_KEY', '');
      setConfig('private-key', '0xfromfile');
      expect(getPrivateKey()).toBe('0xfromfile');
    });

    it('throws when no private key is configured', () => {
      expect(() => getPrivateKey()).toThrow('No private key configured');
    });
  });

  describe('isX402Mode', () => {
    it('returns true when flag is true', () => {
      expect(isX402Mode({ x402: true })).toBe(true);
    });

    it('returns false when flag is false and no config', () => {
      expect(isX402Mode({ x402: false })).toBe(false);
    });

    it('returns false when flag is undefined and no config', () => {
      expect(isX402Mode({})).toBe(false);
    });

    it('returns true when flag is undefined but config is x402', () => {
      setConfig('payment-mode', 'x402');
      expect(isX402Mode({})).toBe(true);
    });

    it('flag false overrides config x402', () => {
      setConfig('payment-mode', 'x402');
      expect(isX402Mode({ x402: false })).toBe(false);
    });
  });
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/config.test.ts`
Expected: FAIL — `getPrivateKey` and `isX402Mode` are not exported

**Step 3: Implement in `src/config.ts`**

Add at the end of `src/config.ts`:

```typescript
export function getPrivateKey(): string {
  const envKey = process.env.CHAINBASE_PRIVATE_KEY;
  if (envKey) return envKey;
  const fileKey = getConfig('private-key');
  if (fileKey) return fileKey;
  throw new Error(
    'No private key configured. Run: chainbase config set private-key <your-key>\nOr set CHAINBASE_PRIVATE_KEY environment variable.',
  );
}

export function isX402Mode(opts: { x402?: boolean }): boolean {
  if (opts.x402 !== undefined) return opts.x402;
  return getConfig('payment-mode') === 'x402';
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/config.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/config.ts src/__tests__/config.test.ts
git commit -m "feat: add getPrivateKey and isX402Mode to config"
```

---

### Task 3: Refactor `ChainbaseClient` to use axios instance and add x402 support

**Files:**
- Modify: `src/client.ts`
- Modify: `src/__tests__/client.test.ts`

**Step 1: Write failing tests for x402 mode**

Replace `src/__tests__/client.test.ts` entirely:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ChainbaseClient } from '../client.js';

vi.mock('axios', () => {
  const mockInstance = {
    request: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      request: vi.fn(),
    },
  };
});

vi.mock('@x402/axios', () => ({
  x402Client: vi.fn(() => ({})),
  withPaymentInterceptor: vi.fn((instance: unknown) => instance),
}));

vi.mock('@x402/evm/exact/client', () => ({
  registerExactEvmScheme: vi.fn(),
}));

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn((key: string) => ({ address: '0xmock', source: key })),
}));

const mockedAxios = vi.mocked(axios, { deep: true });

function getMockInstance() {
  return mockedAxios.create.mock.results[0]?.value;
}

describe('ChainbaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('standard mode', () => {
    let client: ChainbaseClient;

    beforeEach(() => {
      client = new ChainbaseClient('test-api-key');
    });

    it('creates axios instance', () => {
      expect(mockedAxios.create).toHaveBeenCalled();
    });

    it('sends GET requests with x-api-key header', async () => {
      const mock = getMockInstance();
      mock.request.mockResolvedValue({ data: { code: 0, data: 'ok' } });
      const result = await client.get('/v1/block/number/latest', { chain_id: 1 });
      expect(mock.request).toHaveBeenCalledWith(expect.objectContaining({
        method: 'GET',
        url: 'https://api.chainbase.online/v1/block/number/latest',
        headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }),
        params: { chain_id: 1 },
      }));
      expect(result).toEqual({ code: 0, data: 'ok' });
    });

    it('sends POST requests with JSON body', async () => {
      const mock = getMockInstance();
      mock.request.mockResolvedValue({ data: { code: 0, data: [] } });
      const body = { query: 'SELECT 1' };
      const result = await client.post('/v1/dw/query', body);
      expect(mock.request).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        data: body,
      }));
      expect(result).toEqual({ code: 0, data: [] });
    });

    it('uses sql base URL for /query/ and /execution/ paths', async () => {
      const mock = getMockInstance();
      mock.request.mockResolvedValue({ data: { code: 0 } });
      await client.post('/query/execute', { sql: 'SELECT 1' });
      expect(mock.request).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://api.chainbase.com/api/v1/query/execute',
      }));
    });

    it('throws descriptive error on non-zero code', async () => {
      const mock = getMockInstance();
      mock.request.mockResolvedValue({ data: { code: 1001, message: 'bad query' } });
      await expect(client.get('/v1/token/price', {})).rejects.toThrow('bad query');
    });

    it('throws on network error', async () => {
      const mock = getMockInstance();
      mock.request.mockRejectedValue(new Error('Network Error'));
      await expect(client.get('/v1/token/price', {})).rejects.toThrow('Network Error');
    });
  });

  describe('x402 mode', () => {
    let client: ChainbaseClient;

    beforeEach(() => {
      client = new ChainbaseClient('ignored', { privateKey: '0xdeadbeef' });
    });

    it('wraps axios instance with payment interceptor', async () => {
      const { withPaymentInterceptor } = await import('@x402/axios');
      expect(withPaymentInterceptor).toHaveBeenCalled();
    });

    it('registers exact EVM scheme', async () => {
      const { registerExactEvmScheme } = await import('@x402/evm/exact/client');
      expect(registerExactEvmScheme).toHaveBeenCalled();
    });

    it('uses x402 base URL for web3 API paths', async () => {
      const mock = getMockInstance();
      mock.request.mockResolvedValue({ data: { code: 0, data: 'ok' } });
      await client.get('/v1/token/price', { chain_id: 1 });
      expect(mock.request).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://api.chainbase.com/v1/v1/token/price',
        headers: expect.objectContaining({ 'x-api-key': 'x402' }),
      }));
    });

    it('throws error for SQL API paths', async () => {
      await expect(client.post('/query/execute', { sql: 'SELECT 1' }))
        .rejects.toThrow('SQL API does not support x402 payment mode');
      await expect(client.get('/execution/status', { task_id: '123' }))
        .rejects.toThrow('SQL API does not support x402 payment mode');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/client.test.ts`
Expected: FAIL — `ChainbaseClient` doesn't accept x402Options yet

**Step 3: Implement x402 support in `src/client.ts`**

Replace `src/client.ts` entirely:

```typescript
import axios, { type AxiosInstance } from 'axios';
import { getApiKey, getDefaultChain, getPrivateKey, isX402Mode } from './config.js';

const WEB3_BASE = 'https://api.chainbase.online';
const SQL_BASE = 'https://api.chainbase.com/api/v1';
const X402_BASE = 'https://api.chainbase.com/v1';

interface X402Options {
  privateKey: string;
}

export class ChainbaseClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private x402Enabled: boolean;

  constructor(apiKey: string, x402Options?: X402Options) {
    this.apiKey = apiKey;
    this.x402Enabled = !!x402Options;
    this.axiosInstance = axios.create();

    if (x402Options) {
      this.apiKey = 'x402';
      this.setupX402(x402Options.privateKey);
    }
  }

  private setupX402(privateKey: string): void {
    const { privateKeyToAccount } = require('viem/accounts');
    const { x402Client, withPaymentInterceptor } = require('@x402/axios');
    const { registerExactEvmScheme } = require('@x402/evm/exact/client');

    const signer = privateKeyToAccount(privateKey as `0x${string}`);
    const client = new x402Client();
    registerExactEvmScheme(client, { signer });
    this.axiosInstance = withPaymentInterceptor(this.axiosInstance, client);
  }

  private getBaseUrl(path: string): string {
    if (path.startsWith('/query/') || path.startsWith('/execution/')) {
      if (this.x402Enabled) {
        throw new Error('SQL API does not support x402 payment mode');
      }
      return SQL_BASE;
    }
    return this.x402Enabled ? X402_BASE : WEB3_BASE;
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
    const response = await this.axiosInstance.request({
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
    if (body && typeof body === 'object' && 'code' in body && body.code !== 0 && body.code !== 200) {
      throw new Error(body.message || `API error code: ${body.code}`);
    }
    return body;
  }
}

export function createClient(opts: { chain?: string; x402?: boolean }): {
  client: ChainbaseClient;
  chainId: string;
} {
  const chainId = opts.chain || getDefaultChain();
  if (isX402Mode(opts)) {
    const privateKey = getPrivateKey();
    const client = new ChainbaseClient('x402', { privateKey });
    return { client, chainId };
  }
  const apiKey = getApiKey();
  return { client: new ChainbaseClient(apiKey), chainId };
}
```

> **Note:** Using `require()` for dynamic imports of x402/viem in `setupX402` so the modules are only loaded when x402 mode is active. This is ESM-compatible via tsup bundling. If it causes issues, switch to top-level `import` statements instead.

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/client.test.ts`
Expected: All tests PASS

**Step 5: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add src/client.ts src/__tests__/client.test.ts
git commit -m "feat: add x402 payment support to ChainbaseClient"
```

---

### Task 4: Add `--x402` global flag to CLI entry point

**Files:**
- Modify: `src/index.ts`

**Step 1: Add `--x402` option**

Add after the `--limit` option line in `src/index.ts`:

```typescript
  .option('--x402', 'Enable x402 payment mode', false)
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Verify help output**

Run: `node dist/index.js --help`
Expected: Output includes `--x402` option in the help text

**Step 4: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: add --x402 global CLI flag"
```

---

### Task 5: Verify build and fix dynamic import if needed

**Step 1: Build the project**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Test CLI help**

Run: `node dist/index.js --help`
Expected: Shows `--x402` option

**Step 3: Test x402 error without private key**

Run: `node dist/index.js --x402 token price 0xdac17f958d2ee523a2206206994597c13d831ec7`
Expected: Error message about missing private key

**Step 4: Test SQL API rejection in x402 mode**

Run: `CHAINBASE_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001 node dist/index.js --x402 sql query "SELECT 1"`
Expected: Error message "SQL API does not support x402 payment mode"

**Step 5: If dynamic `require()` fails in ESM, switch to top-level imports**

If step 1-4 reveal issues with `require()` in ESM context, replace `setupX402` to use top-level static imports:

In `src/client.ts`, change to:

```typescript
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client, withPaymentInterceptor } from '@x402/axios';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
```

And update `setupX402`:

```typescript
private setupX402(privateKey: string): void {
  const signer = privateKeyToAccount(privateKey as `0x${string}`);
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });
  this.axiosInstance = withPaymentInterceptor(this.axiosInstance, client);
}
```

**Step 6: Run all tests again**

Run: `npm test`
Expected: All tests PASS

**Step 7: Commit (only if changes were made)**

```bash
git add src/client.ts
git commit -m "fix: use static imports for x402 dependencies"
```

---

### Task 6: Type-check and final verification

**Step 1: Run type checker**

Run: `npm run lint`
Expected: No type errors

**Step 2: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 3: Build**

Run: `npm run build`
Expected: Clean build

**Step 4: Commit any fixes if needed**
