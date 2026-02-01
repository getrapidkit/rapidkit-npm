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

  it('should write workspace marker and gitignore and install via Poetry by default', async () => {
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

    // Poetry commands (default install method)
    expect(execa).toHaveBeenCalledWith('poetry', ['--version']);
    expect(execa).toHaveBeenCalledWith(
      'poetry',
      ['init', '--no-interaction', '--python', '^3.10'],
      { cwd: testPath }
    );
    expect(execa).toHaveBeenCalledWith('poetry', ['config', 'virtualenvs.in-project', 'true'], {
      cwd: testPath,
    });
    expect(execa).toHaveBeenCalledWith('poetry', ['add', 'rapidkit-core'], { cwd: testPath });
  });
});
