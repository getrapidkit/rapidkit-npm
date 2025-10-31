import { execa } from 'execa';
import chalk from 'chalk';
import { logger } from './logger.js';

const PACKAGE_NAME = 'rapidkit';
const CURRENT_VERSION = '1.0.0-beta.6';

/**
 * Check if a newer version of create-rapidkit is available on npm
 */
export async function checkForUpdates(): Promise<void> {
  try {
    logger.debug('Checking for updates...');

    const { stdout } = await execa('npm', ['view', PACKAGE_NAME, 'version'], {
      timeout: 3000, // 3 second timeout
    });

    const latestVersion = stdout.trim();

    if (latestVersion && latestVersion !== CURRENT_VERSION) {
      console.log(chalk.yellow(`\n⚠️  Update available: ${CURRENT_VERSION} → ${latestVersion}`));
      console.log(chalk.cyan('Run: npm install -g rapidkit@latest\n'));
    } else {
      logger.debug('You are using the latest version');
    }
  } catch (_error) {
    // Silent fail - don't interrupt the user experience
    logger.debug('Could not check for updates');
  }
}

/**
 * Get the current package version
 */
export function getVersion(): string {
  return CURRENT_VERSION;
}
