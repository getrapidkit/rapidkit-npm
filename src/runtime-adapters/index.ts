import type { RuntimeAdapter, RuntimeName } from './types.js';
import { GoRuntimeAdapter } from './go.js';
import { NodeRuntimeAdapter } from './node.js';
import { PythonRuntimeAdapter } from './python.js';

export type AdapterDeps = {
  runCommandInCwd: (command: string, args: string[], cwd: string) => Promise<number>;
  runCoreRapidkit: (args: string[], opts: { cwd?: string }) => Promise<number>;
};

export function areRuntimeAdaptersEnabled(): boolean {
  return process.env.RAPIDKIT_ENABLE_RUNTIME_ADAPTERS === '1';
}

export function getRuntimeAdapter(runtime: RuntimeName, deps: AdapterDeps): RuntimeAdapter {
  if (runtime === 'go') {
    return new GoRuntimeAdapter((command, args, cwd) => deps.runCommandInCwd(command, args, cwd));
  }

  if (runtime === 'node') {
    return new NodeRuntimeAdapter((command, args, cwd) => deps.runCommandInCwd(command, args, cwd));
  }

  return new PythonRuntimeAdapter((args, cwd) => deps.runCoreRapidkit(args, { cwd }));
}
