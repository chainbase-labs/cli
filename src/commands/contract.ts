import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createContractCommand(): Command {
  const cmd = new Command('contract').description('智能合约交互');

  cmd
    .command('call')
    .description('调用合约只读函数')
    .requiredOption('--address <addr>', '合约地址')
    .requiredOption('--function <name>', '函数名')
    .requiredOption('--abi <json>', '合约 ABI（JSON 字符串）')
    .option('--params <json>', '函数参数（JSON 数组）', '[]')
    .option('--to-block <n>', '区块号')
    .action(async (cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const body = {
        chain_id: Number(chainId),
        contract_address: cmdOpts.address,
        function_name: cmdOpts.function,
        abi: cmdOpts.abi,
        params: (() => { try { return JSON.parse(cmdOpts.params); } catch { throw new Error('--params 格式错误，请提供合法 JSON 数组，如 \'["0x..."]\''); } })(),
        ...(cmdOpts.toBlock && { to_block: cmdOpts.toBlock }),
      };
      const result = await client.post('/v1/contract/call', body);
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
