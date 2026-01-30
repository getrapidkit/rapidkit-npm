import { execa } from 'execa';
import chalk from 'chalk';
import { createRequire } from 'module';
import { logger } from './logger.js';

const PACKAGE_NAME = 'rapidkit';

// Get package version from package.json
const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { version?: string };
const CURRENT_VERSION = packageJson?.version ?? '0.0.0';

/**
 * Check if a newer version of rapidkit is available on npm
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
