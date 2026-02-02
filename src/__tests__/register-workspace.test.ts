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
    expect(execa).toHaveBeenCalledWith(
      'poetry',
      ['config', 'virtualenvs.in-project', 'true', '--local'],
      {
        cwd: testPath,
      }
    );
    // Verify poetry add was called with the correct arguments
    // Note: The exact call sequence may vary due to Python discovery and other checks
    const addCalls = vi
      .mocked(execa)
      .mock.calls.filter(
        (call) => call[0] === 'poetry' && Array.isArray(call[1]) && call[1][0] === 'add'
      );
    expect(addCalls.length).toBeGreaterThan(0);
    // The first add call should have cwd and timeout
    expect(addCalls[0][0]).toBe('poetry');
    expect(addCalls[0][1]).toEqual(['add', 'rapidkit-core']);
    expect(addCalls[0][2]).toHaveProperty('cwd', testPath);
    expect(addCalls[0][2]).toHaveProperty('timeout');
  });
});
