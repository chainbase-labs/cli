import axios, { type AxiosInstance } from 'axios';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { x402Client, wrapAxiosWithPayment } from '@x402/axios';
import { toClientEvmSigner } from '@x402/evm';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { getApiKey, getDefaultChain, getPrivateKey, isX402Mode } from './config.js';

const WEB3_BASE = 'https://api.chainbase.online';
const SQL_BASE = 'https://api.chainbase.com/api/v1';
const X402_BASE = 'https://api.chainbase.com';

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
      const account = privateKeyToAccount(x402Options.privateKey as `0x${string}`);
      const publicClient = createPublicClient({ chain: base, transport: http() });
      const signer = toClientEvmSigner(account, publicClient);
      const client = new x402Client();
      registerExactEvmScheme(client, { signer });
      this.axiosInstance = wrapAxiosWithPayment(this.axiosInstance, client);
    }
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
