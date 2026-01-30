import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerWorkspaceAtPath } from '../create.js';
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

    const path = '/tmp/my-ws';
    await registerWorkspaceAtPath(path, { skipGit: true });

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

    // venv creation command
    expect(execa).toHaveBeenCalledWith('python3', ['-m', 'venv', '.venv'], { cwd: path });

    // pip install
    expect(execa).toHaveBeenCalledWith(
      expect.stringContaining('.venv/bin/pip'),
      ['install', 'rapidkit-core'],
      {
        cwd: path,
      }
    );
  });
});
