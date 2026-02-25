import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createTokenCommand(): Command {
  const cmd = new Command('token').description('代币查询');

  cmd
    .command('metadata <contract>')
    .description('获取代币元数据')
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
    .description('获取代币转账记录')
    .option('--contract <addr>', '合约地址')
    .option('--address <addr>', '钱包地址')
    .option('--from-block <n>', '起始区块号')
    .option('--to-block <n>', '结束区块号')
    .option('--from-timestamp <n>', '起始时间戳')
    .option('--end-timestamp <n>', '结束时间戳')
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
    .description('获取代币持有者列表')
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
    .description('获取代币 Top 持有者')
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
    .description('获取代币价格')
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
    .description('获取代币历史价格')
    .requiredOption('--from <timestamp>', '起始时间戳')
    .requiredOption('--to <timestamp>', '结束时间戳')
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
