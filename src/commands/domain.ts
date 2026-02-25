import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createDomainCommand(): Command {
  const cmd = new Command('domain').description('Domain name queries');

  cmd
    .command('ens <address>')
    .description('Get ENS domains for an address')
    .option('--to-block <n>', 'Block number')
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
    .description('Resolve an ENS domain to records')
    .option('--to-block <n>', 'Block number')
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
    .description('Reverse resolve an address to ENS domain')
    .option('--to-block <n>', 'Block number')
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
    .description('Resolve a Space ID domain to records')
    .option('--to-block <n>', 'Block number')
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
    .description('Reverse resolve an address to Space ID domain')
    .option('--to-block <n>', 'Block number')
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
