import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getConfig, setConfig, listConfig, getApiKey, getConfigDir, getPrivateKey, isX402Mode } from '../config.js';

describe('config', () => {
  let tmpDir: string;

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

  describe('getPrivateKey', () => {
    it('env var CHAINBASE_PRIVATE_KEY overrides config file', () => {
      setConfig('private-key', '0xfromfile');
      vi.stubEnv('CHAINBASE_PRIVATE_KEY', '0xfromenv');
      expect(getPrivateKey()).toBe('0xfromenv');
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

    it('falls back to config when flag is false (Commander default)', () => {
      setConfig('payment-mode', 'x402');
      expect(isX402Mode({ x402: false })).toBe(true);
    });
  });
});
