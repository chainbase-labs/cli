import { Command } from 'commander';
import { setConfig, getConfig, listConfig } from '../config.js';
import { formatOutput } from '../output.js';

export function createConfigCommand(): Command {
  const cmd = new Command('config').description('管理 CLI 配置');

  cmd
    .command('set <key> <value>')
    .description('设置配置项（api-key, default-chain）')
    .action((key: string, value: string) => {
      setConfig(key, value);
      const pretty = cmd.parent?.opts().pretty ?? false;
      formatOutput({ status: 'ok', key, value: key === 'api-key' ? '***' : value }, pretty);
    });

  cmd
    .command('get <key>')
    .description('获取配置项')
    .action((key: string) => {
      const pretty = cmd.parent?.opts().pretty ?? false;
      let value = getConfig(key) ?? null;
      if (key === 'api-key' && value) value = '***' + value.slice(-4);
      formatOutput({ key, value }, pretty);
    });

  cmd
    .command('list')
    .description('列出所有配置项')
    .action(() => {
      const pretty = cmd.parent?.opts().pretty ?? false;
      const config = listConfig();
      const safe = { ...config };
      if (safe['api-key']) safe['api-key'] = '***' + safe['api-key'].slice(-4);
      formatOutput(safe, pretty);
    });

  return cmd;
}
