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
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    throw new Error(`Config file corrupted: ${configPath}\nDelete it and re-configure: chainbase config set api-key <your-key>`);
  }
}

function writeConfigFile(config: Record<string, string>): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), { mode: 0o600 });
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
