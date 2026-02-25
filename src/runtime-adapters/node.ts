import fs from 'fs';
import path from 'path';
import type { CommandResult, RuntimeAdapter } from './types.js';

export type NodeCommandRunner = (command: string, args: string[], cwd: string) => Promise<number>;

type PackageManager = 'npm' | 'pnpm' | 'yarn';

export class NodeRuntimeAdapter implements RuntimeAdapter {
  readonly runtime = 'node' as const;

  constructor(private readonly runCommand: NodeCommandRunner) {}

  private async run(command: string, args: string[], cwd: string): Promise<CommandResult> {
    const exitCode = await this.runCommand(command, args, cwd);
    return { exitCode };
  }

  private findWorkspaceRoot(startPath: string): string | null {
    let current = startPath;
    while (true) {
      if (fs.existsSync(path.join(current, '.rapidkit-workspace'))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return null;
  }

  private resolveDependencyMode(
    projectPath: string
  ): 'isolated' | 'shared-runtime-caches' | 'shared-node-deps' {
    const raw = process.env.RAPIDKIT_DEP_SHARING_MODE?.toLowerCase();
    if (raw === 'shared-runtime-caches' || raw === 'shared-node-deps' || raw === 'isolated') {
      return raw;
    }
    const workspace = this.findWorkspaceRoot(projectPath);
    if (!workspace) return 'isolated';

    const policyPath = path.join(workspace, '.rapidkit', 'policies.yml');
    if (!fs.existsSync(policyPath)) return 'isolated';

    try {
      const policyRaw = fs.readFileSync(policyPath, 'utf-8');
      const match = policyRaw.match(/^\s*dependency_sharing_mode:\s*([a-zA-Z\-]+)\s*$/m);
      const value = match?.[1]?.toLowerCase();
      if (
        value === 'shared-runtime-caches' ||
        value === 'shared-node-deps' ||
        value === 'isolated'
      ) {
        return value;
      }
    } catch {
      // Fallback to isolated.
    }

    return 'isolated';
  }

  private withDependencyEnv<T>(
    projectPath: string,
    runtime: PackageManager,
    fn: () => Promise<T>
  ): Promise<T> {
    const mode = this.resolveDependencyMode(projectPath);
    const workspace = process.env.RAPIDKIT_WORKSPACE_PATH || this.findWorkspaceRoot(projectPath);
    const basePath =
      mode === 'isolated'
        ? path.join(projectPath, '.rapidkit', 'cache', 'node')
        : path.join(workspace || projectPath, '.rapidkit', 'cache', 'node');

    const originalNpmCache = process.env.npm_config_cache;
    const originalStoreDir = process.env.npm_config_store_dir;

    if (runtime === 'pnpm') {
      process.env.npm_config_store_dir = path.join(basePath, 'pnpm-store');
      process.env.npm_config_cache = path.join(basePath, 'pnpm-cache');
    } else if (runtime === 'yarn') {
      process.env.npm_config_cache = path.join(basePath, 'yarn-cache');
    } else {
      process.env.npm_config_cache = path.join(basePath, 'npm-cache');
    }

    return fn().finally(() => {
      if (typeof originalNpmCache === 'undefined') delete process.env.npm_config_cache;
      else process.env.npm_config_cache = originalNpmCache;

      if (typeof originalStoreDir === 'undefined') delete process.env.npm_config_store_dir;
      else process.env.npm_config_store_dir = originalStoreDir;
    });
  }

  private detectPackageManager(projectPath: string): PackageManager {
    if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
    return 'npm';
  }

  private scriptArgs(pm: PackageManager, scriptName: string): string[] {
    if (pm === 'npm') {
      return ['run', scriptName];
    }

    // pnpm/yarn support `run` consistently across versions.
    return ['run', scriptName];
  }

  async checkPrereqs(): Promise<CommandResult> {
    return this.run('node', ['--version'], process.cwd());
  }

  async initProject(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    const mode = this.resolveDependencyMode(projectPath);
    const installArgs =
      mode === 'shared-runtime-caches' || mode === 'shared-node-deps'
        ? ['install', '--prefer-offline']
        : ['install'];
    return this.withDependencyEnv(projectPath, pm, () => this.run(pm, installArgs, projectPath));
  }

  async runDev(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.withDependencyEnv(projectPath, pm, () =>
      this.run(pm, this.scriptArgs(pm, 'dev'), projectPath)
    );
  }

  async runTest(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.withDependencyEnv(projectPath, pm, () =>
      this.run(pm, this.scriptArgs(pm, 'test'), projectPath)
    );
  }

  async runBuild(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.withDependencyEnv(projectPath, pm, () =>
      this.run(pm, this.scriptArgs(pm, 'build'), projectPath)
    );
  }

  async runStart(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.withDependencyEnv(projectPath, pm, () =>
      this.run(pm, this.scriptArgs(pm, 'start'), projectPath)
    );
  }

  async doctorHints(_projectPath: string): Promise<string[]> {
    return [
      'Install Node.js LTS and ensure node/npm are on PATH.',
      'Use lockfiles (package-lock.json, pnpm-lock.yaml, yarn.lock) for deterministic installs.',
      'Run install before dev/test/build if dependencies changed.',
    ];
  }
}
