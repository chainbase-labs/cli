import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createNftCommand(): Command {
  const cmd = new Command('nft').description('NFT queries');

  cmd
    .command('metadata <contract> <token_id>')
    .description('Get NFT metadata')
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
    .description('Get NFT collection')
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
    .description('Get NFT collection items')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
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
    .description('Search NFTs by name')
    .option('--contract <addr>', 'Contract address')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
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
    .description('Get NFT transfers')
    .option('--contract <addr>', 'Contract address')
    .option('--token-id <id>', 'Token ID')
    .option('--address <addr>', 'Address')
    .option('--from-block <n>', 'Start block number')
    .option('--to-block <n>', 'End block number')
    .option('--from-timestamp <n>', 'Start timestamp')
    .option('--end-timestamp <n>', 'End timestamp')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
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
    .description('Get NFT owner')
    .option('--to-block <n>', 'Block number')
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
    .description('Get NFT owners')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
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
    .description('Get NFT owner history')
    .option('--from-block <n>', 'Start block number')
    .option('--to-block <n>', 'End block number')
    .option('--from-timestamp <n>', 'Start timestamp')
    .option('--end-timestamp <n>', 'End timestamp')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
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
    .description('Get NFT floor price')
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
    .description('Get NFT price history')
    .requiredOption('--from <timestamp>', 'Start timestamp')
    .requiredOption('--to <timestamp>', 'End timestamp')
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
    .description('Get trending NFT collections')
    .option('--range <period>', 'Time range', '7d')
    .option('--exchange <name>', 'Exchange name')
    .option('--sort <order>', 'Sort order')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
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
    .description('Get NFT rarity')
    .option('--token-id <id>', 'Token ID')
    .option('--rank-min <n>', 'Minimum rank')
    .option('--rank-max <n>', 'Maximum rank')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Results per page')
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
