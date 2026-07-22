import { describe, it, expect } from 'vitest';
import { regex } from './regex';

describe('regex', () => {
  it('EMAIL matches valid emails', () => {
    expect(regex.EMAIL.test('user@example.com')).toBe(true);
    expect(regex.EMAIL.test('not-an-email')).toBe(false);
  });

  it('CHECK_URL matches http/https URLs', () => {
    expect(regex.CHECK_URL.test('https://example.com')).toBe(true);
    expect(regex.CHECK_URL.test('ftp://example.com')).toBe(false);
  });

  it('CHECK_TEMPORAL_USER matches You or Anonymous', () => {
    expect(regex.CHECK_TEMPORAL_USER.test('You')).toBe(true);
    expect(regex.CHECK_TEMPORAL_USER.test('Anonymous')).toBe(true);
    expect(regex.CHECK_TEMPORAL_USER.test('John')).toBe(false);
  });

  it('PAGE_NUMBER_DOCUMENT_DOWNLOAD matches pageNum:filename:uuid format', () => {
    const match = '3:report.pdf:abc12345-1234-1234-1234-123456789abc'.match(
      regex.PAGE_NUMBER_DOCUMENT_DOWNLOAD,
    );
    expect(match).not.toBeNull();
    expect(match![1]).toBe('3');
    expect(match![2]).toBe('report.pdf');
  });

  it('SHARELYAI_TAGS matches opening and closing sharelyai tags', () => {
    const text = '<sharelyai_start>content</sharelyai_end>';
    expect(regex.SHARELYAI_TAGS.test(text)).toBe(true);
  });

  it('API_LOADING_MESSAGE matches !API! marker', () => {
    expect(regex.API_LOADING_MESSAGE.test('some !API! text')).toBe(true);
  });
});
