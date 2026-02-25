import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createBlockCommand(): Command {
  const cmd = new Command('block').description('Block queries');

  cmd
    .command('latest')
    .description('Get latest block number')
    .action(async () => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/block/number/latest', { chain_id: chainId });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('detail <number>')
    .description('Get block by number')
    .action(async (number: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/block/detail', { chain_id: chainId, number });
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
