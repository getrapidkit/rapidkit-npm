import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerWorkspaceAtPath } from '../create.js';
import { getPythonCommand } from '../utils.js';
import * as fsExtra from 'fs-extra';
import { execa } from 'execa';

vi.mock('fs-extra');
vi.mock('execa');
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    text: '',
  })),
}));

vi.mock('fs', () => ({
  promises: {
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(''),
  },
}));

describe('registerWorkspaceAtPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should write workspace marker and gitignore and install via venv by default', async () => {
    vi.mocked(fsExtra.outputFile).mockResolvedValue(undefined);
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);

    const testPath = '/tmp/my-ws';
    await registerWorkspaceAtPath(testPath, { skipGit: true });

    // marker
    expect(fsExtra.outputFile).toHaveBeenCalledWith(
      expect.stringContaining('.rapidkit-workspace'),
      expect.any(String),
      'utf-8'
    );

    // gitignore
    expect(fsExtra.outputFile).toHaveBeenCalledWith(
      expect.stringContaining('.gitignore'),
      expect.any(String),
      'utf-8'
    );

    const pythonCmd = getPythonCommand();
    // venv creation command
    expect(execa).toHaveBeenCalledWith(pythonCmd, ['-m', 'venv', '.venv'], { cwd: testPath });

    // pip upgrade using venv python -m pip
    const expectedVenvPythonPath = expect.stringContaining('.venv');
    expect(execa).toHaveBeenCalledWith(
      expectedVenvPythonPath,
      ['-m', 'pip', 'install', '--upgrade', 'pip'],
      { cwd: testPath }
    );

    // pip install rapidkit-core using venv python -m pip
    expect(execa).toHaveBeenCalledWith(
      expectedVenvPythonPath,
      ['-m', 'pip', 'install', 'rapidkit-core'],
      {
        cwd: testPath,
      }
    );
  });
});
