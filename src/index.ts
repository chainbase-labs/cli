#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('chainbase')
  .description('CLI for Chainbase Web3 API')
  .version('0.1.0');

program.parse();
