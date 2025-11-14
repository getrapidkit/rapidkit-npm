import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkForUpdates, getVersion } from '../update-checker.js';
import { execa } from 'execa';

// Mock execa
vi.mock('execa');

describe('Update Checker', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('getVersion', () => {
    it('should return the current package version', () => {
      const version = getVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
      expect(version).toMatch(/^\d+\.\d+\.\d+/); // Semver format
    });
  });

  describe('checkForUpdates', () => {
    it('should notify when a newer version is available', async () => {
      const _currentVersion = getVersion();
      const newerVersion = '99.99.99';

      vi.mocked(execa).mockResolvedValue({
        stdout: newerVersion,
        stderr: '',
        exitCode: 0,
        command: '',
        failed: false,
        killed: false,
        signal: undefined,
        signalDescription: undefined,
        cwd: '',
        durationMs: 0,
        isCanceled: false,
        escapedCommand: '',
        pipedFrom: [],
        all: undefined,
      });

      await checkForUpdates();

      expect(execa).toHaveBeenCalledWith('npm', ['view', 'rapidkit', 'version'], {
        timeout: 3000,
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(newerVersion));
    });

    it('should not notify when on latest version', async () => {
      const currentVersion = getVersion();

      vi.mocked(execa).mockResolvedValue({
        stdout: currentVersion,
        stderr: '',
        exitCode: 0,
        command: '',
        failed: false,
        killed: false,
        signal: undefined,
        signalDescription: undefined,
        cwd: '',
        durationMs: 0,
        isCanceled: false,
        escapedCommand: '',
        pipedFrom: [],
        all: undefined,
      });

      await checkForUpdates();

      expect(execa).toHaveBeenCalledWith('npm', ['view', 'rapidkit', 'version'], {
        timeout: 3000,
      });
      // Should not show update notification
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should handle network errors gracefully', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(checkForUpdates()).resolves.not.toThrow();

      // Should not show error to user
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('error'));
    });

    it('should handle timeout gracefully', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Timeout'));

      await expect(checkForUpdates()).resolves.not.toThrow();
    });

    it('should handle npm command not found gracefully', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Command not found: npm'));

      await expect(checkForUpdates()).resolves.not.toThrow();
    });

    it('should handle empty response gracefully', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
        command: '',
        failed: false,
        killed: false,
        signal: undefined,
        signalDescription: undefined,
        cwd: '',
        durationMs: 0,
        isCanceled: false,
        escapedCommand: '',
        pipedFrom: [],
        all: undefined,
      });

      await expect(checkForUpdates()).resolves.not.toThrow();
    });
  });
});
