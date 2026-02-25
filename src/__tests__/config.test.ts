import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getConfig, setConfig, listConfig, getApiKey, getConfigDir } from '../config.js';

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
});
