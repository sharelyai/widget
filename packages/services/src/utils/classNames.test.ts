import { describe, it, expect } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('joins string arguments', () => {
    expect(classNames('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(classNames('foo', null, undefined, false, '', 'bar')).toBe('foo bar');
  });

  it('includes keys with truthy values from objects', () => {
    expect(classNames({ active: true, disabled: false })).toBe('active');
  });

  it('combines strings and objects', () => {
    expect(classNames('base', { highlight: true, hidden: false })).toBe('base highlight');
  });

  it('returns empty string when no valid args', () => {
    expect(classNames(null, undefined, false)).toBe('');
  });
});
