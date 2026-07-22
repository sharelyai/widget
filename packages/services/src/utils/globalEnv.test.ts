import { describe, it, expect, beforeEach } from 'vitest';
import { setGlobalEnv, getGlobalEnv, getGlobalEnvStatus, getGlobalEnvHeaders } from './globalEnv';

describe('globalEnv', () => {
  beforeEach(() => {
    setGlobalEnv(null);
  });

  it('getGlobalEnv returns null by default', () => {
    expect(getGlobalEnv()).toBeNull();
  });

  it('setGlobalEnv / getGlobalEnv round-trips', () => {
    setGlobalEnv('DEV');
    expect(getGlobalEnv()).toBe('DEV');
  });

  it('getGlobalEnvStatus returns matching status', () => {
    setGlobalEnv('STAGING');
    expect(getGlobalEnvStatus()).toBe('PUBLISHED_UAT');
  });

  it('getGlobalEnvStatus returns null for unknown env', () => {
    setGlobalEnv('UNKNOWN');
    expect(getGlobalEnvStatus()).toBeNull();
  });

  it('getGlobalEnvHeaders returns header when env is set', () => {
    setGlobalEnv('PROD');
    expect(getGlobalEnvHeaders()).toEqual({ 'x-sharely-environment': 'PUBLISHED' });
  });
});
