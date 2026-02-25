import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createTxCommand(): Command {
  const cmd = new Command('tx').description('交易查询');

  cmd
    .command('detail <hash>')
    .description('按哈希查询交易详情')
    .action(async (hash: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/tx/detail', { chain_id: chainId, hash });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('list <address>')
    .description('查询账户交易列表')
    .option('--from-block <n>', '起始区块号')
    .option('--to-block <n>', '结束区块号')
    .option('--from-timestamp <n>', '起始时间戳')
    .option('--end-timestamp <n>', '结束时间戳')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
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
