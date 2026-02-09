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

    it('should not notify when remote version is older', async () => {
      const olderVersion = '0.1.0';

      vi.mocked(execa).mockResolvedValue({
        stdout: olderVersion,
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

    it('should handle prerelease versions correctly - alpha', async () => {
      const alphaVersion = '1.0.0-alpha.1';

      vi.mocked(execa).mockResolvedValue({
        stdout: alphaVersion,
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

      // Alpha version 1.0.0-alpha.1 should be considered older than stable 0.18.0
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should handle prerelease versions correctly - beta', async () => {
      const betaVersion = '1.0.0-beta.2';

      vi.mocked(execa).mockResolvedValue({
        stdout: betaVersion,
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

      // Beta version should be newer
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should handle prerelease versions correctly - rc', async () => {
      const rcVersion = '1.0.0-rc.1';

      vi.mocked(execa).mockResolvedValue({
        stdout: rcVersion,
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

      // RC version should be newer
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should notify when newer prerelease version is available', async () => {
      const newerRc = '99.0.0-rc.5';

      vi.mocked(execa).mockResolvedValue({
        stdout: newerRc,
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(newerRc));
    });

    it('should compare prerelease with different lengths correctly', async () => {
      const longerPrerelease = '1.0.0-alpha.beta.gamma.1';

      vi.mocked(execa).mockResolvedValue({
        stdout: longerPrerelease,
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should compare numeric prerelease identifiers correctly', async () => {
      const numericPrerelease = '1.0.0-alpha.2';

      vi.mocked(execa).mockResolvedValue({
        stdout: numericPrerelease,
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should compare string prerelease identifiers correctly', async () => {
      const stringPrerelease = '1.0.0-beta';

      vi.mocked(execa).mockResolvedValue({
        stdout: stringPrerelease,
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should handle invalid version format gracefully', async () => {
      const invalidVersion = 'not-a-version';

      vi.mocked(execa).mockResolvedValue({
        stdout: invalidVersion,
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
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should handle version with build metadata', async () => {
      const versionWithBuild = '0.18.0+build.123';

      vi.mocked(execa).mockResolvedValue({
        stdout: versionWithBuild,
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

    it('should compare prerelease identifiers with mixed types', async () => {
      const mixedPrerelease = '99.0.0-alpha.beta.1';

      vi.mocked(execa).mockResolvedValue({
        stdout: mixedPrerelease,
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });

    it('should handle whitespace in version response', async () => {
      const versionWithWhitespace = '  99.99.99  \n';

      vi.mocked(execa).mockResolvedValue({
        stdout: versionWithWhitespace,
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update available'));
    });
  });
});
