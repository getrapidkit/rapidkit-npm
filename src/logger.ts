import chalk from 'chalk';

/**
 * Logger utility with debug mode support
 */
class Logger {
  private debugEnabled = false;

  setDebug(enabled: boolean) {
    this.debugEnabled = enabled;
  }

  debug(message: string, ...args: unknown[]) {
    if (this.debugEnabled) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  info(message: string, ...args: unknown[]) {
    console.log(chalk.blue(message), ...args);
  }

  success(message: string, ...args: unknown[]) {
    console.log(chalk.green(message), ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.log(chalk.yellow(message), ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(chalk.red(message), ...args);
  }

  step(stepNum: number, total: number, message: string) {
    console.log(chalk.cyan(`\n[${stepNum}/${total}]`), chalk.white(message));
  }
}

export const logger = new Logger();
