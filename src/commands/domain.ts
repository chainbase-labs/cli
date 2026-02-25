import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createDomainCommand(): Command {
  const cmd = new Command('domain').description('域名查询');

  cmd
    .command('ens <address>')
    .description('获取地址持有的 ENS 域名')
    .option('--to-block <n>', '区块号')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        address,
      };
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      const result = await client.get('/v1/account/ens', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('ens-resolve <domain>')
    .description('解析 ENS 域名')
    .option('--to-block <n>', '区块号')
    .action(async (domain: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        domain,
      };
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      const result = await client.get('/v1/ens/records', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('ens-reverse <address>')
    .description('反向解析地址到 ENS 域名')
    .option('--to-block <n>', '区块号')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        address,
      };
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      const result = await client.get('/v1/ens/reverse', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('spaceid-resolve <domain>')
    .description('解析 Space ID 域名')
    .option('--to-block <n>', '区块号')
    .action(async (domain: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        domain,
      };
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      const result = await client.get('/v1/space-id/records', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('spaceid-reverse <address>')
    .description('反向解析地址到 Space ID 域名')
    .option('--to-block <n>', '区块号')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        address,
      };
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      const result = await client.get('/v1/space-id/reverse', params);
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
