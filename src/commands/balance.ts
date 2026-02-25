import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createBalanceCommand(): Command {
  const cmd = new Command('balance').description('余额与账户查询');

  cmd
    .command('native <address>')
    .description('获取原生代币余额')
    .option('--to-block <n>', '区块号')
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
    .description('获取 ERC20 代币余额')
    .option('--contract <addr>', '按合约地址筛选')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
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
    .description('获取 DeFi 组合持仓')
    .option('--chains <ids>', '链 ID（逗号分隔）')
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
    .description('获取持有的 NFT 列表')
    .option('--contract <addr>', '按合约地址筛选')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
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
