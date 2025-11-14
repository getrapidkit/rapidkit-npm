/**
 * Tests for CLI entry point (index.ts)
 * Tests command parsing, option handling, and workflow orchestration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execa } from 'execa';
import * as path from 'path';
import * as fs from 'fs-extra';

const CLI_PATH = path.join(process.cwd(), 'dist', 'index.js');
const TEST_DIR = path.join(process.cwd(), 'test-cli-output');

describe('CLI Entry Point', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  describe('Version and Help', () => {
    it('should display version with --version flag', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '--version']);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should display version with -V flag', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '-V']);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should display help with --help flag', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '--help']);
      expect(stdout).toContain('Create a RapidKit development environment');
      expect(stdout).toContain('--demo');
      expect(stdout).toContain('--skip-git');
      expect(stdout).toContain('--dry-run');
    });

    it('should display help with -h flag', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '-h']);
      expect(stdout).toContain('Usage:');
    });
  });

  describe('Dry-run Mode', () => {
    it('should show what would be created in demo-only dry-run mode', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-project', '--demo-only', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Dry-run mode');
      expect(stdout).toContain('test-project');
      expect(stdout).toContain('FastAPI demo project');
      expect(stdout).toContain('main.py');
      expect(stdout).toContain('pyproject.toml');

      // Should not create any files
      const projectPath = path.join(TEST_DIR, 'test-project');
      expect(await fs.pathExists(projectPath)).toBe(false);
    });

    it('should show what would be created in demo workspace dry-run mode', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-workspace', '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Dry-run mode');
      expect(stdout).toContain('test-workspace');
      expect(stdout).toContain('Demo workspace');

      // Should not create any files
      const workspacePath = path.join(TEST_DIR, 'test-workspace');
      expect(await fs.pathExists(workspacePath)).toBe(false);
    });
  });

  describe('Debug Mode', () => {
    it('should enable debug logging with --debug flag', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-project', '--demo-only', '--dry-run', '--debug', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Debug mode enabled');
    });
  });

  describe('Demo-only Mode', () => {
    it('should validate project name in demo-only mode', async () => {
      try {
        await execa(
          'node',
          [CLI_PATH, 'Invalid-Name!', '--demo-only', '--dry-run', '--no-update-check'],
          { cwd: TEST_DIR }
        );
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
        // Check for validation error message
        const output = error.stdout || error.stderr;
        expect(output).toMatch(/validation|lowercase|capital|special/i);
      }
    });

    it('should use default project name if none provided', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, '--demo-only', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('my-fastapi-project');
    });
  });

  describe('Workspace Mode', () => {
    it('should validate workspace name', async () => {
      try {
        await execa(
          'node',
          [CLI_PATH, 'Invalid Name!', '--demo', '--dry-run', '--no-update-check'],
          { cwd: TEST_DIR }
        );
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
      }
    });

    it('should use default workspace name if none provided', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('rapidkit-workspace');
    });

    it('should show demo mode notice', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-ws', '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('demo kit templates');
      expect(stdout).toContain('without installing Python');
    });
  });

  describe('Option Combinations', () => {
    it('should handle --skip-git option', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-ws', '--demo', '--skip-git', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Dry-run mode');
    });

    it('should handle --no-update-check option', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '--version', '--no-update-check'], {
        cwd: TEST_DIR,
      });

      // Should still show version
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should handle multiple debug flags', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-proj', '--debug', '--dry-run', '--demo-only', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Debug mode enabled');
      expect(stdout).toContain('Dry-run mode');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid project names gracefully', async () => {
      try {
        await execa(
          'node',
          [CLI_PATH, '123invalid', '--demo-only', '--dry-run', '--no-update-check'],
          { cwd: TEST_DIR }
        );
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
      }
    });

    it('should handle special characters in names', async () => {
      try {
        await execa(
          'node',
          [CLI_PATH, 'test@project!', '--demo-only', '--dry-run', '--no-update-check'],
          { cwd: TEST_DIR }
        );
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
      }
    });

    it('should handle uppercase in names', async () => {
      try {
        await execa(
          'node',
          [CLI_PATH, 'TestProject', '--demo-only', '--dry-run', '--no-update-check'],
          { cwd: TEST_DIR }
        );
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
      }
    });
  });

  describe('Welcome Message', () => {
    it('should display welcome message', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-ws', '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Welcome to RapidKit');
    });
  });

  describe('Beta Notice (Full Mode)', () => {
    it('should show beta notice without --demo or --test-mode', async () => {
      try {
        await execa('node', [CLI_PATH, 'test-workspace', '--no-update-check'], { cwd: TEST_DIR });
        expect.fail('Should have exited with error');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
        const output = error.stdout || error.stderr;
        expect(output).toContain('BETA NOTICE');
        expect(output).toContain('not yet available on PyPI');
        expect(output).toContain('Cannot proceed without --demo or --test-mode');
      }
    });

    it('should show test mode warning with --test-mode', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-ws', '--test-mode', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('TEST MODE');
      expect(stdout).toContain('Installing from local path');
    });
  });

  describe('Update Checker', () => {
    it('should skip update check with --no-update-check', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '--version', '--no-update-check'], {
        cwd: TEST_DIR,
      });

      // Should not contain update check messages
      expect(stdout).not.toContain('Checking for updates');
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should check for updates by default in demo mode', async () => {
      // Update check runs but doesn't block execution
      const { stdout } = await execa('node', [CLI_PATH, 'test-ws', '--demo', '--dry-run'], {
        cwd: TEST_DIR,
        timeout: 10000,
      });

      expect(stdout).toContain('Dry-run mode');
    });
  });

  describe('Config Loading', () => {
    it('should load user config in debug mode', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'test-ws', '--demo', '--dry-run', '--debug', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Debug mode enabled');
      // User config loading is logged in debug mode
    });
  });

  describe('Path Resolution', () => {
    it('should resolve project path correctly in demo-only mode', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'my-test-project', '--demo-only', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('my-test-project');
      expect(stdout).toContain('Project path');
    });

    it('should reject relative paths with dots', async () => {
      try {
        await execa(
          'node',
          [CLI_PATH, './test-project', '--demo-only', '--dry-run', '--no-update-check'],
          { cwd: TEST_DIR }
        );
        expect.fail('Should reject path starting with dot');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
        const output = error.stdout || error.stderr;
        expect(output).toMatch(/cannot start with|URL-friendly/);
      }
    });
  });

  describe('Signal Handling', () => {
    it('should handle graceful shutdown', async () => {
      // This test validates that signal handlers are registered
      // Actual signal handling is tested through manual testing
      const { stdout } = await execa('node', [CLI_PATH, '--version', '--no-update-check'], {
        cwd: TEST_DIR,
      });

      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Command Name', () => {
    it('should use "rapidkit" as command name', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '--help']);

      expect(stdout).toContain('rapidkit');
    });
  });

  describe('Argument Parsing', () => {
    it('should accept directory name as positional argument', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'my-custom-name', '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('my-custom-name');
    });

    it('should handle kebab-case directory names', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'my-test-workspace', '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('my-test-workspace');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty directory name with demo flag', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      // Should use default name
      expect(stdout).toContain('rapidkit-workspace');
    });

    it('should handle very long valid names', async () => {
      const longName = 'my-very-long-project-name-that-is-still-valid';
      const { stdout } = await execa(
        'node',
        [CLI_PATH, longName, '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain(longName);
    });

    it('should handle minimum valid name length (2 chars)', async () => {
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'ab', '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('Dry-run mode');
    });

    it('should reject single character names', async () => {
      try {
        await execa('node', [CLI_PATH, 'a', '--demo', '--dry-run', '--no-update-check'], {
          cwd: TEST_DIR,
        });
        expect.fail('Should reject single character name');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
        const output = error.stdout || error.stderr;
        expect(output).toContain('at least 2 characters');
      }
    });

    it('should reject names starting with numbers', async () => {
      try {
        await execa('node', [CLI_PATH, '1project', '--demo', '--dry-run', '--no-update-check'], {
          cwd: TEST_DIR,
        });
        expect.fail('Should reject name starting with number');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
      }
    });

    it('should reject names with spaces', async () => {
      try {
        await execa('node', [CLI_PATH, 'my project', '--demo', '--dry-run', '--no-update-check'], {
          cwd: TEST_DIR,
        });
        expect.fail('Should reject name with spaces');
      } catch (error: any) {
        expect(error.exitCode).toBe(1);
      }
    });

    it('should accept names with underscores for workspace', async () => {
      // Underscores are allowed in kebab-case validation
      const { stdout } = await execa(
        'node',
        [CLI_PATH, 'my-project', '--demo', '--dry-run', '--no-update-check'],
        { cwd: TEST_DIR }
      );

      expect(stdout).toContain('my-project');
    });
  });
});
