import os from 'os';
import path from 'path';
import * as fsExtra from 'fs-extra';
import { execa } from 'execa';

export type PythonCommand = 'python3' | 'python';

type ExecOpts = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

type CaptureResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

type BridgeErrorCode = 'PYTHON_NOT_FOUND' | 'BRIDGE_VENV_BOOTSTRAP_FAILED';

class BridgeError extends Error {
  public code: BridgeErrorCode;
  constructor(code: BridgeErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function formatBridgeError(err: unknown): string {
  if (err instanceof BridgeError) {
    if (err.code === 'PYTHON_NOT_FOUND') {
      return (
        'RapidKit (npm) could not find Python (python3/python) on your PATH.\n' +
        'Install Python 3.10+ and ensure `python3` is available, then retry.\n' +
        'Tip: if you are inside a RapidKit project, use the local ./rapidkit launcher.'
      );
    }
    return `RapidKit (npm) bridge error: ${err.message}`;
  }

  const msg = err instanceof Error ? err.message : String(err);
  return `RapidKit (npm) failed to run the Python core engine: ${msg}`;
}

function coreInstallTarget(): string {
  const override = process.env.RAPIDKIT_CORE_PYTHON_PACKAGE;
  if (override && override.trim()) return override.trim();
  return 'rapidkit-core';
}

function cacheRoot(): string {
  const xdg = process.env.XDG_CACHE_HOME;
  if (xdg && xdg.trim()) return xdg;
  return path.join(os.homedir(), '.cache');
}

function bridgeVenvDir(): string {
  return path.join(cacheRoot(), 'rapidkit', 'npm-bridge', 'venv');
}

function bridgePython(venvDir: string): string {
  const isWin = process.platform === 'win32';
  return isWin ? path.join(venvDir, 'Scripts', 'python.exe') : path.join(venvDir, 'bin', 'python');
}

function bridgeRapidkitCli(venvDir: string): string {
  const isWin = process.platform === 'win32';
  return isWin
    ? path.join(venvDir, 'Scripts', 'rapidkit.exe')
    : path.join(venvDir, 'bin', 'rapidkit');
}

function commandsCachePath(): string {
  return path.join(cacheRoot(), 'rapidkit', 'npm-bridge', 'core-commands.json');
}

async function tryRapidkit(cmd: PythonCommand): Promise<boolean> {
  const verbose = !!process.env.RAPIDKIT_DEBUG;

  const debug = (msg: string) => {
    if (verbose) {
      // Write to stderr so JSON on stdout is preserved for callers.
      process.stderr.write(`[DEBUG] tryRapidkit(${cmd}): ${msg}\n`);
    }
  };

  // Some distributions expose `rapidkit` as a console script rather than `python -m rapidkit`.
  // Prefer a console script that is installed for the SAME Python interpreter (if available),
  // so we don't accidentally invoke the npm wrapper `rapidkit` on PATH (which may come first).
  try {
    debug('probing interpreter-specific rapidkit script');
    // Ask the Python interpreter where its 'scripts' directory is and where its rapidkit script would live.
    const scriptPathRes = await execa(
      cmd,
      [
        '-c',
        "import sysconfig, os; print(os.path.join(sysconfig.get_path('scripts'), 'rapidkit'))",
      ],
      { reject: false, stdio: 'pipe', timeout: 2000 }
    );
    const scriptPath = (scriptPathRes.stdout ?? '').toString().trim();

    debug(`script path: ${scriptPath}`);

    if (scriptPath) {
      try {
        if (await fsExtra.pathExists(scriptPath)) {
          debug(`found script at ${scriptPath}; invoking --version --json`);
          const res = await execa(scriptPath, ['--version', '--json'], {
            reject: false,
            stdio: 'pipe',
            timeout: 4000,
          });
          debug(`script exitCode=${res.exitCode}`);
          if (res.exitCode === 0) {
            const out = (res.stdout ?? '').toString().trim();
            try {
              const parsed = JSON.parse(out) as unknown;
              const ok =
                !!parsed &&
                typeof parsed === 'object' &&
                parsed !== null &&
                'version' in (parsed as any);
              debug(`script JSON parse ok=${ok}`);
              if (ok) return true;
            } catch (_err) {
              debug('script output not valid JSON');
              // not valid JSON -> fall through to other checks
            }
          }
        }
      } catch (err) {
        debug(`interpreter-specific script probe failed: ${String(err)}`);
        // ignore script invocation errors and fall back
      }
    }
  } catch (err) {
    debug(`interpreter-specific script probe error: ${String(err)}`);
    // ignore
  }

  // Fast check: is the `rapidkit` module importable? This avoids importing the full
  // package (which can be slow on first-run and cause false negatives).
  try {
    debug('probing importlib.find_spec("rapidkit")');
    const probe = await execa(
      cmd,
      ['-c', "import importlib.util; print(1 if importlib.util.find_spec('rapidkit') else 0)"],
      {
        reject: false,
        stdio: 'pipe',
        timeout: 2000,
      }
    );
    debug(
      `import probe exitCode=${probe.exitCode} stdout=${(probe.stdout ?? '').toString().trim()}`
    );
    if (probe.exitCode === 0 && (probe.stdout ?? '').toString().trim() === '1') {
      return true;
    }
  } catch (err) {
    debug(`import probe error: ${String(err)}`);
    // ignore fast-check errors and fall back to the more thorough checks below
  }

  // Fallback: try invoking `python -m rapidkit --version --json` with a longer timeout.
  try {
    debug('probing python -m rapidkit');
    const res = await execa(cmd, ['-m', 'rapidkit', '--version', '--json'], {
      reject: false,
      stdio: 'pipe',
      timeout: 8000,
    });
    debug(`-m probe exitCode=${res.exitCode}`);
    if (res.exitCode === 0) return true;
  } catch (err) {
    debug(`-m probe error: ${String(err)}`);
    // ignore
  }

  // Final fallback: probe generic `rapidkit` executables on PATH (may be a console script or npm wrapper).
  // Scan PATH entries to find any `rapidkit` executable that emits valid JSON. This avoids relying on
  // `command -v rapidkit` which only returns the first match (often the npm wrapper in Node's bin).
  try {
    debug('probing PATH for rapidkit executables');
    const pathEnv = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean);
    for (const dir of pathEnv) {
      const candidate = path.join(dir, process.platform === 'win32' ? 'rapidkit.exe' : 'rapidkit');
      try {
        if (await fsExtra.pathExists(candidate)) {
          debug(`found candidate on PATH: ${candidate}; invoking --version --json`);
          const res = await execa(candidate, ['--version', '--json'], {
            reject: false,
            stdio: 'pipe',
            timeout: 4000,
          });
          debug(`candidate exitCode=${res.exitCode}`);
          if (res.exitCode === 0) {
            const out = (res.stdout ?? '').toString().trim();
            try {
              const parsed = JSON.parse(out) as unknown;
              if (
                !!parsed &&
                typeof parsed === 'object' &&
                parsed !== null &&
                'version' in (parsed as any)
              ) {
                return true;
              }
            } catch {
              debug('candidate output not valid JSON, skipping');
              // not JSON => skip
            }
          }
        }
      } catch (err) {
        debug(`error probing candidate ${candidate}: ${String(err)}`);
        // ignore errors for this candidate and continue scanning
      }
    }
    debug('no valid rapidkit found on PATH');
    return false;
  } catch (err) {
    debug(`PATH probe error: ${String(err)}`);
    return false;
  }
}

type RapidkitRunner = {
  cmd: string;
  baseArgs: string[];
};

async function isCoreJsonVersion(stdout: unknown): Promise<boolean> {
  const out = (stdout ?? '').toString().trim();
  if (!out) return false;
  try {
    const parsed = JSON.parse(out) as unknown;
    return (
      !!parsed && typeof parsed === 'object' && parsed !== null && 'version' in (parsed as any)
    );
  } catch {
    return false;
  }
}

async function findWorkspaceRunner(startDir: string): Promise<RapidkitRunner | null> {
  const isWin = process.platform === 'win32';

  const cliRel = isWin
    ? path.join('.venv', 'Scripts', 'rapidkit.exe')
    : path.join('.venv', 'bin', 'rapidkit');
  const pyRel = isWin
    ? path.join('.venv', 'Scripts', 'python.exe')
    : path.join('.venv', 'bin', 'python');

  let p = startDir;
  // Hard cap to avoid pathological scans.
  for (let i = 0; i < 25; i += 1) {
    const cli = path.join(p, cliRel);
    if (await fsExtra.pathExists(cli)) {
      const probe = await execa(cli, ['--version', '--json'], {
        reject: false,
        stdio: 'pipe',
        timeout: 1500,
        cwd: p,
      });
      if (probe.exitCode === 0 && (await isCoreJsonVersion(probe.stdout))) {
        return { cmd: cli, baseArgs: [] };
      }
    }

    const py = path.join(p, pyRel);
    if (await fsExtra.pathExists(py)) {
      const probe = await execa(py, ['-m', 'rapidkit', '--version', '--json'], {
        reject: false,
        stdio: 'pipe',
        timeout: 1500,
        cwd: p,
      });
      if (probe.exitCode === 0 && (await isCoreJsonVersion(probe.stdout))) {
        return { cmd: py, baseArgs: ['-m', 'rapidkit'] };
      }
    }

    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }

  return null;
}

async function resolveRapidkitRunner(cwd?: string): Promise<RapidkitRunner> {
  // If the user is inside a RapidKit workspace created by the npm package,
  // prefer its local .venv engine without requiring manual activation.
  if (cwd && cwd.trim()) {
    try {
      const local = await findWorkspaceRunner(cwd);
      if (local) return local;
    } catch {
      // Ignore and fall back to the default bridge/system resolution.
    }
  }

  const resolved = await resolveRapidkitPython();

  if (resolved.kind === 'venv') {
    const venvDir = bridgeVenvDir();
    const cli = bridgeRapidkitCli(venvDir);
    if (await fsExtra.pathExists(cli)) {
      return { cmd: cli, baseArgs: [] };
    }
    return { cmd: resolved.pythonPath, baseArgs: ['-m', 'rapidkit'] };
  }

  // System mode: prefer module invocation, but fall back to interpreter-specific console script or PATH console script if needed.
  try {
    const probe = await execa(resolved.cmd, ['-m', 'rapidkit', '--version', '--json'], {
      reject: false,
      stdio: 'pipe',
      timeout: 4000,
    });
    if (probe.exitCode === 0) {
      return { cmd: resolved.cmd, baseArgs: ['-m', 'rapidkit'] };
    }
  } catch {
    // ignore
  }

  // Try interpreter-specific console script before bootstrapping a venv. This handles
  // cases where the package installs a console script but is not importable as a module.
  try {
    const scriptPathRes = await execa(
      resolved.cmd,
      [
        '-c',
        "import sysconfig, os; print(os.path.join(sysconfig.get_path('scripts'), 'rapidkit'))",
      ],
      { reject: false, stdio: 'pipe', timeout: 2000 }
    );
    const scriptPath = (scriptPathRes.stdout ?? '').toString().trim();
    if (scriptPath && (await fsExtra.pathExists(scriptPath))) {
      try {
        const res = await execa(scriptPath, ['--version', '--json'], {
          reject: false,
          stdio: 'pipe',
          timeout: 4000,
        });
        if (res.exitCode === 0 && (await isCoreJsonVersion(res.stdout))) {
          return { cmd: scriptPath, baseArgs: [] };
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  // If system python is present but rapidkit isn't importable (and no interpreter-specific
  // console script worked), bootstrap the bridge venv. Falling back to PATH `rapidkit` is
  // unsafe because it can be the npm wrapper itself.
  const venvDir = bridgeVenvDir();
  const pythonPath = await ensureBridgeVenv(resolved.cmd);
  const cli = bridgeRapidkitCli(venvDir);
  if (await fsExtra.pathExists(cli)) {
    return { cmd: cli, baseArgs: [] };
  }
  return { cmd: pythonPath, baseArgs: ['-m', 'rapidkit'] };
}

async function pickSystemPython(): Promise<PythonCommand | null> {
  for (const cmd of ['python3', 'python'] as const) {
    try {
      await execa(cmd, ['--version'], { reject: false, stdio: 'pipe', timeout: 2000 });
      return cmd;
    } catch {
      // try next
    }
  }
  return null;
}

async function ensureBridgeVenv(pythonCmd: PythonCommand): Promise<string> {
  const venvDir = bridgeVenvDir();
  const py = bridgePython(venvDir);

  if (await fsExtra.pathExists(py)) {
    return py;
  }

  const bootstrapEnv: NodeJS.ProcessEnv = {
    ...process.env,
    // Keep bootstrap noise out of stdout/stderr as much as possible.
    // Even if pip emits notices, we prefer them on stderr (and avoid them entirely when possible).
    PIP_DISABLE_PIP_VERSION_CHECK: '1',
    PIP_NO_PYTHON_VERSION_WARNING: '1',
  };

  const runBootstrap = async (cmd: string, cmdArgs: string[]): Promise<void> => {
    const res = await execa(cmd, cmdArgs, {
      reject: false,
      // Keep stdout captured (avoid polluting JSON), but stream stderr so users see progress.
      stdio: ['ignore', 'pipe', 'inherit'],
      env: bootstrapEnv,
    });

    if (res.exitCode === 0) return;

    const out = (res.stdout ?? '').toString();
    const err = (res.stderr ?? '').toString();
    const details = [out, err].filter(Boolean).join('\n');
    const msg = details ? `${cmd} ${cmdArgs.join(' ')}\n${details}` : `${cmd} ${cmdArgs.join(' ')}`;
    throw new Error(msg);
  };

  try {
    await fsExtra.ensureDir(path.dirname(venvDir));
    await runBootstrap(pythonCmd, ['-m', 'venv', venvDir]);

    const vpy = bridgePython(venvDir);
    if (process.env.RAPIDKIT_BRIDGE_UPGRADE_PIP === '1') {
      await runBootstrap(vpy, ['-m', 'pip', 'install', '-U', 'pip']);
    }

    // IMPORTANT: never inherit stdout here.
    // Bootstrap output must not pollute stdout because core commands like `rapidkit list --json`
    // rely on stdout being valid JSON.
    await runBootstrap(vpy, ['-m', 'pip', 'install', '-U', coreInstallTarget()]);
    return vpy;
  } catch (e) {
    throw new BridgeError('BRIDGE_VENV_BOOTSTRAP_FAILED', formatBridgeError(e));
  }
}

export async function resolveRapidkitPython(): Promise<
  { kind: 'system'; cmd: PythonCommand } | { kind: 'venv'; pythonPath: string }
> {
  // Deterministic mode (used by drift-guard / CI): always use the bridge venv.
  // This avoids accidentally using a developer's globally-installed rapidkit.
  if (process.env.RAPIDKIT_BRIDGE_FORCE_VENV === '1') {
    const system = await pickSystemPython();
    if (!system) {
      throw new BridgeError('PYTHON_NOT_FOUND', 'No Python interpreter found (python3/python).');
    }
    const pythonPath = await ensureBridgeVenv(system);
    return { kind: 'venv', pythonPath };
  }

  // Prefer system python if it already has rapidkit available.
  for (const cmd of ['python3', 'python'] as const) {
    if (await tryRapidkit(cmd)) {
      return { kind: 'system', cmd };
    }
  }

  // Otherwise bootstrap a cached venv and install rapidkit-core there.
  const system = await pickSystemPython();
  if (!system) {
    throw new BridgeError('PYTHON_NOT_FOUND', 'No Python interpreter found (python3/python).');
  }
  const pythonPath = await ensureBridgeVenv(system);
  return { kind: 'venv', pythonPath };
}

export async function runCoreRapidkit(args: string[], opts?: ExecOpts): Promise<number> {
  try {
    const runner = await resolveRapidkitRunner(opts?.cwd);
    const cmd = runner.cmd;
    const cmdArgs = [...runner.baseArgs, ...args];

    const res = await execa(cmd, cmdArgs, {
      cwd: opts?.cwd,
      env: { ...process.env, ...opts?.env },
      reject: false,
      stdio: 'inherit',
    });

    return typeof res.exitCode === 'number' ? res.exitCode : 1;
  } catch (e) {
    process.stderr.write(`${formatBridgeError(e)}\n`);
    return 1;
  }
}

export async function runCoreRapidkitCapture(
  args: string[],
  opts?: ExecOpts
): Promise<CaptureResult> {
  try {
    const runner = await resolveRapidkitRunner(opts?.cwd);
    const cmd = runner.cmd;
    const cmdArgs = [...runner.baseArgs, ...args];

    const res = await execa(cmd, cmdArgs, {
      cwd: opts?.cwd,
      env: { ...process.env, ...opts?.env },
      reject: false,
      stdio: 'pipe',
    });

    return {
      exitCode: typeof res.exitCode === 'number' ? res.exitCode : 1,
      stdout: (res.stdout ?? '').toString(),
      stderr: (res.stderr ?? '').toString(),
    };
  } catch (e) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: `${formatBridgeError(e)}\n`,
    };
  }
}

type CoreCommandsCache = {
  schema_version: 1;
  fetched_at: number;
  rapidkit_version?: string;
  commands: string[];
};

function parseCoreCommandsFromHelp(helpText: string): Set<string> {
  const commands = new Set<string>();

  // Typer/Click help format typically contains a "Commands:" section:
  //   Commands:
  //     list     List available kits
  //     modules  ...
  // Older or alternative formats may include lines like: "rapidkit <cmd>".
  const lines = helpText.split('\n');

  let inCommandsSection = false;
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');

    if (!inCommandsSection) {
      if (/^\s*Commands:\s*$/i.test(line)) {
        inCommandsSection = true;
      }
      // Fallback: some help outputs include explicit invocations
      const explicit = line.match(/^\s*rapidkit\s+([a-z0-9_-]+)\b/i);
      if (explicit) {
        const name = explicit[1].trim();
        if (name && !name.startsWith('-')) commands.add(name);
      }
      continue;
    }

    // End of section (blank line or next header)
    if (!line.trim()) break;
    if (/^\s*(Options|Arguments|Usage|Commands)\s*:/i.test(line)) continue;

    // Parse command rows: "  <name>  <description>"
    const m = line.match(/^\s*([a-z0-9][a-z0-9_-]*)\b/i);
    if (!m) continue;
    const name = m[1].trim();
    if (name && !name.startsWith('-')) commands.add(name);
  }

  return commands;
}

async function tryReadCommandsCache(): Promise<CoreCommandsCache | null> {
  const p = commandsCachePath();
  if (!(await fsExtra.pathExists(p))) return null;
  try {
    const data = await fsExtra.readJson(p);
    if (data && data.schema_version === 1 && Array.isArray(data.commands)) {
      return data as CoreCommandsCache;
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeCommandsCache(cache: CoreCommandsCache): Promise<void> {
  const p = commandsCachePath();
  await fsExtra.ensureDir(path.dirname(p));
  await fsExtra.writeJson(p, cache, { spaces: 2 });
}

async function getCoreVersion(): Promise<string | undefined> {
  const res = await runCoreRapidkitCapture(['version', '--json'], { cwd: process.cwd() });
  if (res.exitCode !== 0) return undefined;
  try {
    const payload = JSON.parse(res.stdout);
    const v = payload?.version;
    return typeof v === 'string' ? v : undefined;
  } catch {
    return undefined;
  }
}

export async function getCoreTopLevelCommands(): Promise<Set<string>> {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const cached = await tryReadCommandsCache();
  const currentVersion = await getCoreVersion();

  // Guard against buggy/empty caches (e.g., if parsing previously returned nothing).
  // Treat as missing so we re-fetch and/or fall back to bootstrap commands.
  const cachedHasCommands = !!cached?.commands?.length;

  if (
    cachedHasCommands &&
    now - cached.fetched_at < ONE_DAY_MS &&
    (!currentVersion || !cached.rapidkit_version || cached.rapidkit_version === currentVersion)
  ) {
    return new Set(cached.commands);
  }

  const help = await runCoreRapidkitCapture(['--help'], { cwd: process.cwd() });
  if (help.exitCode !== 0) {
    // Fall back to the cached set if available.
    if (cachedHasCommands) return new Set(cached!.commands);
    return new Set();
  }

  const cmds = parseCoreCommandsFromHelp(help.stdout);
  if (cmds.size === 0) {
    // If we can't parse help output, don't poison the cache.
    // Fall back to an empty set here; shouldForwardToCore() will still forward
    // well-known commands via BOOTSTRAP_CORE_COMMANDS_SET.
    return new Set();
  }
  const list = Array.from(cmds).sort();

  await writeCommandsCache({
    schema_version: 1,
    fetched_at: now,
    rapidkit_version: currentVersion,
    commands: list,
  });

  return cmds;
}

export async function getCachedCoreTopLevelCommands(): Promise<Set<string> | null> {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const cached = await tryReadCommandsCache();
  if (!cached) return null;
  if (now - cached.fetched_at >= ONE_DAY_MS) return null;
  if (!cached.commands?.length) return null;
  return new Set(cached.commands);
}
