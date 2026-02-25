import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createNftCommand(): Command {
  const cmd = new Command('nft').description('NFT 查询');

  cmd
    .command('metadata <contract> <token_id>')
    .description('获取 NFT 元数据')
    .action(async (contract: string, tokenId: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/nft/metadata', {
        chain_id: chainId,
        contract_address: contract,
        token_id: tokenId,
      });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('collection <contract>')
    .description('获取 NFT 集合信息')
    .action(async (contract: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/nft/collection', {
        chain_id: chainId,
        contract_address: contract,
      });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('collection-items <contract>')
    .description('获取 NFT 集合内所有项目')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
    .action(async (contract: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        contract_address: contract,
      };
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/nft/collection/items', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('search <name>')
    .description('按名称搜索 NFT 集合')
    .option('--contract <addr>', '合约地址')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
    .action(async (name: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        name,
      };
      if (cmdOpts.contract) params.contract_address = cmdOpts.contract;
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/nft/search', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('transfers')
    .description('获取 NFT 转账记录')
    .option('--contract <addr>', '合约地址')
    .option('--token-id <id>', 'Token ID')
    .option('--address <addr>', '钱包地址')
    .option('--from-block <n>', '起始区块号')
    .option('--to-block <n>', '结束区块号')
    .option('--from-timestamp <n>', '起始时间戳')
    .option('--end-timestamp <n>', '结束时间戳')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
    .action(async (cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
      };
      if (cmdOpts.contract) params.contract_address = cmdOpts.contract;
      if (cmdOpts.tokenId) params.token_id = cmdOpts.tokenId;
      if (cmdOpts.address) params.address = cmdOpts.address;
      if (cmdOpts.fromBlock) params.from_block = cmdOpts.fromBlock;
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      if (cmdOpts.fromTimestamp) params.from_timestamp = cmdOpts.fromTimestamp;
      if (cmdOpts.endTimestamp) params.end_timestamp = cmdOpts.endTimestamp;
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/nft/transfers', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('owner <contract> <token_id>')
    .description('获取 NFT 当前持有者')
    .option('--to-block <n>', '区块号')
    .action(async (contract: string, tokenId: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        contract_address: contract,
        token_id: tokenId,
      };
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      const result = await client.get('/v1/nft/owner', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('owners <contract>')
    .description('获取 NFT 集合所有持有者')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
    .action(async (contract: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        contract_address: contract,
      };
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/nft/owners', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('owner-history <contract> <token_id>')
    .description('获取 NFT 持有者历史')
    .option('--from-block <n>', '起始区块号')
    .option('--to-block <n>', '结束区块号')
    .option('--from-timestamp <n>', '起始时间戳')
    .option('--end-timestamp <n>', '结束时间戳')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
    .action(async (contract: string, tokenId: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        contract_address: contract,
        token_id: tokenId,
      };
      if (cmdOpts.fromBlock) params.from_block = cmdOpts.fromBlock;
      if (cmdOpts.toBlock) params.to_block = cmdOpts.toBlock;
      if (cmdOpts.fromTimestamp) params.from_timestamp = cmdOpts.fromTimestamp;
      if (cmdOpts.endTimestamp) params.end_timestamp = cmdOpts.endTimestamp;
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/nft/owner/history', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('floor-price <contract>')
    .description('获取 NFT 地板价')
    .action(async (contract: string) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/nft/floor_price', {
        chain_id: chainId,
        contract_address: contract,
      });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('price-history <contract>')
    .description('获取 NFT 历史地板价')
    .requiredOption('--from <timestamp>', '起始时间戳')
    .requiredOption('--to <timestamp>', '结束时间戳')
    .action(async (contract: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const result = await client.get('/v1/nft/price/history', {
        chain_id: chainId,
        contract_address: contract,
        from_timestamp: cmdOpts.from,
        end_timestamp: cmdOpts.to,
      });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('trending')
    .description('获取热门 NFT 集合')
    .option('--range <period>', '时间范围', '7d')
    .option('--exchange <name>', '交易所名称')
    .option('--sort <order>', '排序方式')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
    .action(async (cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        range: cmdOpts.range,
      };
      if (cmdOpts.exchange) params.exchange_name = cmdOpts.exchange;
      if (cmdOpts.sort) params.sort = cmdOpts.sort;
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/nft/collection/trending', params);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('rarity <contract>')
    .description('获取 NFT 稀有度')
    .option('--token-id <id>', 'Token ID')
    .option('--rank-min <n>', '最低排名')
    .option('--rank-max <n>', '最高排名')
    .option('--page <n>', '页码')
    .option('--limit <n>', '每页条数')
    .action(async (contract: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client, chainId } = createClient(opts);
      const params: Record<string, unknown> = {
        chain_id: chainId,
        contract_address: contract,
      };
      if (cmdOpts.tokenId) params.token_id = cmdOpts.tokenId;
      if (cmdOpts.rankMin) params.rank_min = cmdOpts.rankMin;
      if (cmdOpts.rankMax) params.rank_max = cmdOpts.rankMax;
      if (cmdOpts.page) params.page = cmdOpts.page;
      if (cmdOpts.limit) params.limit = cmdOpts.limit;
      const result = await client.get('/v1/nft/rarity', params);
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
