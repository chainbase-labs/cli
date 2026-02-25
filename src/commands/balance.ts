import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createBalanceCommand(): Command {
  const cmd = new Command('balance').description('Balance and account queries');

  cmd
    .command('native <address>')
    .description('Get native token balance')
    .option('--to-block <n>', 'Block number')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        address,
      };
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      const result = await client.get('/v1/account/balance', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('tokens <address>')
    .description('Get token balances for an address')
    .option('--contract <addr>', 'Filter by contract address')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        address,
      };
      if (cmdOpts.contract) params.contract_address = cmdOpts.contract;
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/account/tokens', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('portfolios <address>')
    .description('Get portfolio balances across chains')
    .option('--chains <ids>', 'Comma-separated chain IDs')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const params: Record<string, unknown> = {
        address,
      };
      if (cmdOpts.chains) params.chain_id = cmdOpts.chains.split(',');
      const result = await client.get('/v1/account/portfolios', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('nfts <address>')
    .description('Get NFT balances for an address')
    .option('--contract <addr>', 'Filter by contract address')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        address,
      };
      if (cmdOpts.contract) params.contract_address = cmdOpts.contract;
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/account/nfts', params);
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
