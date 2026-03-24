import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { createTopsCommand } from '../commands/tops.js';

const mockGet = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock('../output.js', () => ({
  formatOutput: vi.fn(),
}));

async function runCommand(args: string[]): Promise<void> {
  const { formatOutput } = await import('../output.js');
  vi.mocked(formatOutput).mockClear();

  const program = new Command();
  program.option('--json', 'JSON output', false);
  program.addCommand(createTopsCommand());
  await program.parseAsync(['node', 'chainbase', ...args]);
}

describe('tops command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trending', () => {
    it('calls list-trending-topics with default language', async () => {
      const data = { count: 1, items: [{ id: 'abc', keyword: 'RWA', score: 9.5 }] };
      mockGet.mockResolvedValue({ data });
      const { formatOutput } = await import('../output.js');
      await runCommand(['tops', 'trending']);
      expect(mockGet).toHaveBeenCalledWith(
        'https://api.chainbase.com/tops/v1/tool/list-trending-topics',
        { params: { language: 'en' } },
      );
      expect(formatOutput).toHaveBeenCalledWith(data, false);
    });

    it('passes language option', async () => {
      mockGet.mockResolvedValue({ data: { count: 0, items: [] } });
      await runCommand(['tops', 'trending', '--language', 'zh']);
      expect(mockGet).toHaveBeenCalledWith(
        'https://api.chainbase.com/tops/v1/tool/list-trending-topics',
        { params: { language: 'zh' } },
      );
    });
  });

  describe('topic', () => {
    it('calls get-topic with topic_id', async () => {
      const data = { data: { id: 'topic123', keyword: 'AI Agent', summary: 'AI agents are trending' } };
      mockGet.mockResolvedValue({ data });
      const { formatOutput } = await import('../output.js');
      await runCommand(['tops', 'topic', 'topic123']);
      expect(mockGet).toHaveBeenCalledWith(
        'https://api.chainbase.com/tops/v1/tool/get-topic',
        { params: { topic_id: 'topic123' } },
      );
      expect(formatOutput).toHaveBeenCalledWith(data, false);
    });
  });

  describe('posts', () => {
    it('calls get-topic-posts with topic_id', async () => {
      const data = { count: 2, items: [{ id: 't1', text: 'hello' }, { id: 't2', text: 'world' }] };
      mockGet.mockResolvedValue({ data });
      const { formatOutput } = await import('../output.js');
      await runCommand(['tops', 'posts', 'topic456']);
      expect(mockGet).toHaveBeenCalledWith(
        'https://api.chainbase.com/tops/v1/tool/get-topic-posts',
        { params: { topic_id: 'topic456' } },
      );
      expect(formatOutput).toHaveBeenCalledWith(data, false);
    });
  });

  describe('mentions', () => {
    it('calls search-mentions with keyword', async () => {
      const data = { count: 1, items: [{ id: 'tw1', text: 'Restaking is huge' }] };
      mockGet.mockResolvedValue({ data });
      const { formatOutput } = await import('../output.js');
      await runCommand(['tops', 'mentions', 'Restaking']);
      expect(mockGet).toHaveBeenCalledWith(
        'https://api.chainbase.com/tops/v1/tool/search-mentions',
        { params: { keyword: 'Restaking' } },
      );
      expect(formatOutput).toHaveBeenCalledWith(data, false);
    });
  });

  describe('search', () => {
    it('calls search-narrative-candidates with keyword', async () => {
      const data = { count: 3, items: [{ id: 'n1', keyword: 'RWA' }] };
      mockGet.mockResolvedValue({ data });
      const { formatOutput } = await import('../output.js');
      await runCommand(['tops', 'search', 'RWA']);
      expect(mockGet).toHaveBeenCalledWith(
        'https://api.chainbase.com/tops/v1/tool/search-narrative-candidates',
        { params: { keyword: 'RWA' } },
      );
      expect(formatOutput).toHaveBeenCalledWith(data, false);
    });
  });

  describe('json flag', () => {
    it('passes json=true to formatOutput when --json flag is set', async () => {
      mockGet.mockResolvedValue({ data: { count: 0, items: [] } });
      const { formatOutput } = await import('../output.js');
      await runCommand(['--json', 'tops', 'trending']);
      expect(formatOutput).toHaveBeenCalledWith(expect.anything(), true);
    });
  });
});
