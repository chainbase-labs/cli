import axios from 'axios';
import { getApiKey, getDefaultChain } from './config.js';

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

export function createClient(opts: { chain?: string }): { client: ChainbaseClient; chainId: string } {
  const apiKey = getApiKey();
  const chainId = opts.chain || getDefaultChain();
  return { client: new ChainbaseClient(apiKey), chainId };
}
