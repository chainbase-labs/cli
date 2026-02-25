import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createAddressCommand(): Command {
  const cmd = new Command('address').description('地址查询');

  cmd
    .command('labels <address>')
    .description('获取地址标签')
    .action(async (address: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/address/labels', { chain_id: chainId, address });
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
