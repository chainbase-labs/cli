import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createSqlCommand(): Command {
  const cmd = new Command('sql').description('SQL queries and executions');

  cmd
    .command('query <sql>')
    .description('Run a SQL query via the data warehouse')
    .option('--task-id <id>', 'Task ID for paginating previous results')
    .option('--page <n>', 'Page number')
    .action(async (sql: string, cmdOpts: Record<string, string>) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const body: Record<string, unknown> = { query: sql };
      if (cmdOpts.taskId) body.task_id = cmdOpts.taskId;
      if (cmdOpts.page) body.page = cmdOpts.page;
      const result = await client.post('/v1/dw/query', body);
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('execute <sql>')
    .description('Execute a SQL statement asynchronously')
    .action(async (sql: string) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const result = await client.post('/query/execute', { sql });
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('status <execution_id>')
    .description('Check execution status')
    .action(async (executionId: string) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const result = await client.get(`/execution/${executionId}/status`, {});
      formatOutput(result, opts.pretty);
    });

  cmd
    .command('results <execution_id>')
    .description('Get execution results')
    .action(async (executionId: string) => {
      const opts = cmd.parent!.opts();
      const { client } = createClient(opts);
      const result = await client.get(`/execution/${executionId}/results`, {});
      formatOutput(result, opts.pretty);
    });

  return cmd;
}
