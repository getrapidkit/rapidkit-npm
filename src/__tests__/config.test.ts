import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTestRapidKitPath } from '../config.js';
import type { UserConfig } from '../config.js';

describe('getTestRapidKitPath', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.RAPIDKIT_DEV_PATH;
  });

  it('should return environment variable if set', () => {
    process.env.RAPIDKIT_DEV_PATH = '/test/env/path';
    const config: UserConfig = { testRapidKitPath: '/test/config/path' };

    const result = getTestRapidKitPath(config);
    expect(result).toBe('/test/env/path');
  });

  it('should return config path if env is not set', () => {
    delete process.env.RAPIDKIT_DEV_PATH;
    const config: UserConfig = { testRapidKitPath: '/test/config/path' };

    const result = getTestRapidKitPath(config);
    expect(result).toBe('/test/config/path');
  });

  it('should return undefined if neither is set', () => {
    delete process.env.RAPIDKIT_DEV_PATH;
    const config: UserConfig = {};

    const result = getTestRapidKitPath(config);
    expect(result).toBeUndefined();
  });

  it('should prioritize env over config', () => {
    process.env.RAPIDKIT_DEV_PATH = '/priority/env';
    const config: UserConfig = { testRapidKitPath: '/priority/config' };

    const result = getTestRapidKitPath(config);
    expect(result).toBe('/priority/env');
  });
});
