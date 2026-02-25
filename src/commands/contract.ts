import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createContractCommand(): Command {
  const cmd = new Command('contract').description('Smart contract interactions');

  cmd
    .command('call')
    .description('Call a read-only contract function')
    .requiredOption('--address <addr>', 'Contract address')
    .requiredOption('--function <name>', 'Function name')
    .requiredOption('--abi <json>', 'Contract ABI (JSON string)')
    .option('--params <json>', 'Function parameters (JSON array)', '[]')
    .option('--to-block <n>', 'Block number')
    .action(async (cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const body = {
        chain_id: Number(chainId),
        contract_address: cmdOpts.address,
        function_name: cmdOpts.function,
        abi: cmdOpts.abi,
        params: JSON.parse(cmdOpts.params),
        ...(cmdOpts.toBlock && { to_block: cmdOpts.toBlock }),
      };
      const result = await client.post('/v1/contract/call', body);
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
