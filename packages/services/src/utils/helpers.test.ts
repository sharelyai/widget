// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { setCSSVariables } from './helpers';

describe('setCSSVariables', () => {
  it('returns CSS variable string for flat object with prefix', () => {
    const result = setCSSVariables({ primaryColor: '#fff' }, 'theme-');
    expect(result).toContain('--theme-primary-color: #fff;');
  });

  it('handles nested objects recursively', () => {
    const result = setCSSVariables({ button: { bg: 'red' } }, 'ui-');
    expect(result).toContain('--ui-button-bg: red;');
  });

  it('appends a style element to document head when no prefix', () => {
    const before = document.head.querySelectorAll('style').length;
    setCSSVariables({ fontSize: '14px' });
    const after = document.head.querySelectorAll('style').length;
    expect(after).toBe(before + 1);
  });
});
