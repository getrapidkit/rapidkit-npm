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
    return this.run(pm, ['install'], projectPath);
  }

  async runDev(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.run(pm, this.scriptArgs(pm, 'dev'), projectPath);
  }

  async runTest(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.run(pm, this.scriptArgs(pm, 'test'), projectPath);
  }

  async runBuild(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.run(pm, this.scriptArgs(pm, 'build'), projectPath);
  }

  async runStart(projectPath: string): Promise<CommandResult> {
    const pm = this.detectPackageManager(projectPath);
    return this.run(pm, this.scriptArgs(pm, 'start'), projectPath);
  }

  async doctorHints(_projectPath: string): Promise<string[]> {
    return [
      'Install Node.js LTS and ensure node/npm are on PATH.',
      'Use lockfiles (package-lock.json, pnpm-lock.yaml, yarn.lock) for deterministic installs.',
      'Run install before dev/test/build if dependencies changed.',
    ];
  }
}
