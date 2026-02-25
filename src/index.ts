#!/usr/bin/env node
import { Command } from 'commander';
import { createConfigCommand } from './commands/config.js';
import { createBlockCommand } from './commands/block.js';
import { createTxCommand } from './commands/tx.js';
import { createContractCommand } from './commands/contract.js';
import { createAddressCommand } from './commands/address.js';
import { createTokenCommand } from './commands/token.js';
import { createNftCommand } from './commands/nft.js';
import { createBalanceCommand } from './commands/balance.js';
import { createDomainCommand } from './commands/domain.js';
import { createSqlCommand } from './commands/sql.js';
import { formatError } from './output.js';

const program = new Command();

program
  .name('chainbase')
  .description('Chainbase Web3 API 命令行工具')
  .version('0.1.0')
  .option('--chain <id>', '链 ID（默认从配置读取，否则为 1）')
  .option('--pretty', '以人类可读格式输出', false)
  .option('--page <n>', '页码', '1')
  .option('--limit <n>', '每页条数', '20');

program.addCommand(createConfigCommand());
program.addCommand(createBlockCommand());
program.addCommand(createTxCommand());
program.addCommand(createContractCommand());
program.addCommand(createAddressCommand());
program.addCommand(createTokenCommand());
program.addCommand(createNftCommand());
program.addCommand(createBalanceCommand());
program.addCommand(createDomainCommand());
program.addCommand(createSqlCommand());

async function main() {
  try {
    await program.parseAsync();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    formatError(message, program.opts().pretty);
    process.exit(1);
  }
}

main();
