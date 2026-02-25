import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createBlockCommand(): Command {
  const cmd = new Command('block').description('区块查询');

  cmd
    .command('latest')
    .description('获取最新区块号')
    .action(async () => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/block/number/latest', { chain_id: chainId });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('detail <number>')
    .description('按区块号查询区块详情')
    .action(async (number: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/block/detail', { chain_id: chainId, number });
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
