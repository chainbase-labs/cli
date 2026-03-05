import chalk from 'chalk';

export interface PaymentInfo {
  txHash: string;
  from: string;
  to: string;
}

/**
 * Format a key string for display: capitalize first letter, replace underscores
 * and camelCase boundaries with spaces.
 */
function formatKey(key: string): string {
  // Replace underscores with spaces
  let result = key.replace(/_/g, ' ');
  // Insert space before uppercase letters in camelCase (e.g., "txHash" -> "tx Hash")
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Capitalize first letter of each word
  result = result.replace(/\b\w/g, (c) => c.toUpperCase());
  return result;
}

/**
 * Check if an object looks like a Chainbase API response wrapper: { code, message?, data }
 */
function isApiResponse(data: unknown): data is Record<string, unknown> & { code: number; data: unknown } {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  return 'code' in obj && 'data' in obj;
}

/**
 * Render a value as key-value pairs to stdout.
 */
function renderValue(value: unknown, indent: number = 0): void {
  const prefix = '  '.repeat(indent);

  if (value === null || value === undefined) {
    process.stdout.write(`${prefix}${chalk.dim('null')}\n`);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      if (typeof item === 'object' && item !== null) {
        process.stdout.write(`${prefix}${chalk.dim(`[${i + 1}]`)}\n`);
        renderObject(item as Record<string, unknown>, indent + 1);
      } else {
        process.stdout.write(`${prefix}${chalk.dim(`[${i + 1}]`)}  ${String(item)}\n`);
      }
    });
    return;
  }

  if (typeof value === 'object') {
    renderObject(value as Record<string, unknown>, indent);
    return;
  }

  process.stdout.write(`${prefix}${String(value)}\n`);
}

/**
 * Render an object's entries as key-value pairs.
 */
function renderObject(obj: Record<string, unknown>, indent: number = 0): void {
  const prefix = '  '.repeat(indent);
  const entries = Object.entries(obj);

  for (const [key, value] of entries) {
    const label = formatKey(key);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      process.stdout.write(`${prefix}${chalk.cyan(label + ':')}\n`);
      renderObject(value as Record<string, unknown>, indent + 1);
    } else if (Array.isArray(value)) {
      process.stdout.write(`${prefix}${chalk.cyan(label + ':')}\n`);
      renderValue(value, indent + 1);
    } else {
      process.stdout.write(`${prefix}${chalk.cyan(label + ':')}  ${String(value)}\n`);
    }
  }
}

export function formatPaymentInfo(payment: PaymentInfo): void {
  process.stdout.write('\n');
  process.stdout.write(chalk.yellow('── x402 Payment ──') + '\n');
  process.stdout.write(`${chalk.cyan('Tx Hash:')}   ${payment.txHash}\n`);
  process.stdout.write(`${chalk.cyan('From:')}      ${payment.from}\n`);
  process.stdout.write(`${chalk.cyan('To:')}        ${payment.to}\n`);
}

export function formatOutput(data: unknown, json: boolean): void {
  if (json) {
    process.stdout.write(JSON.stringify(data) + '\n');
    return;
  }

  // Extract _x402 payment info if present
  let paymentInfo: PaymentInfo | undefined;
  let displayData = data;

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if ('_x402' in obj && obj._x402 && typeof obj._x402 === 'object') {
      paymentInfo = obj._x402 as PaymentInfo;
      // Remove _x402 from display data
      const { _x402, ...rest } = obj;
      displayData = rest;
    }
  }

  // Unwrap API response wrapper: extract data field, skip code/message
  if (isApiResponse(displayData)) {
    displayData = displayData.data;
  }

  // Render the main data
  renderValue(displayData);

  // Display payment info block if present
  if (paymentInfo) {
    formatPaymentInfo(paymentInfo);
  }
}

export function formatError(message: string, json: boolean): void {
  const error = { error: message };
  if (json) {
    process.stderr.write(JSON.stringify(error) + '\n');
  } else {
    process.stderr.write(chalk.red(`Error: ${message}`) + '\n');
  }
}
