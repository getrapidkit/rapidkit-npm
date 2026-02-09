import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import * as fsExtra from 'fs-extra';
import { execa } from 'execa';

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

vi.mock('fs-extra', async () => {
  const actual = await vi.importActual<typeof import('fs-extra')>('fs-extra');
  return {
    ...actual,
    pathExists: vi.fn(),
    readJson: vi.fn(),
    writeJson: vi.fn(),
    ensureDir: vi.fn(),
  };
});

const mockExeca = execa as unknown as Mock;
const mockFs = fsExtra as unknown as {
  pathExists: Mock;
  readJson: Mock;
  writeJson: Mock;
  ensureDir: Mock;
};

describe('bridge internals', () => {
  let bridge: typeof import('../core-bridge/pythonRapidkitExec');

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    bridge = await import('../core-bridge/pythonRapidkitExec');
  });

  afterEach(() => {
    delete process.env.RAPIDKIT_DEBUG;
    delete process.env.RAPIDKIT_BRIDGE_FORCE_VENV;
  });

  describe('parseCoreCommandsFromHelp', () => {
    it('parses Commands section', () => {
      const help = `
Commands:
  list     List kits
  run      Run kit
`;
      const res = bridge.__test__.parseCoreCommandsFromHelp(help);
      expect([...res]).toEqual(['list', 'run']);
    });

    it('parses explicit rapidkit <cmd>', () => {
      const help = `rapidkit deploy`;
      const res = bridge.__test__.parseCoreCommandsFromHelp(help);
      expect(res.has('deploy')).toBe(true);
    });

    it('returns empty set if nothing found', () => {
      const res = bridge.__test__.parseCoreCommandsFromHelp('nothing here');
      expect(res.size).toBe(0);
    });
  });

  describe('pickSystemPython', () => {
    it('returns python3 if available', async () => {
      mockExeca.mockResolvedValueOnce({ exitCode: 0 });
      const res = await bridge.__test__.pickSystemPython();
      expect(res).toBe('python3');
    });

    it('falls back to python', async () => {
      mockExeca
        .mockRejectedValueOnce(new Error('no python3'))
        .mockResolvedValueOnce({ exitCode: 0 });
      const res = await bridge.__test__.pickSystemPython();
      expect(res).toBe('python');
    });

    it('returns null if none found', async () => {
      mockExeca.mockRejectedValue(new Error('no python'));
      const res = await bridge.__test__.pickSystemPython();
      expect(res).toBeNull();
    });
  });

  describe('tryRapidkit', () => {
    it('returns true if import probe succeeds', async () => {
      // 1️⃣ interpreter-specific script probe
      mockExeca.mockResolvedValueOnce({
        stdout: '',
        exitCode: 0,
      });

      // 2️⃣ importlib.find_spec probe
      mockExeca.mockResolvedValueOnce({
        stdout: '1',
        exitCode: 0,
      });

      const ok = await bridge.__test__.tryRapidkit('python3');
      expect(ok).toBe(true);
    });

    it('returns false if all probes fail', async () => {
      mockExeca.mockResolvedValue({
        stdout: '0',
        exitCode: 1,
      });
      mockFs.pathExists.mockResolvedValue(false);

      const ok = await bridge.__test__.tryRapidkit('python3');
      expect(ok).toBe(false);
    });
  });

  describe('ensureBridgeVenv', () => {
    it('returns existing python if venv already exists', async () => {
      // Mock that venv python already exists
      mockFs.pathExists.mockResolvedValue(true);
      // Mock probe check: rapidkit is installed in venv
      mockExeca.mockResolvedValueOnce({
        exitCode: 0,
        stdout: '1',
        stderr: '',
      } as any);

      const py = await bridge.__test__.ensureBridgeVenv('python3');
      expect(py).toContain('python');
    });

    it('throws BridgeError on bootstrap failure', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);

      mockExeca.mockResolvedValueOnce({
        exitCode: 1,
        stdout: 'fail',
        stderr: 'boom',
      });

      await expect(bridge.__test__.ensureBridgeVenv('python3')).rejects.toMatchObject({
        code: 'BRIDGE_VENV_CREATE_FAILED',
      });
    });
  });
});

describe('public API', () => {
  let bridge: typeof import('../core-bridge/pythonRapidkitExec');

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    bridge = await import('../core-bridge/pythonRapidkitExec');
  });

  it('runCoreRapidkitCapture returns stdout/stderr', async () => {
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: '{"version":"1.0.0"}',
      stderr: '',
    });

    const res = await bridge.runCoreRapidkitCapture(['version']);
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain('version');
  });

  it('runCoreRapidkit returns 1 on error', async () => {
    mockExeca.mockRejectedValue(new Error('boom'));

    const code = await bridge.runCoreRapidkit(['list']);
    expect(code).toBe(1);
  });
});

describe('resolveRapidkitPython', () => {
  let bridge: typeof import('../core-bridge/pythonRapidkitExec');

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    bridge = await import('../core-bridge/pythonRapidkitExec');
  });

  it('returns system python when tryRapidkit succeeds', async () => {
    mockExeca
      .mockResolvedValueOnce({ stdout: '', exitCode: 0 }) // script probe
      .mockResolvedValueOnce({ stdout: '1', exitCode: 0 }); // import probe

    const res = await bridge.resolveRapidkitPython();
    expect(res.kind).toBe('system');
    if (res.kind === 'system') {
      expect(res.cmd).toBe('python3');
    }
  });

  it('bootstraps venv when system python has no rapidkit', async () => {
    // tryRapidkit(python3): all probes must fail
    // 1. sysconfig script path probe - returns path but doesn't exist
    mockExeca.mockResolvedValueOnce({ stdout: '/some/path/rapidkit', exitCode: 0 });
    mockFs.pathExists.mockResolvedValueOnce(false); // script doesn't exist
    // 2. import probe fails - rapidkit not installed
    mockExeca.mockResolvedValueOnce({ stdout: '0', exitCode: 0 });
    // 3. -m rapidkit probe fails
    mockExeca.mockResolvedValueOnce({ stdout: '', exitCode: 1 });

    // tryRapidkit(python): all probes must fail
    // 1. sysconfig script path probe
    mockExeca.mockResolvedValueOnce({ stdout: '/some/path/rapidkit', exitCode: 0 });
    mockFs.pathExists.mockResolvedValueOnce(false); // script doesn't exist
    // 2. import probe fails
    mockExeca.mockResolvedValueOnce({ stdout: '0', exitCode: 0 });
    // 3. -m rapidkit probe fails
    mockExeca.mockResolvedValueOnce({ stdout: '', exitCode: 1 });

    // pickSystemPython: check python3 --version
    mockExeca.mockResolvedValueOnce({ exitCode: 0 });

    // ensureBridgeVenv: pathExists for venv python returns false
    mockFs.pathExists.mockResolvedValue(false);
    mockFs.ensureDir.mockResolvedValue(undefined);

    // venv creation and pip install commands all succeed
    mockExeca.mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 } as any);

    const res = await bridge.resolveRapidkitPython();
    expect(res.kind).toBe('venv');
    if (res.kind === 'venv') {
      expect(res.pythonPath).toContain('python');
    }
  });
});

describe('resolveRapidkitRunner', () => {
  let bridge: typeof import('../core-bridge/pythonRapidkitExec');

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    bridge = await import('../core-bridge/pythonRapidkitExec');
  });

  it('uses workspace .venv rapidkit cli when available', async () => {
    mockFs.pathExists.mockResolvedValue(true);

    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: '{"version":"1.0.0"}',
    });

    const runner = await bridge.runCoreRapidkitCapture(['list'], {
      cwd: '/fake/project',
    });

    expect(runner.exitCode).toBe(0);
  });
});

describe('getCachedCoreTopLevelCommands', () => {
  let bridge: typeof import('../core-bridge/pythonRapidkitExec');

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    bridge = await import('../core-bridge/pythonRapidkitExec');
  });

  it('returns null if cache is missing', async () => {
    mockFs.pathExists.mockResolvedValue(false);

    const res = await bridge.getCachedCoreTopLevelCommands();
    expect(res).toBeNull();
  });

  it('returns cached commands if fresh', async () => {
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.readJson.mockResolvedValue({
      schema_version: 1,
      fetched_at: Date.now(),
      commands: ['list', 'run'],
    });

    const res = await bridge.getCachedCoreTopLevelCommands();
    expect(res?.has('list')).toBe(true);
  });
});

describe('getCoreTopLevelCommands', () => {
  let bridge: typeof import('../core-bridge/pythonRapidkitExec');

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    bridge = await import('../core-bridge/pythonRapidkitExec');
  });

  it('falls back to non-empty command set if help command fails', async () => {
    mockExeca.mockResolvedValue({
      exitCode: 1,
      stdout: '',
      stderr: 'fail',
    });

    const res = await bridge.getCoreTopLevelCommands();

    expect(res.size).toBeGreaterThan(0);

    // sanity check: commands are strings
    for (const cmd of res) {
      expect(typeof cmd).toBe('string');
    }
  });

  it('prefers commands JSON when available', async () => {
    mockFs.pathExists.mockResolvedValue(false);
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: JSON.stringify({ schema_version: 1, commands: ['create', 'list'] }),
      stderr: '',
    });

    const res = await bridge.getCoreTopLevelCommands();
    expect(res.has('create')).toBe(true);
    expect(res.has('list')).toBe(true);
  });

  it('parses commands from --help output', async () => {
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: `
Commands:
  list
  run
`,
    });

    const res = await bridge.getCoreTopLevelCommands();
    expect(res.has('list')).toBe(true);
    expect(res.has('run')).toBe(true);
  });
});
