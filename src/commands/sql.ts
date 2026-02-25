import { Command } from 'commander';
import { createClient } from '../client.js';
import { formatOutput } from '../output.js';

export function createSqlCommand(): Command {
  const cmd = new Command('sql').description('SQL queries and executions');

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
