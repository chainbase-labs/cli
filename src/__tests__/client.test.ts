import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ChainbaseClient } from '../client.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, { deep: true });

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
