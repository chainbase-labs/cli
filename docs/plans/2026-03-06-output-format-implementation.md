# Output Format Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change CLI default output from JSON to human-readable key-value format, add `--json` flag, and show x402 payment transaction details.

**Architecture:** Rewrite `output.ts` with key-value renderer as default, JSON as opt-in. Modify `client.ts` to return x402 payment info from response headers. Update all command files to use `opts.json` instead of `opts.pretty`. Update `index.ts` to replace `--pretty` with `--json`.

**Tech Stack:** chalk (already installed), `decodePaymentResponseHeader` from `@x402/axios`

---

### Task 1: Rewrite `output.ts` with key-value format

**Files:**
- Modify: `src/output.ts`
- Modify: `src/__tests__/output.test.ts`

**Step 1: Write failing tests**

Replace `src/__tests__/output.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatOutput, formatError, formatPaymentInfo } from '../output.js';

describe('output', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  describe('formatOutput', () => {
    it('outputs compact JSON when json=true', () => {
      formatOutput({ code: 0, data: { price: 1.0 } }, true);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(JSON.parse(output)).toEqual({ code: 0, data: { price: 1.0 } });
      expect(output).not.toContain('\n  ');
    });

    it('outputs key-value format when json=false for API response', () => {
      formatOutput({ code: 0, message: 'ok', data: { price: 1.0, symbol: 'USDT' } }, false);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('Price');
      expect(output).toContain('1');
      expect(output).toContain('Symbol');
      expect(output).toContain('USDT');
      expect(output).not.toContain('"code"');
    });

    it('outputs key-value for plain objects when json=false', () => {
      formatOutput({ key: 'api-key', value: '***abcd' }, false);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('Key');
      expect(output).toContain('api-key');
      expect(output).toContain('Value');
      expect(output).toContain('***abcd');
    });

    it('handles array data as numbered list', () => {
      formatOutput({ code: 0, data: ['0xaaa', '0xbbb'] }, false);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('0xaaa');
      expect(output).toContain('0xbbb');
    });

    it('handles nested objects by flattening', () => {
      formatOutput({ code: 0, data: { token: { name: 'USDT', decimals: 6 } } }, false);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('Name');
      expect(output).toContain('USDT');
      expect(output).toContain('Decimals');
      expect(output).toContain('6');
    });
  });

  describe('formatError', () => {
    it('outputs JSON error when json=true', () => {
      formatError('something failed', true);
      const output = stderrSpy.mock.calls[0][0] as string;
      expect(JSON.parse(output)).toEqual({ error: 'something failed' });
    });

    it('outputs colored text when json=false', () => {
      formatError('something failed', false);
      const output = stderrSpy.mock.calls[0][0] as string;
      expect(output).toContain('something failed');
    });
  });

  describe('formatPaymentInfo', () => {
    it('outputs payment block to stdout', () => {
      formatPaymentInfo({
        txHash: '0xabc123',
        from: '0xsender',
        to: '0xreceiver',
      });
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('x402 Payment');
      expect(output).toContain('Tx Hash');
      expect(output).toContain('0xabc123');
      expect(output).toContain('From');
      expect(output).toContain('0xsender');
      expect(output).toContain('To');
      expect(output).toContain('0xreceiver');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/output.test.ts`
Expected: FAIL — `formatPaymentInfo` not exported, `formatOutput` signature changed

**Step 3: Implement `src/output.ts`**

Replace `src/output.ts`:

```typescript
import chalk from 'chalk';

export interface PaymentInfo {
  txHash: string;
  from: string;
  to: string;
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function renderKeyValue(obj: Record<string, unknown>, prefix = ''): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const label = formatKey(prefix ? `${prefix} ${key}` : key);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      lines.push(...renderKeyValue(value as Record<string, unknown>, prefix ? `${prefix} ${key}` : key).split('\n').filter(Boolean));
    } else if (Array.isArray(value)) {
      lines.push(`${chalk.cyan(label + ':')}`)
      value.forEach((item, i) => {
        if (item && typeof item === 'object') {
          lines.push(`  ${chalk.dim(`[${i + 1}]`)}`);
          const sub = renderKeyValue(item as Record<string, unknown>);
          lines.push(...sub.split('\n').filter(Boolean).map(l => '    ' + l));
        } else {
          lines.push(`  ${chalk.dim(`${i + 1}.`)} ${String(item)}`);
        }
      });
    } else {
      lines.push(`${chalk.cyan(label + ':')}  ${String(value ?? '')}`);
    }
  }
  return lines.join('\n');
}

export function formatOutput(data: unknown, json: boolean): void {
  if (json) {
    process.stdout.write(JSON.stringify(data) + '\n');
    return;
  }

  // Extract data payload from API response wrapper
  let display = data;
  if (data && typeof data === 'object' && 'data' in data) {
    display = (data as Record<string, unknown>).data;
  }

  if (display && typeof display === 'object' && !Array.isArray(display)) {
    process.stdout.write(renderKeyValue(display as Record<string, unknown>) + '\n');
  } else if (Array.isArray(display)) {
    display.forEach((item, i) => {
      if (item && typeof item === 'object') {
        process.stdout.write(renderKeyValue(item as Record<string, unknown>) + '\n');
        if (i < display.length - 1) process.stdout.write('\n');
      } else {
        process.stdout.write(`${chalk.dim(`${i + 1}.`)} ${String(item)}\n`);
      }
    });
  } else {
    process.stdout.write(String(display) + '\n');
  }
}

export function formatError(message: string, json: boolean): void {
  if (json) {
    process.stderr.write(JSON.stringify({ error: message }) + '\n');
  } else {
    process.stderr.write(chalk.red(`Error: ${message}`) + '\n');
  }
}

export function formatPaymentInfo(payment: PaymentInfo): void {
  const sep = chalk.dim('── x402 Payment ──');
  const lines = [
    '',
    sep,
    `${chalk.cyan('Tx Hash:')}  ${payment.txHash}`,
    `${chalk.cyan('From:')}     ${payment.from}`,
    `${chalk.cyan('To:')}       ${payment.to}`,
  ];
  process.stdout.write(lines.join('\n') + '\n');
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/output.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/output.ts src/__tests__/output.test.ts
git commit -m "feat: rewrite output with key-value default format and payment info"
```

---

### Task 2: Update `client.ts` to return x402 payment info

**Files:**
- Modify: `src/client.ts`
- Modify: `src/__tests__/client.test.ts`

**Step 1: Write failing test**

Add to `src/__tests__/client.test.ts` inside `describe('x402 mode', ...)`, after existing tests:

```typescript
    it('returns payment info from response headers in x402 mode', async () => {
      mockRequest.mockResolvedValue({
        data: { code: 0, data: 'ok' },
        headers: {
          'payment-response': JSON.stringify({
            txHash: '0xtxhash',
            from: '0xfromaddr',
            to: '0xtoaddr',
          }),
        },
      });
      const result = await client.get('/v1/token/price', { chain_id: 1 });
      expect(result).toEqual({
        code: 0,
        data: 'ok',
        _x402: { txHash: '0xtxhash', from: '0xfromaddr', to: '0xtoaddr' },
      });
    });
```

Also add mock for `decodePaymentResponseHeader` in the `@x402/axios` mock block (update the existing mock):

```typescript
vi.mock('@x402/axios', () => ({
  x402Client: vi.fn(function () { return {}; }),
  wrapAxiosWithPayment: vi.fn((_instance: unknown) => mockInstance),
  decodePaymentResponseHeader: vi.fn((header: string) => JSON.parse(header)),
}));
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/client.test.ts`
Expected: FAIL — result doesn't contain `_x402`

**Step 3: Implement in `src/client.ts`**

Update the import line:

```typescript
import { x402Client, wrapAxiosWithPayment, decodePaymentResponseHeader } from '@x402/axios';
```

Update the `request()` method — replace the return section (after `const body = response.data`):

```typescript
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body && body.code !== 0 && body.code !== 200) {
      throw new Error(body.message || `API error code: ${body.code}`);
    }

    if (this.x402Enabled && body && typeof body === 'object') {
      const paymentHeader = response.headers?.['payment-response'];
      if (paymentHeader) {
        try {
          const payment = decodePaymentResponseHeader(paymentHeader as string);
          return { ...body, _x402: { txHash: payment.txHash, from: payment.from, to: payment.to } };
        } catch {
          // payment header decode failed, return data without payment info
        }
      }
    }

    return body;
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/client.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/client.ts src/__tests__/client.test.ts
git commit -m "feat: return x402 payment info from response headers"
```

---

### Task 3: Replace `--pretty` with `--json` in `index.ts`

**Files:**
- Modify: `src/index.ts`

**Step 1: Update options**

In `src/index.ts`, replace:
```typescript
  .option('--pretty', 'Pretty-print output for humans', false)
```
with:
```typescript
  .option('--json', 'Output raw JSON (for AI agents)', false)
```

**Step 2: Update error handler**

Replace `formatError(message, program.opts().pretty)` with `formatError(message, program.opts().json)`.

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: replace --pretty with --json global option"
```

---

### Task 4: Update all command files from `opts.pretty` to `opts.json`

**Files:**
- Modify: `src/commands/address.ts`
- Modify: `src/commands/balance.ts`
- Modify: `src/commands/block.ts`
- Modify: `src/commands/contract.ts`
- Modify: `src/commands/domain.ts`
- Modify: `src/commands/nft.ts`
- Modify: `src/commands/sql.ts`
- Modify: `src/commands/token.ts`
- Modify: `src/commands/tx.ts`
- Modify: `src/commands/config.ts`

**Step 1: Replace `opts.pretty` with `opts.json` in all non-config commands**

In every file except `config.ts`, find and replace all `opts.pretty` with `opts.json`.

**Step 2: Update `config.ts`**

In `src/commands/config.ts`, replace all 3 occurrences of:
```typescript
const pretty = cmd.parent?.opts().pretty ?? false;
```
with:
```typescript
const json = cmd.parent?.opts().json ?? false;
```

And replace all 3 occurrences of `}, pretty)` with `}, json)`.

**Step 3: Add x402 payment info display to commands**

In each non-config command file that uses `createClient`, add payment info display. The pattern is:

```typescript
// After: formatOutput(result, opts.json);
// Add:
if (!opts.json && result && typeof result === 'object' && '_x402' in result) {
  const { formatPaymentInfo } = await import('../output.js');
  formatPaymentInfo((result as Record<string, unknown>)._x402 as { txHash: string; from: string; to: string });
}
```

**However**, to avoid repeating this in 30+ action handlers, instead wrap it in `formatOutput`. Update `src/output.ts` `formatOutput` to handle `_x402` automatically:

In `formatOutput`, before the main rendering, extract and display payment info:

```typescript
export function formatOutput(data: unknown, json: boolean): void {
  if (json) {
    process.stdout.write(JSON.stringify(data) + '\n');
    return;
  }

  // Extract and display x402 payment info if present
  let paymentInfo: PaymentInfo | undefined;
  if (data && typeof data === 'object' && '_x402' in data) {
    paymentInfo = (data as Record<string, unknown>)._x402 as PaymentInfo;
    // Remove _x402 from display data
    const { _x402, ...rest } = data as Record<string, unknown>;
    data = rest;
  }

  // ... existing rendering logic ...

  if (paymentInfo) {
    formatPaymentInfo(paymentInfo);
  }
}
```

This way command files only need `opts.pretty` → `opts.json` change and nothing else.

**Step 4: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/commands/ src/output.ts
git commit -m "feat: switch all commands from --pretty to --json output"
```

---

### Task 5: Type-check, build, and manual test

**Step 1: Type-check**

Run: `npm run lint`
Expected: No errors

**Step 2: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 3: Build**

Run: `npm run build`
Expected: Clean build

**Step 4: Test default output (human-readable)**

Run: `node dist/index.js token price 0xdac17f958d2ee523a2206206994597c13d831ec7`
Expected: Key-value format like:
```
Price:  1.00011
Symbol:  USDT
...
```

**Step 5: Test JSON output**

Run: `node dist/index.js --json token price 0xdac17f958d2ee523a2206206994597c13d831ec7`
Expected: Single-line JSON (same as old default)

**Step 6: Test x402 with payment info**

Run: `node dist/index.js --x402 token price 0xdac17f958d2ee523a2206206994597c13d831ec7`
Expected: Key-value output followed by x402 Payment block with Tx Hash, From, To

**Step 7: Test x402 JSON mode**

Run: `node dist/index.js --x402 --json token price 0xdac17f958d2ee523a2206206994597c13d831ec7`
Expected: JSON with `_x402` field containing txHash, from, to
