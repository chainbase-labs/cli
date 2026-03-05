import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ChainbaseClient } from '../client.js';

const mockRequest = vi.fn();
const mockInstance = {
  request: mockRequest,
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
  },
}));

vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({})),
  http: vi.fn(),
}));

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn(() => ({ address: '0xmock', signTypedData: vi.fn() })),
}));

vi.mock('viem/chains', () => ({
  base: { id: 8453 },
}));

vi.mock('@x402/axios', () => ({
  x402Client: vi.fn(function () { return {}; }),
  wrapAxiosWithPayment: vi.fn((_instance: unknown) => mockInstance),
  decodePaymentResponseHeader: vi.fn((header: string) => JSON.parse(header)),
}));

vi.mock('@x402/evm', () => ({
  toClientEvmSigner: vi.fn(() => ({ address: '0xmock', signTypedData: vi.fn(), readContract: vi.fn() })),
}));

vi.mock('@x402/evm/exact/client', () => ({
  registerExactEvmScheme: vi.fn(),
}));

describe('ChainbaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('standard mode', () => {
    let client: ChainbaseClient;

    beforeEach(() => {
      client = new ChainbaseClient('test-api-key');
    });

    it('sends GET requests with x-api-key header', async () => {
      mockRequest.mockResolvedValue({ data: { code: 0, data: 'ok' } });
      const result = await client.get('/v1/block/number/latest', { chain_id: 1 });
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        method: 'GET',
        url: 'https://api.chainbase.online/v1/block/number/latest',
        headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }),
        params: { chain_id: 1 },
      }));
      expect(result).toEqual({ code: 0, data: 'ok' });
    });

    it('sends POST requests with JSON body', async () => {
      mockRequest.mockResolvedValue({ data: { code: 0, data: [] } });
      const body = { query: 'SELECT 1' };
      const result = await client.post('/v1/dw/query', body);
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        data: body,
      }));
      expect(result).toEqual({ code: 0, data: [] });
    });

    it('uses sql base URL for /query/ and /execution/ paths', async () => {
      mockRequest.mockResolvedValue({ data: { code: 0 } });
      await client.post('/query/execute', { sql: 'SELECT 1' });
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://api.chainbase.com/api/v1/query/execute',
      }));
    });

    it('throws descriptive error on non-zero code', async () => {
      mockRequest.mockResolvedValue({ data: { code: 1001, message: 'bad query' } });
      await expect(client.get('/v1/token/price', {})).rejects.toThrow('bad query');
    });

    it('throws on network error', async () => {
      mockRequest.mockRejectedValue(new Error('Network Error'));
      await expect(client.get('/v1/token/price', {})).rejects.toThrow('Network Error');
    });
  });

  describe('x402 mode', () => {
    let client: ChainbaseClient;

    beforeEach(() => {
      client = new ChainbaseClient('ignored', { privateKey: '0xdeadbeef' });
    });

    it('wraps axios instance with payment interceptor', async () => {
      const { wrapAxiosWithPayment } = await import('@x402/axios');
      expect(wrapAxiosWithPayment).toHaveBeenCalled();
    });

    it('registers exact EVM scheme', async () => {
      const { registerExactEvmScheme } = await import('@x402/evm/exact/client');
      expect(registerExactEvmScheme).toHaveBeenCalled();
    });

    it('uses x402 base URL and x-api-key header for web3 API paths', async () => {
      mockRequest.mockResolvedValue({ data: { code: 0, data: 'ok' } });
      await client.get('/v1/token/price', { chain_id: 1 });
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://api.chainbase.com/v1/token/price',
        headers: expect.objectContaining({ 'x-api-key': 'x402' }),
      }));
    });

    it('throws error for SQL API /query/ paths', async () => {
      await expect(client.post('/query/execute', { sql: 'SELECT 1' }))
        .rejects.toThrow('SQL API does not support x402 payment mode');
    });

    it('throws error for SQL API /execution/ paths', async () => {
      await expect(client.get('/execution/status', { task_id: '123' }))
        .rejects.toThrow('SQL API does not support x402 payment mode');
    });

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

    it('returns body without _x402 when no payment-response header', async () => {
      mockRequest.mockResolvedValue({
        data: { code: 0, data: 'ok' },
        headers: {},
      });
      const result = await client.get('/v1/token/price', { chain_id: 1 });
      expect(result).toEqual({ code: 0, data: 'ok' });
    });
  });
});
