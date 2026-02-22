import path from 'path';
import fs from 'fs';
import type { CommandResult, RuntimeAdapter } from './types.js';

export type GoCommandRunner = (command: string, args: string[], cwd: string) => Promise<number>;

export class GoRuntimeAdapter implements RuntimeAdapter {
  readonly runtime = 'go' as const;

  constructor(private readonly runCommand: GoCommandRunner) {}

  private async run(command: string, args: string[], cwd: string): Promise<CommandResult> {
    const exitCode = await this.runCommand(command, args, cwd);
    return { exitCode };
  }

  async checkPrereqs(): Promise<CommandResult> {
    return this.run('go', ['version'], process.cwd());
  }

  async initProject(projectPath: string): Promise<CommandResult> {
    return this.run('go', ['mod', 'tidy'], projectPath);
  }

  async runDev(projectPath: string): Promise<CommandResult> {
    const makefilePath = path.join(projectPath, 'Makefile');
    if (fs.existsSync(makefilePath)) {
      return this.run('make', ['run'], projectPath);
    }
    return this.run('go', ['run', './main.go'], projectPath);
  }

  async runTest(projectPath: string): Promise<CommandResult> {
    return this.run('go', ['test', './...'], projectPath);
  }

  async runBuild(projectPath: string): Promise<CommandResult> {
    return this.run('go', ['build', './...'], projectPath);
  }

  async runStart(projectPath: string): Promise<CommandResult> {
    const binaryPath = path.join(projectPath, 'server');
    if (fs.existsSync(binaryPath)) {
      return this.run(binaryPath, [], projectPath);
    }
    return this.run('go', ['run', './main.go'], projectPath);
  }

  async doctorHints(_projectPath: string): Promise<string[]> {
    return [
      'Install Go from https://go.dev/dl/ if missing.',
      'Run go mod tidy when dependencies are out of sync.',
      'Use make run for hot-reload if Makefile exists.',
    ];
  }
}
