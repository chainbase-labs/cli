import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatOutput } from '../output.js';

describe('output', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('outputs compact JSON by default', () => {
    formatOutput({ price: 1234.56 }, false);
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(JSON.parse(output)).toEqual({ price: 1234.56 });
    expect(output).not.toContain('\n  ');
  });

  it('outputs indented JSON with pretty flag', () => {
    formatOutput({ price: 1234.56 }, true);
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain('\n  ');
  });
});
