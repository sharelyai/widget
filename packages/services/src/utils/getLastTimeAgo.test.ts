import { describe, it, expect, vi, afterEach } from 'vitest';
import { getLastTimeAgo } from './getLastTimeAgo';

describe('getLastTimeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const setNow = (date: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(date));
  };

  it('returns "just now" for times less than a minute ago', () => {
    setNow('2024-01-01T12:00:30Z');
    expect(getLastTimeAgo('2024-01-01T12:00:00Z')).toBe('just now');
  });

  it('returns minutes ago', () => {
    setNow('2024-01-01T12:05:00Z');
    expect(getLastTimeAgo('2024-01-01T12:00:00Z')).toBe('5 m ago');
  });

  it('returns hours ago', () => {
    setNow('2024-01-01T15:00:00Z');
    expect(getLastTimeAgo('2024-01-01T12:00:00Z')).toBe('3 hour ago');
  });

  it('returns days ago', () => {
    setNow('2024-01-04T12:00:00Z');
    expect(getLastTimeAgo('2024-01-01T12:00:00Z')).toBe('3 day ago');
  });

  it('returns weeks ago', () => {
    setNow('2024-01-22T12:00:00Z');
    expect(getLastTimeAgo('2024-01-01T12:00:00Z')).toBe('3 week ago');
  });

  it('returns months ago', () => {
    setNow('2024-04-01T12:00:00Z');
    expect(getLastTimeAgo('2024-01-01T12:00:00Z')).toBe('3 month ago');
  });

  it('returns years ago', () => {
    setNow('2026-01-01T12:00:00Z');
    expect(getLastTimeAgo('2024-01-01T12:00:00Z')).toBe('2 year ago');
  });
});
