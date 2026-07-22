// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookieManager } from './cookieManager';
import Cookies from 'js-cookie';

vi.mock('js-cookie', () => {
  const store: Record<string, string> = {};
  return {
    default: {
      set: vi.fn((key: string, value: string) => { store[key] = value; }),
      get: vi.fn((key?: string) => key ? store[key] : { ...store }),
      remove: vi.fn((key: string) => { delete store[key]; }),
    },
  };
});

describe('cookieManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCookieName joins keys filtering out undefined', () => {
    expect(cookieManager.getCookieName(['a', undefined, 'b'])).toBe('a-b');
  });

  it('set delegates to Cookies.set', () => {
    cookieManager.set('key', 'val');
    expect(Cookies.set).toHaveBeenCalledWith('key', 'val', undefined);
  });

  it('get delegates to Cookies.get', () => {
    cookieManager.get('key');
    expect(Cookies.get).toHaveBeenCalledWith('key');
  });

  it('getAllMatching filters cookies by pattern', () => {
    (Cookies.get as ReturnType<typeof vi.fn>).mockReturnValue({ 'sharely-token': 'abc', 'other': 'def' });
    const result = cookieManager.getAllMatching(/^sharely/);
    expect(result).toEqual({ 'sharely-token': 'abc' });
  });
});
