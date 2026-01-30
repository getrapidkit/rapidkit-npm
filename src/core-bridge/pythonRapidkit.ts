import { execa } from 'execa';

export type PythonCommand = 'python3' | 'python';

export interface RapidkitJsonResult<T> {
  ok: boolean;
  command?: PythonCommand;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  data?: T;
}

export interface RapidkitCoreVersionPayload {
  schema_version: 1;
  version: string;
}

export interface RapidkitProjectDetectPayload {
  schema_version: 1;
  input: string;
  confidence: 'strong' | 'weak' | 'none';
  isRapidkitProject: boolean;
  projectRoot: string | null;
  engine: 'python' | 'node' | string;
  markers: Record<string, unknown>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function tryRun(
  cmd: PythonCommand,
  args: string[],
  cwd?: string,
  timeoutMs = 8000
): Promise<{ ok: boolean; exitCode?: number; stdout?: string; stderr?: string }> {
  try {
    const result = await execa(cmd, args, {
      cwd,
      timeout: timeoutMs,
      reject: false,
      stdio: 'pipe',
    });

    return {
      ok: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (e: any) {
    // execa throws on spawn errors; keep it best-effort.
    return {
      ok: false,
      exitCode: undefined,
      stdout: '',
      stderr: e?.message ? String(e.message) : String(e),
    };
  }
}

export async function runPythonRapidkitJson<T>(
  rapidkitArgs: string[],
  opts?: { cwd?: string; timeoutMs?: number }
): Promise<RapidkitJsonResult<T>> {
  const baseArgs = ['-m', 'rapidkit', ...rapidkitArgs];
  const candidates: PythonCommand[] = ['python3', 'python'];

  for (const cmd of candidates) {
    const res = await tryRun(cmd, baseArgs, opts?.cwd, opts?.timeoutMs);
    if (!res.ok) {
      continue;
    }

    const raw = (res.stdout ?? '').trim();
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isObject(parsed)) {
        return {
          ok: false,
          command: cmd,
          exitCode: res.exitCode,
          stdout: res.stdout,
          stderr: res.stderr,
        };
      }
      return {
        ok: true,
        command: cmd,
        exitCode: res.exitCode,
        stdout: res.stdout,
        stderr: res.stderr,
        data: parsed as T,
      };
    } catch {
      return {
        ok: false,
        command: cmd,
        exitCode: res.exitCode,
        stdout: res.stdout,
        stderr: res.stderr,
      };
    }
  }

  return { ok: false };
}

export async function getRapidkitCoreVersion(opts?: {
  cwd?: string;
  timeoutMs?: number;
}): Promise<RapidkitJsonResult<RapidkitCoreVersionPayload>> {
  const res = await runPythonRapidkitJson<RapidkitCoreVersionPayload>(
    ['--version', '--json'],
    opts
  );
  if (
    !res.ok ||
    !res.data ||
    res.data.schema_version !== 1 ||
    typeof res.data.version !== 'string'
  ) {
    return {
      ok: false,
      command: res.command,
      exitCode: res.exitCode,
      stdout: res.stdout,
      stderr: res.stderr,
    };
  }
  return res;
}

export async function detectRapidkitProject(
  pathToInspect: string,
  opts?: { cwd?: string; timeoutMs?: number }
): Promise<RapidkitJsonResult<RapidkitProjectDetectPayload>> {
  const res = await runPythonRapidkitJson<RapidkitProjectDetectPayload>(
    ['project', 'detect', '--path', pathToInspect, '--json'],
    opts
  );

  if (!res.ok || !res.data || res.data.schema_version !== 1) {
    return {
      ok: false,
      command: res.command,
      exitCode: res.exitCode,
      stdout: res.stdout,
      stderr: res.stderr,
    };
  }

  return res;
}
