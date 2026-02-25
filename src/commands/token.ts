import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createTokenCommand(): Command {
  const cmd = new Command('token').description('Token queries');

  cmd
    .command('metadata <contract>')
    .description('Get token metadata')
    .action(async (contract: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/token/metadata', {
        chain_id: chainId,
        contract_address: contract,
      });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('transfers')
    .description('Get token transfers')
    .option('--contract <addr>', 'Contract address')
    .option('--address <addr>', 'Wallet address')
    .option('--from-block <n>', 'Start block number')
    .option('--to-block <n>', 'End block number')
    .option('--from-timestamp <n>', 'Start timestamp')
    .option('--end-timestamp <n>', 'End timestamp')
    .action(async (cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
      };
      if (cmdOpts.contract) params.contract_address = cmdOpts.contract;
      if (cmdOpts.address) params.address = cmdOpts.address;
      if (cmdOpts.fromBlock) params.from_block = cmdOpts.fromBlock;
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      if (cmdOpts.fromTimestamp) params.from_timestamp = cmdOpts.fromTimestamp;
      if (cmdOpts.endTimestamp) params.end_timestamp = cmdOpts.endTimestamp;
      if (opts.page) params.page = opts.page;
      if (opts.limit) params.limit = opts.limit;
      const result = await client.get('/v1/token/transfers', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('holders <contract>')
    .description('Get token holders')
    .action(async (contract: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        contract_address: contract,
      };
      if (opts.page) params.page = opts.page;
      if (opts.limit) params.limit = opts.limit;
      const result = await client.get('/v1/token/holders', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('top-holders <contract>')
    .description('Get top token holders')
    .action(async (contract: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        contract_address: contract,
      };
      if (opts.page) params.page = opts.page;
      if (opts.limit) params.limit = opts.limit;
      const result = await client.get('/v1/token/top-holders', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('price <contract>')
    .description('Get token price')
    .action(async (contract: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/token/price', {
        chain_id: chainId,
        contract_address: contract,
      });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('price-history <contract>')
    .description('Get token price history')
    .requiredOption('--from <timestamp>', 'Start timestamp')
    .requiredOption('--to <timestamp>', 'End timestamp')
    .action(async (contract: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/token/price/history', {
        chain_id: chainId,
        contract_address: contract,
        from_timestamp: cmdOpts.from,
        end_timestamp: cmdOpts.to,
      });
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
