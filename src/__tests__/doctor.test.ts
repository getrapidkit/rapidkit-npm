import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execa } from 'execa';
import fsExtra from 'fs-extra';
import os from 'os';
import path from 'path';

// Mock modules
vi.mock('execa');

describe('Doctor Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass basic import test', async () => {
    // Basic test to get coverage started
    const { runDoctor } = await import('../doctor.js');
    expect(runDoctor).toBeDefined();
    expect(typeof runDoctor).toBe('function');
  });

  it('should handle doctor command with mocked successful checks', async () => {
    // Mock successful command executions
    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3' || cmd === 'python') {
        if (args?.[0] === '--version') {
          return {
            stdout: 'Python 3.11.0',
            stderr: '',
            exitCode: 0,
          } as any;
        }
        if (args?.[0] === '-c') {
          return {
            stdout: '3.11.0',
            stderr: '',
            exitCode: 0,
          } as any;
        }
      }
      if (cmd === 'pip' || cmd === 'pip3') {
        return {
          stdout: 'pip 24.0',
          stderr: '',
          exitCode: 0,
        } as any;
      }
      if (cmd === 'pipx') {
        if (args?.[0] === '--version') {
          return {
            stdout: '1.4.0',
            stderr: '',
            exitCode: 0,
          } as any;
        }
        if (args?.[0] === 'list') {
          return {
            stdout: 'rapidkit-core 0.2.3',
            stderr: '',
            exitCode: 0,
          } as any;
        }
      }
      if (cmd === 'poetry') {
        return {
          stdout: 'Poetry version 1.7.0',
          stderr: '',
          exitCode: 0,
        } as any;
      }
      if (cmd === 'rapidkit') {
        return {
          stdout: '0.2.3',
          stderr: '',
          exitCode: 0,
        } as any;
      }
      return {
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any;
    });

    const { runDoctor } = await import('../doctor.js');

    // Run doctor with json output to avoid console output
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should handle doctor command with some failed checks', async () => {
    // Mock some failed checks
    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3' || cmd === 'python') {
        if (args?.[0] === '--version') {
          return {
            stdout: 'Python 3.11.0',
            stderr: '',
            exitCode: 0,
          } as any;
        }
        if (args?.[0] === '-c') {
          return {
            stdout: '3.11.0',
            stderr: '',
            exitCode: 0,
          } as any;
        }
      }
      if (cmd === 'pip' || cmd === 'pip3') {
        throw new Error('pip not found');
      }
      if (cmd === 'pipx') {
        throw new Error('pipx not found');
      }
      if (cmd === 'poetry') {
        throw new Error('poetry not found');
      }
      if (cmd === 'rapidkit') {
        throw new Error('rapidkit not found');
      }
      throw new Error('Command not found');
    });

    const { runDoctor } = await import('../doctor.js');

    // Should not throw even with failed checks
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should handle doctor command with all failed checks', async () => {
    // Mock all checks failing
    vi.mocked(execa).mockImplementation(async () => {
      throw new Error('Command not found');
    });

    const { runDoctor } = await import('../doctor.js');

    // Should not throw even with all failed checks
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should handle doctor with verbose output', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string) => {
      if (cmd === 'python3' || cmd === 'python') {
        return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
      }
      return { stdout: '', stderr: '', exitCode: 0 } as any;
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: false, verbose: true })).resolves.not.toThrow();
  });

  it('should handle doctor with fix option', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string) => {
      if (cmd === 'python3' || cmd === 'python') {
        return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
      }
      return { stdout: '', stderr: '', exitCode: 0 } as any;
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: false, fix: true })).resolves.not.toThrow();
  });

  it('should handle different python versions', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3' || cmd === 'python') {
        if (args?.[0] === '-c') {
          return { stdout: '3.9.0', stderr: '', exitCode: 0 } as any;
        }
        return { stdout: 'Python 3.9.0', stderr: '', exitCode: 0 } as any;
      }
      throw new Error('Command not found');
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should handle old python version warnings', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3' || cmd === 'python') {
        if (args?.[0] === '-c') {
          return { stdout: '3.8.0', stderr: '', exitCode: 0 } as any;
        }
        return { stdout: 'Python 3.8.0', stderr: '', exitCode: 0 } as any;
      }
      throw new Error('Command not found');
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should check pip installation', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3' || cmd === 'python') {
        return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pip' || cmd === 'pip3') {
        if (args?.[0] === '--version') {
          return { stdout: 'pip 24.0 from /usr/lib/python3.11', stderr: '', exitCode: 0 } as any;
        }
      }
      throw new Error('Command not found');
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should handle workspace checks', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string) => {
      if (cmd === 'python3' || cmd === 'python') {
        return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pip' || cmd === 'pip3') {
        return { stdout: 'pip 24.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'poetry') {
        return { stdout: 'Poetry version 1.7.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pipx') {
        return { stdout: '1.4.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'rapidkit') {
        return { stdout: '0.2.3', stderr: '', exitCode: 0 } as any;
      }
      return { stdout: '', stderr: '', exitCode: 0 } as any;
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: false })).resolves.not.toThrow();
  });

  it('should handle error states gracefully', async () => {
    vi.mocked(execa).mockRejectedValue(new Error('ENOENT: command not found') as never);

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should detect rapidkit core via pipx', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3') {
        return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pipx' && args?.[0] === 'list') {
        return {
          stdout: '  package rapidkit-core 0.2.3, installed using Python 3.11.0\n    - rapidkit',
          stderr: '',
          exitCode: 0,
        } as any;
      }
      if (cmd === 'rapidkit' && args?.[0] === '--version') {
        return { stdout: '0.2.3', stderr: '', exitCode: 0 } as any;
      }
      throw new Error('Command not found');
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: true })).resolves.not.toThrow();
  });

  it('should handle normal output format', async () => {
    vi.mocked(execa).mockImplementation(async (cmd: string) => {
      if (cmd === 'python3') {
        return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pip3') {
        return { stdout: 'pip 24.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'poetry') {
        return { stdout: 'Poetry version 1.7.0', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pipx') {
        return { stdout: '1.4.0', stderr: '', exitCode: 0 } as any;
      }
      throw new Error('not found');
    });

    const { runDoctor } = await import('../doctor.js');
    await expect(runDoctor({ json: false })).resolves.not.toThrow();
  });

  it('should not count workspace root .rapidkit as a project', async () => {
    const tempRoot = await fsExtra.mkdtemp(path.join(os.tmpdir(), 'rapidkit-doctor-'));
    const workspacePath = path.join(tempRoot, 'workspace');
    const apiPath = path.join(workspacePath, 'saas-api');
    const adminPath = path.join(workspacePath, 'saas-admin');

    await fsExtra.ensureDir(path.join(workspacePath, '.rapidkit'));
    await fsExtra.writeFile(path.join(workspacePath, '.rapidkit', 'users_core.db'), '');
    await fsExtra.writeJSON(path.join(workspacePath, '.rapidkit-workspace'), {
      name: 'workspace',
      version: '1.0',
    });

    await fsExtra.ensureDir(path.join(apiPath, '.rapidkit'));
    await fsExtra.ensureDir(path.join(adminPath, '.rapidkit'));
    await fsExtra.writeJSON(path.join(apiPath, '.rapidkit', 'project.json'), {
      name: 'saas-api',
      framework: 'fastapi',
    });
    await fsExtra.writeJSON(path.join(adminPath, '.rapidkit', 'project.json'), {
      name: 'saas-admin',
      framework: 'fastapi',
    });
    await fsExtra.writeFile(
      path.join(apiPath, 'pyproject.toml'),
      '[tool.poetry]\nname = "saas-api"\n'
    );
    await fsExtra.writeFile(
      path.join(adminPath, 'pyproject.toml'),
      '[tool.poetry]\nname = "saas-admin"\n'
    );
    await fsExtra.ensureDir(path.join(apiPath, '.venv'));
    await fsExtra.ensureDir(path.join(adminPath, '.venv'));

    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3' || cmd === 'python') {
        if (args?.[0] === '--version') {
          return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
        }
        if (args?.[0] === '-m' && args?.[1] === 'rapidkit') {
          return { stdout: 'RapidKit Version: 0.3.8', stderr: '', exitCode: 0 } as any;
        }
      }
      if (cmd === 'poetry') {
        return { stdout: 'Poetry version 2.3.2', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pipx') {
        if (args?.[0] === '--version') {
          return { stdout: '1.8.0', stderr: '', exitCode: 0 } as any;
        }
      }
      if (cmd === 'rapidkit') {
        return { stdout: 'RapidKit Version: 0.3.8', stderr: '', exitCode: 0 } as any;
      }
      return { stdout: '', stderr: '', exitCode: 0 } as any;
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const originalCwd = process.cwd();

    try {
      process.chdir(workspacePath);
      const { runDoctor } = await import('../doctor.js');
      await runDoctor({ workspace: true, json: true });

      const jsonLine = logSpy.mock.calls
        .map((call) => call[0])
        .find((msg) => typeof msg === 'string' && msg.trim().startsWith('{')) as string | undefined;

      expect(jsonLine).toBeDefined();
      const payload = JSON.parse(jsonLine as string);
      expect(payload.summary.totalProjects).toBe(2);
      expect(payload.projects.map((p: { name: string }) => p.name).sort()).toEqual([
        'saas-admin',
        'saas-api',
      ]);
    } finally {
      process.chdir(originalCwd);
      logSpy.mockRestore();
      await fsExtra.remove(tempRoot);
    }
  });

  it('should ignore dist artifact directories during workspace scan', async () => {
    const tempRoot = await fsExtra.mkdtemp(path.join(os.tmpdir(), 'rapidkit-doctor-dist-'));
    const workspacePath = path.join(tempRoot, 'workspace');
    const apiPath = path.join(workspacePath, 'saas-api');
    const distApiPath = path.join(workspacePath, 'dist-customer-release', 'saas-api');

    await fsExtra.ensureDir(path.join(workspacePath, '.rapidkit'));
    await fsExtra.writeJSON(path.join(workspacePath, '.rapidkit-workspace'), {
      name: 'workspace',
      version: '1.0',
    });

    await fsExtra.ensureDir(path.join(apiPath, '.rapidkit'));
    await fsExtra.writeJSON(path.join(apiPath, '.rapidkit', 'project.json'), {
      name: 'saas-api',
      framework: 'fastapi',
    });
    await fsExtra.writeFile(
      path.join(apiPath, 'pyproject.toml'),
      '[tool.poetry]\nname = "saas-api"\n'
    );
    await fsExtra.ensureDir(path.join(apiPath, '.venv'));

    await fsExtra.ensureDir(path.join(distApiPath, '.rapidkit'));
    await fsExtra.writeJSON(path.join(distApiPath, '.rapidkit', 'project.json'), {
      name: 'saas-api-dist',
      framework: 'fastapi',
    });
    await fsExtra.writeFile(
      path.join(distApiPath, 'pyproject.toml'),
      '[tool.poetry]\nname = "saas-api-dist"\n'
    );

    vi.mocked(execa).mockImplementation(async (cmd: string, args?: any) => {
      if (cmd === 'python3' || cmd === 'python') {
        if (args?.[0] === '--version') {
          return { stdout: 'Python 3.11.0', stderr: '', exitCode: 0 } as any;
        }
        if (args?.[0] === '-m' && args?.[1] === 'rapidkit') {
          return { stdout: 'RapidKit Version: 0.3.8', stderr: '', exitCode: 0 } as any;
        }
      }
      if (cmd === 'poetry') {
        return { stdout: 'Poetry version 2.3.2', stderr: '', exitCode: 0 } as any;
      }
      if (cmd === 'pipx') {
        if (args?.[0] === '--version') {
          return { stdout: '1.8.0', stderr: '', exitCode: 0 } as any;
        }
      }
      if (cmd === 'rapidkit') {
        return { stdout: 'RapidKit Version: 0.3.8', stderr: '', exitCode: 0 } as any;
      }
      return { stdout: '', stderr: '', exitCode: 0 } as any;
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const originalCwd = process.cwd();

    try {
      process.chdir(workspacePath);
      const { runDoctor } = await import('../doctor.js');
      await runDoctor({ workspace: true, json: true });

      const jsonLine = logSpy.mock.calls
        .map((call) => call[0])
        .find((msg) => typeof msg === 'string' && msg.trim().startsWith('{')) as string | undefined;

      expect(jsonLine).toBeDefined();
      const payload = JSON.parse(jsonLine as string);
      expect(payload.summary.totalProjects).toBe(1);
      expect(payload.projects.map((p: { name: string }) => p.name)).toEqual(['saas-api']);
    } finally {
      process.chdir(originalCwd);
      logSpy.mockRestore();
      await fsExtra.remove(tempRoot);
    }
  });
});
