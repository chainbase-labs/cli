import { Command } from 'commander';
import axios from 'axios';
import { formatOutput } from '../output.js';

const TOPS_BASE = 'https://api.chainbase.com/tops';

async function topsGet(path: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const response = await axios.get(`${TOPS_BASE}${path}`, { params });
  return response.data;
}

export function createTopsCommand(): Command {
  const cmd = new Command('tops').description('Crypto social intelligence from Tops (no API key required)');

  cmd
    .command('trending')
    .description('List currently trending crypto topics')
    .option('--language <lang>', 'Language: zh/en/ko', 'en')
    .action(async (cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const params: Record<string, unknown> = {};
      if (cmdOpts.language) params.language = cmdOpts.language;
      const result = await topsGet('/v1/tool/list-trending-topics', params);
      formatOutput(result, opts.json);
    });

  cmd
    .command('topic <topic_id>')
    .description('Get structured details for a topic')
    .action(async (topicId: string) => {
      const opts = cmd.parent!.opts();
      const result = await topsGet('/v1/tool/get-topic', { topic_id: topicId });
      formatOutput(result, opts.json);
    });

  cmd
    .command('posts <topic_id>')
    .description('Get posts associated with a topic')
    .action(async (topicId: string) => {
      const opts = cmd.parent!.opts();
      const result = await topsGet('/v1/tool/get-topic-posts', { topic_id: topicId });
      formatOutput(result, opts.json);
    });

  cmd
    .command('mentions <keyword>')
    .description('Search recent Twitter/X mentions for a keyword')
    .action(async (keyword: string) => {
      const opts = cmd.parent!.opts();
      const result = await topsGet('/v1/tool/search-mentions', { keyword });
      formatOutput(result, opts.json);
    });

  cmd
    .command('search <keyword>')
    .description('Search narrative candidate topics by keyword (e.g. "RWA", "AI Agent")')
    .action(async (keyword: string) => {
      const opts = cmd.parent!.opts();
      const result = await topsGet('/v1/tool/search-narrative-candidates', { keyword });
      formatOutput(result, opts.json);
    });

  return cmd;
}
