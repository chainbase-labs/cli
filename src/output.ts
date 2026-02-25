import chalk from 'chalk';

export function formatOutput(data: unknown, pretty: boolean): void {
  if (pretty) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  } else {
    process.stdout.write(JSON.stringify(data) + '\n');
  }
}

export function formatError(message: string, pretty: boolean): void {
  const error = { error: message };
  if (pretty) {
    process.stderr.write(chalk.red(`Error: ${message}`) + '\n');
  } else {
    process.stderr.write(JSON.stringify(error) + '\n');
  }
}
