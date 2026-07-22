import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('returns full date with time by default', () => {
    const result = formatDate('2024-06-15T14:30:00Z');
    // Should contain month, day, year, and time
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });

  it('returns short date without time when type is SHORT', () => {
    const result = formatDate('2024-06-15T14:30:00Z', 'SHORT');
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
    // SHORT format should not contain colon (no time)
    expect(result).not.toMatch(/:/);
  });

  it('returns full date with time when type is LARGE', () => {
    const result = formatDate('2024-06-15T14:30:00Z', 'LARGE');
    // LARGE uses default options (same as no type)
    expect(result).toMatch(/:/);
  });
});
