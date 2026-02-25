import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createTxCommand(): Command {
  const cmd = new Command('tx').description('Transaction queries');

  cmd
    .command('detail <hash>')
    .description('Get transaction by hash')
    .action(async (hash: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/tx/detail', { chain_id: chainId, hash });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('list <address>')
    .description('Get transactions by account')
    .option('--from-block <n>', 'Start block number')
    .option('--to-block <n>', 'End block number')
    .option('--from-timestamp <n>', 'Start timestamp')
    .option('--end-timestamp <n>', 'End timestamp')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
    .action(async (address: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        address,
      };
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      if (cmdOpts.fromBlock) params.from_block = cmdOpts.fromBlock;
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      if (cmdOpts.fromTimestamp) params.from_timestamp = cmdOpts.fromTimestamp;
      if (cmdOpts.endTimestamp) params.end_timestamp = cmdOpts.endTimestamp;
      const result = await client.get('/v1/account/txs', params);
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
