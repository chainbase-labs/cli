import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createSqlCommand(): Command {
  const cmd = new Command('sql').description('SQL 查询与执行');

  cmd
    .command('execute <sql>')
    .description('异步执行 SQL 语句')
    .action(async (sql: string) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const result = await client.post('/query/execute', { sql });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('status <execution_id>')
    .description('查询执行状态')
    .action(async (executionId: string) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const result = await client.get(`/execution/${executionId}/status`, {});
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('results <execution_id>')
    .description('获取执行结果')
    .action(async (executionId: string) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const result = await client.get(`/execution/${executionId}/results`, {});
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
