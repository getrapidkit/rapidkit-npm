import { execa } from 'execa';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from './logger.js';

const PACKAGE_NAME = 'rapidkit';

// Get package version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const CURRENT_VERSION = packageJson.version;

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
