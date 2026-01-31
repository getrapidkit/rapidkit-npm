import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fsExtra from 'fs-extra';
import { execa } from 'execa';
import inquirer from 'inquirer';
import { promises as fsPromises } from 'fs';
import { createProject } from '../create';
import { getPythonCommand } from '../utils';
import { DirectoryExistsError, PythonNotFoundError } from '../errors';

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
        pythonVersion: '3.10',
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
        ['init', '--no-interaction', '--python', '^3.10'],
        expect.any(Object)
      );
      expect(execa).toHaveBeenCalledWith('poetry', ['add', 'rapidkit-core'], expect.any(Object));
    });

    it('should check for Poetry before installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({
        stdout: 'Poetry 1.7.0',
        stderr: '',
        exitCode: 0,
      } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('poetry', ['--version']);
    });

    it('should install from local path in test mode', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
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
        pythonVersion: '3.10',
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
        pythonVersion: '3.10',
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

    it('should prompt to install Poetry with pipx when missing', async () => {
      // Route prompt responses by question name to avoid leaking mockResolvedValueOnce
      // into subsequent tests if something changes.
      vi.mocked(inquirer.prompt).mockImplementation(async (questions: any) => {
        const names = Array.isArray(questions) ? questions.map((q) => q?.name) : [];
        if (names.includes('installPoetry')) {
          return { installPoetry: true } as any;
        }
        return {
          pythonVersion: '3.10',
          installMethod: 'poetry',
        } as any;
      });

      let poetryVersionChecks = 0;
      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        if (command === 'poetry' && args?.[0] === '--version') {
          // First check fails (missing), subsequent checks succeed.
          if (poetryVersionChecks === 0) {
            poetryVersionChecks += 1;
            return Promise.reject(new Error('Command not found: poetry'));
          }
          poetryVersionChecks += 1;
          return Promise.resolve({ stdout: 'Poetry 2.0.0', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'pipx' && args?.[0] === '--version') {
          return Promise.resolve({ stdout: '1.4.0', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'pipx' && args?.[0] === 'install' && args?.[1] === 'poetry') {
          return Promise.resolve({ stdout: 'installed', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'poetry' && args?.[0] === 'init') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'poetry' && args?.[0] === 'add') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]\nname = "test"');

      await createProject('test-project', {});

      // Confirm we offered to install Poetry, then used pipx.
      expect(inquirer.prompt).toHaveBeenCalledTimes(2);
      expect(execa).toHaveBeenCalledWith('pipx', ['install', 'poetry']);
    });

    it('should prompt to install pipx when missing (for Poetry install)', async () => {
      // 1) choose poetry, 2) confirm installPoetry, 3) confirm installPipx
      vi.mocked(inquirer.prompt).mockImplementation(async (questions: any) => {
        const names = Array.isArray(questions) ? questions.map((q) => q?.name) : [];
        if (names.includes('installPoetry')) return { installPoetry: true } as any;
        if (names.includes('installPipx')) return { installPipx: true } as any;
        return { pythonVersion: '3.10', installMethod: 'poetry' } as any;
      });

      let poetryVersionChecks = 0;
      let pipxBinaryChecks = 0;
      let pipxModuleAvailable = false;
      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        // Poetry is missing first, then available.
        if (command === 'poetry' && args?.[0] === '--version') {
          if (poetryVersionChecks === 0) {
            poetryVersionChecks += 1;
            return Promise.reject(new Error('Command not found: poetry'));
          }
          poetryVersionChecks += 1;
          return Promise.resolve({ stdout: 'Poetry 2.0.0', stderr: '', exitCode: 0 } as any);
        }

        // pipx binary is missing.
        if (command === 'pipx' && args?.[0] === '--version') {
          pipxBinaryChecks += 1;
          return Promise.reject(new Error('Command not found: pipx'));
        }

        // python3 -m pipx becomes available after we "install" it.
        if (command === 'python3' && args?.[0] === '-m' && args?.[1] === 'pipx') {
          if (args?.[2] === '--version') {
            if (!pipxModuleAvailable) {
              return Promise.reject(new Error('No module named pipx'));
            }
            return Promise.resolve({ stdout: '1.4.0', stderr: '', exitCode: 0 } as any);
          }
          if (args?.[2] === 'install' && args?.[3] === 'poetry') {
            return Promise.resolve({ stdout: 'installed', stderr: '', exitCode: 0 } as any);
          }
          if (args?.[2] === 'upgrade' && args?.[3] === 'poetry') {
            return Promise.resolve({ stdout: 'upgraded', stderr: '', exitCode: 0 } as any);
          }
        }

        // pip install --user pipx
        if (command === 'python3' && args?.[0] === '-m' && args?.[1] === 'pip') {
          pipxModuleAvailable = true;
          return Promise.resolve({ stdout: 'ok', stderr: '', exitCode: 0 } as any);
        }

        if (command === 'poetry' && args?.[0] === 'init') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        if (command === 'poetry' && args?.[0] === 'add') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }

        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]\nname = "test"');

      await createProject('test-project', {});

      expect(pipxBinaryChecks).toBeGreaterThan(0);
      // We should have prompted for both: installing pipx and installing poetry.
      const promptCalls = vi.mocked(inquirer.prompt).mock.calls;
      const askedNames = promptCalls
        .flatMap(([questions]) => (Array.isArray(questions) ? questions : [questions]))
        .map((q: any) => q?.name)
        .filter(Boolean);

      expect(askedNames).toContain('installPipx');
      expect(askedNames).toContain('installPoetry');
      expect(execa).toHaveBeenCalledWith(expect.stringMatching(/^python(3)?$/), [
        '-m',
        'pip',
        'install',
        '--user',
        '--upgrade',
        'pipx',
      ]);
      expect(execa).toHaveBeenCalledWith(expect.stringMatching(/^python(3)?$/), [
        '-m',
        'pipx',
        'install',
        'poetry',
      ]);
    });
  });

  describe('Venv Installation Flow', () => {
    it('should install RapidKit with venv successfully', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
        installMethod: 'venv',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        // Handle version checks
        if (args?.[0] === '--version') {
          return Promise.resolve({ stdout: 'Python 3.10', stderr: '', exitCode: 0 } as any);
        }
        // Handle venv creation
        if (args?.[0] === '-m' && args?.[1] === 'venv') {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        // Handle pip operations (now via python -m pip)
        if (args?.includes('-m') && args?.includes('pip')) {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await createProject('test-project', {});

      // Accept either python3 or python depending on OS
      const pythonCmd = getPythonCommand();
      expect(execa).toHaveBeenCalledWith(pythonCmd, ['--version']);
      expect(execa).toHaveBeenCalledWith(pythonCmd, ['-m', 'venv', '.venv'], expect.any(Object));
    });

    it('should throw error when Python not found', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
        installMethod: 'venv',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        // Reject on any python --version call (both python and python3)
        if ((command === 'python' || command === 'python3') && args?.[0] === '--version') {
          return Promise.reject(new Error('Command not found: python'));
        }
        // Return success for other commands to avoid unrelated failures
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await expect(createProject('test-project', {})).rejects.toThrow(PythonNotFoundError);
    });

    it('should install from local path in venv test mode', async () => {
      process.env.RAPIDKIT_DEV_PATH = '/local/rapidkit';

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
        installMethod: 'venv',
      });

      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        // Mock python -m pip install calls
        if (args?.includes('-m') && args?.includes('pip') && args?.includes('install')) {
          return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
        }
        // Also need to handle version checks and venv creation
        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await createProject('test-project', { testMode: true });

      // Verify editable install was called with python -m pip (not direct pip)
      expect(execa).toHaveBeenCalledWith(
        expect.stringMatching(/python/),
        expect.arrayContaining(['-m', 'pip', 'install', '-e', '/local/rapidkit']),
        expect.any(Object)
      );

      delete process.env.RAPIDKIT_DEV_PATH;
    });
  });

  describe('Pipx Installation Flow', () => {
    it('should install RapidKit with pipx successfully', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
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
      expect(execa).toHaveBeenCalledWith('pipx', ['install', 'rapidkit-core']);
    });

    it('should check for pipx before installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
        installMethod: 'pipx',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: 'pipx 1.2.0', stderr: '', exitCode: 0 } as any);

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('pipx', ['--version']);
    });

    it('should install editable with pipx in test mode', async () => {
      process.env.RAPIDKIT_DEV_PATH = '/local/rapidkit';

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
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

    it('should prompt to install pipx when missing (for pipx install)', async () => {
      vi.mocked(inquirer.prompt).mockImplementation(async (questions: any) => {
        const names = Array.isArray(questions) ? questions.map((q) => q?.name) : [];
        if (names.includes('installPipx')) return { installPipx: true } as any;
        return { pythonVersion: '3.10', installMethod: 'pipx' } as any;
      });

      let pipxModuleAvailable = false;
      vi.mocked(execa).mockImplementation((command: string, args?: readonly string[]) => {
        // pipx binary missing
        if (command === 'pipx' && args?.[0] === '--version') {
          return Promise.reject(new Error('Command not found: pipx'));
        }

        // python3 -m pipx only works after we "install" pipx
        if (command === 'python3' && args?.[0] === '-m' && args?.[1] === 'pipx') {
          if (!pipxModuleAvailable) {
            return Promise.reject(new Error('No module named pipx'));
          }
          return Promise.resolve({ stdout: '1.4.0', stderr: '', exitCode: 0 } as any);
        }

        // pip install --user pipx flips availability
        if (command === 'python3' && args?.[0] === '-m' && args?.[1] === 'pip') {
          pipxModuleAvailable = true;
          return Promise.resolve({ stdout: 'ok', stderr: '', exitCode: 0 } as any);
        }

        // install rapidkit-core via python -m pipx
        if (
          command === 'python3' &&
          args?.[0] === '-m' &&
          args?.[1] === 'pipx' &&
          args?.[2] === 'install'
        ) {
          return Promise.resolve({ stdout: 'installed', stderr: '', exitCode: 0 } as any);
        }

        return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 } as any);
      });

      await createProject('test-project', {});

      // Accept both python and python3 (platform-dependent)
      expect(execa).toHaveBeenCalledWith(expect.stringMatching(/^python(3)?$/), [
        '-m',
        'pip',
        'install',
        '--user',
        '--upgrade',
        'pipx',
      ]);
      expect(execa).toHaveBeenCalledWith(expect.stringMatching(/^python(3)?$/), [
        '-m',
        'pipx',
        'install',
        'rapidkit-core',
      ]);
    });
  });

  describe('README Creation', () => {
    it('should create .gitignore with Poetry installation', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
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
        pythonVersion: '3.10',
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
        pythonVersion: '3.10',
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
        pythonVersion: '3.10',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', {});

      expect(execa).toHaveBeenCalledWith('git', ['init'], expect.any(Object));
    });

    it('should skip git when skipGit is true', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
        installMethod: 'poetry',
      });

      vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('[tool.poetry]');

      await createProject('test-project', { skipGit: true });

      const gitCalls = vi.mocked(execa).mock.calls.filter((call) => call[0] === 'git');
      expect(gitCalls.length).toBe(0);
    });

    it('should create .gitignore file', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
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
        pythonVersion: '3.10',
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
        pythonVersion: '3.10',
        defaultInstallMethod: 'pipx' as const,
      };

      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.10',
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
