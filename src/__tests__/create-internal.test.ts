import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fsExtra from 'fs-extra';
import { execa } from 'execa';
import inquirer from 'inquirer';
import { promises as fsPromises } from 'fs';
import { createProject } from '../create';
import {
  DirectoryExistsError,
  PoetryNotFoundError,
  PipxNotFoundError,
  InstallationError,
} from '../errors';

vi.mock('fs-extra');
vi.mock('execa');
vi.mock('inquirer');
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    text: '',
  })),
}));

describe('Create Module - Internal Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fsExtra.pathExists).mockResolvedValue(false);
    vi.mocked(fsExtra.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fsExtra.outputFile).mockResolvedValue(undefined);
    vi.spyOn(fsPromises, 'readFile').mockResolvedValue('');
    vi.spyOn(fsPromises, 'writeFile').mockResolvedValue(undefined);
  });

  describe('Poetry Installation Flow', () => {
    it('should install RapidKit with Poetry successfully', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command === 'poetry' && args?.[0] === '--version') {
          return Promise.resolve({ stdout: 'Poetry 1.7.0', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'poetry' && args?.[0] === 'init') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'poetry' && args?.[0] === 'add') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'git') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.reject(new Error('Unknown command'));
      });

      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]\nname = "test"');

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('poetry', ['--version']);
      expect(execa).toHaveBeenCalledWith(
        'poetry',
        ['init', '--no-interaction', '--python', '^3.11'],
        expect.any(Object)
      );
      expect(execa).toHaveBeenCalledWith('poetry', ['add', 'rapidkit'], expect.any(Object));
    });

    it('should check for Poetry before installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: 'Poetry 1.7.0', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('poetry', ['--version']);
    });

    it('should install from local path in test mode', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      process.env.RAPIDKIT_DEV_PATH = '/local/rapidkit/path';

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command === 'poetry' && args?.[0] === '--version') {
          return Promise.resolve({ stdout: 'Poetry 1.7.0', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'poetry' && args?.[0] === 'add' && args?.[1] === '/local/rapidkit/path') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]\nname = "test"');

      await createProject('test-project', { testMode: true });

      expect(execa).toHaveBeenCalledWith(
        'poetry',
        ['add', '/local/rapidkit/path'],
        expect.any(Object)
      );

      delete process.env.RAPIDKIT_DEV_PATH;
    });

    it('should handle test mode with local path correctly', async () => {
      process.env.RAPIDKIT_DEV_PATH = '/local/rapidkit';

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', { testMode: true });

      // Should succeed with local path
      expect(execa).toHaveBeenCalled();

      delete process.env.RAPIDKIT_DEV_PATH;
    });

    it('should update pyproject.toml with package-mode = false', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);

      const mockReadFile = vi.spyOn(fsPromises, 'readFile');
      const mockWriteFile = vi.spyOn(fsPromises, 'writeFile');

      mockReadFile.mockResolvedValue('[tool.poetry]\nname = "test"\nversion = "0.1.0"');

      await createProject('test-project', {});

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('pyproject.toml'),
        expect.stringContaining('package-mode = false'),
        'utf-8'
      );
    });
  });

  describe('Venv Installation Flow', () => {
    it('should install RapidKit with venv successfully', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'venv',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command === 'python3' && args?.[0] === '--version') {
          return Promise.resolve({ stdout: 'Python 3.11.5', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'python3' && args?.[0] === '-m' && args?.[1] === 'venv') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        if (args?.[0] === 'install') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('python3', ['--version']);
      expect(execa).toHaveBeenCalledWith(
        'python3',
        ['-m', 'venv', '.venv'],
        expect.any(Object)
      );
    });

    it('should throw error when Python not found', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'venv',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command === 'python3' && args?.[0] === '--version') {
          return Promise.reject(new Error('Command not found: python3'));
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await expect(createProject('test-project', {})).rejects.toThrow();
    });

    it('should install from local path in venv test mode', async () => {
      process.env.RAPIDKIT_DEV_PATH = '/local/rapidkit';

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'venv',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command.includes('pip') && args?.[0] === 'install' && args?.[1] === '-e') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await createProject('test-project', { testMode: true });

      // Verify editable install was called
      expect(execa).toHaveBeenCalledWith(
        expect.stringContaining('pip'),
        ['install', '-e', '/local/rapidkit'],
        expect.any(Object)
      );

      delete process.env.RAPIDKIT_DEV_PATH;
    });
  });

  describe('Pipx Installation Flow', () => {
    it('should install RapidKit with pipx successfully', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'pipx',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command === 'pipx' && args?.[0] === '--version') {
          return Promise.resolve({ stdout: 'pipx 1.2.0', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'pipx' && args?.[0] === 'install') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('pipx', ['--version']);
      expect(execa).toHaveBeenCalledWith('pipx', ['install', 'rapidkit']);
    });

    it('should check for pipx before installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'pipx',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: 'pipx 1.2.0', stderr: '', exitCode: 0 } as any);

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('pipx', ['--version']);
    });

    it('should install editable with pipx in test mode', async () => {
      process.env.RAPIDKIT_DEV_PATH = '/local/rapidkit';

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'pipx',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command === 'pipx' && args?.[0] === 'install' && args?.[1] === '-e') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await createProject('test-project', { testMode: true });

      expect(execa).toHaveBeenCalledWith('pipx', ['install', '-e', '/local/rapidkit']);

      delete process.env.RAPIDKIT_DEV_PATH;
    });
  });

  describe('README Creation', () => {
    it('should create .gitignore with Poetry installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', {});

      expect(fsExtra.outputFile).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should create .gitignore with venv installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'venv',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);

      await createProject('test-project', {});

      expect(fsExtra.outputFile).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should create files with pipx installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'pipx',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);

      await createProject('test-project', {});

      // pipx creates .rapidkit-global file
      expect(fsExtra.outputFile).toHaveBeenCalled();
    });
  });

  describe('Git Integration', () => {
    it('should initialize git repository by default', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('git', ['init'], expect.any(Object));
    });

    it('should skip git when skipGit is true', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', { skipGit: true });

      const gitCalls = vi.mocked(execa).mock.calls.filter(call => call[0] === 'git');
      expect(gitCalls.length).toBe(0);
    });

    it('should create .gitignore file', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', {});

      expect(fsExtra.outputFile).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        expect.stringContaining('__pycache__'),
        'utf-8'
      );
    });
  });

  describe('Directory Management', () => {
    it('should throw error if directory already exists', async () => {
      vi.mocked(fsExtra.pathExists).mockResolvedValue(true);

      await expect(createProject('existing-project', {})).rejects.toThrow(DirectoryExistsError);
    });

    it('should create directory if it does not exist', async () => {
      vi.mocked(fsExtra.pathExists).mockResolvedValue(false);
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'poetry',
      });
      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('new-project', {});

      expect(fsExtra.ensureDir).toHaveBeenCalled();
    });
  });

  describe('User Config Integration', () => {
    it('should use userConfig default python version', async () => {
      const userConfig = {
        pythonVersion: '3.12',
        defaultInstallMethod: 'poetry' as const,
      };

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.12',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', { userConfig });

      expect(inquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'pythonVersion',
            default: '3.12',
          }),
        ])
      );
    });

    it('should use userConfig default install method', async () => {
      const userConfig = {
        pythonVersion: '3.11',
        defaultInstallMethod: 'pipx' as const,
      };

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
        installMethod: 'pipx',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);

      await createProject('test-project', { userConfig });

      expect(inquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'installMethod',
            default: 'pipx',
          }),
        ])
      );
    });
  });
});
