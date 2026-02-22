import type { CommandResult, RuntimeAdapter } from './types.js';

export type PythonCoreRunner = (args: string[], cwd: string) => Promise<number>;

export class PythonRuntimeAdapter implements RuntimeAdapter {
  readonly runtime = 'python' as const;

  constructor(private readonly runCore: PythonCoreRunner) {}

  private async run(args: string[], projectPath: string): Promise<CommandResult> {
    const exitCode = await this.runCore(args, projectPath);
    return { exitCode };
  }

  async checkPrereqs(): Promise<CommandResult> {
    return this.run(['doctor', '--json'], process.cwd());
  }

  async initProject(projectPath: string): Promise<CommandResult> {
    return this.run(['init'], projectPath);
  }

  async runDev(projectPath: string): Promise<CommandResult> {
    return this.run(['dev'], projectPath);
  }

  async runTest(projectPath: string): Promise<CommandResult> {
    return this.run(['test'], projectPath);
  }

  async runBuild(projectPath: string): Promise<CommandResult> {
    return this.run(['build'], projectPath);
  }

  async runStart(projectPath: string): Promise<CommandResult> {
    return this.run(['start'], projectPath);
  }

  async doctorHints(_projectPath: string): Promise<string[]> {
    return [
      'Run rapidkit doctor --workspace for a full workspace scan.',
      'Use rapidkit init after adding or changing modules.',
      'Use workspace launcher ./rapidkit to avoid environment drift.',
    ];
  }
}
