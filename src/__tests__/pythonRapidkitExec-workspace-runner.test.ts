import { describe, expect, it, vi } from 'vitest';
import { join } from 'path';

vi.mock('fs-extra', () => {
  return {
    default: {
      pathExists: vi.fn(),
    },
    pathExists: vi.fn(),
  };
});

vi.mock('execa', () => {
  return {
    execa: vi.fn(),
  };
});

import * as fsExtra from 'fs-extra';
import { execa } from 'execa';
import { runCoreRapidkitCapture } from '../core-bridge/pythonRapidkitExec';

describe('pythonRapidkitExec workspace runner preference', () => {
  it('prefers .venv/bin/rapidkit when present and valid', async () => {
    const pathExists = fsExtra.pathExists as unknown as ReturnType<typeof vi.fn>;
    const execaMock = execa as unknown as ReturnType<typeof vi.fn>;

    const cwd = '/work/ws/projects/api';
    // Use platform-appropriate venv path
    const venvRapidkit =
      process.platform === 'win32'
        ? join(cwd, '.venv', 'Scripts', 'rapidkit.exe')
        : join(cwd, '.venv', 'bin', 'rapidkit');

    pathExists.mockImplementation(async (p: string) => p === venvRapidkit);

    execaMock
      // Probe --version --json
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: JSON.stringify({ version: '0.2.0rc1' }),
        stderr: '',
      })
      // Actual command execution
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: 'ok',
        stderr: '',
      });

    const res = await runCoreRapidkitCapture(['list', '--json'], { cwd });

    expect(res.exitCode).toBe(0);
    expect(execaMock).toHaveBeenCalledTimes(2);
    expect(execaMock.mock.calls[0][0]).toBe(venvRapidkit);
    expect(execaMock.mock.calls[1][0]).toBe(venvRapidkit);
  });
});
