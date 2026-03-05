import { Command } from 'commander';
import { setConfig, getConfig, listConfig } from '../config.js';
import { formatOutput } from '../output.js';

export function createConfigCommand(): Command {
  const cmd = new Command('config').description('Manage CLI configuration');

  cmd
    .command('set <key> <value>')
    .description('Set a config value (api-key, default-chain)')
    .action((key: string, value: string) => {
      setConfig(key, value);
      const json = cmd.parent?.opts().json ?? false;
      formatOutput({ status: 'ok', key, value: key === 'api-key' ? '***' : value }, json);
    });

  cmd
    .command('get <key>')
    .description('Get a config value')
    .action((key: string) => {
      const json = cmd.parent?.opts().json ?? false;
      let value = getConfig(key) ?? null;
      if (key === 'api-key' && value) value = '***' + value.slice(-4);
      formatOutput({ key, value }, json);
    });

  cmd
    .command('list')
    .description('List all config values')
    .action(() => {
      const json = cmd.parent?.opts().json ?? false;
      const config = listConfig();
      const safe = { ...config };
      if (safe['api-key']) safe['api-key'] = '***' + safe['api-key'].slice(-4);
      formatOutput(safe, json);
    });

  return cmd;
}
