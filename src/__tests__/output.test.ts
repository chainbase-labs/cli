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
    });

    it('outputs key-value format when json=false for API response', () => {
      formatOutput({ code: 0, message: 'ok', data: { price: 1.0, symbol: 'USDT' } }, false);
      const output = getAllStdout();
      expect(output).toContain('Price');
      expect(output).toContain('1');
      expect(output).toContain('Symbol');
      expect(output).toContain('USDT');
      expect(output).not.toContain('"code"');
    });

    it('outputs key-value for plain objects when json=false', () => {
      formatOutput({ key: 'api-key', value: '***abcd' }, false);
      const output = getAllStdout();
      expect(output).toContain('Key');
      expect(output).toContain('api-key');
      expect(output).toContain('Value');
      expect(output).toContain('***abcd');
    });

    it('handles array data', () => {
      formatOutput({ code: 0, data: ['0xaaa', '0xbbb'] }, false);
      const output = getAllStdout();
      expect(output).toContain('0xaaa');
      expect(output).toContain('0xbbb');
    });

    it('handles nested objects', () => {
      formatOutput({ code: 0, data: { token: { name: 'USDT', decimals: 6 } } }, false);
      const output = getAllStdout();
      expect(output).toContain('Name');
      expect(output).toContain('USDT');
      expect(output).toContain('Decimals');
      expect(output).toContain('6');
    });

    it('displays x402 payment info when _x402 present and json=false', () => {
      formatOutput({ code: 0, data: { price: 1.0 }, _x402: { txHash: '0xtx', from: '0xfrom', to: '0xto' } }, false);
      const output = getAllStdout();
      expect(output).toContain('Price');
      expect(output).toContain('x402 Payment');
      expect(output).toContain('0xtx');
      expect(output).toContain('0xfrom');
      expect(output).toContain('0xto');
    });

    it('includes _x402 in JSON output when json=true', () => {
      const data = { code: 0, data: { price: 1.0 }, _x402: { txHash: '0xtx', from: '0xfrom', to: '0xto' } };
      formatOutput(data, true);
      const output = stdoutSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);
      expect(parsed._x402).toEqual({ txHash: '0xtx', from: '0xfrom', to: '0xto' });
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
      formatPaymentInfo({ txHash: '0xabc123', from: '0xsender', to: '0xreceiver' });
      const output = getAllStdout();
      expect(output).toContain('x402 Payment');
      expect(output).toContain('Tx Hash');
      expect(output).toContain('0xabc123');
      expect(output).toContain('From');
      expect(output).toContain('0xsender');
      expect(output).toContain('To');
      expect(output).toContain('0xreceiver');
    });
  });

  function getAllStdout(): string {
    return stdoutSpy.mock.calls.map(c => c[0]).join('');
  }
});
