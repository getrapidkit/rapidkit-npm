import { execa } from 'execa';
import chalk from 'chalk';
import { createRequire } from 'module';
import { logger } from './logger.js';

const PACKAGE_NAME = 'rapidkit';

// Get package version from package.json
const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { version?: string };
const CURRENT_VERSION = packageJson?.version ?? '0.0.0';

type ParsedVersion = {
  major: number;
  minor: number;
  patch: number;
  prerelease: Array<string | number>;
};

function parseVersion(raw: string): ParsedVersion | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) return null;

  const prerelease = match[4]
    ? match[4].split('.').map((part) => (part.match(/^\d+$/) ? Number(part) : part))
    : [];

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease,
  };
}

function compareVersions(aRaw: string, bRaw: string): number {
  const a = parseVersion(aRaw);
  const b = parseVersion(bRaw);
  if (!a || !b) return 0;

  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;

  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0;
  if (a.prerelease.length === 0) return 1;
  if (b.prerelease.length === 0) return -1;

  const len = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < len; i += 1) {
    const left = a.prerelease[i];
    const right = b.prerelease[i];
    if (left === undefined) return -1;
    if (right === undefined) return 1;
    if (left === right) continue;

    const leftNum = typeof left === 'number';
    const rightNum = typeof right === 'number';
    if (leftNum && rightNum) return left > right ? 1 : -1;
    if (leftNum) return -1;
    if (rightNum) return 1;
    return String(left) > String(right) ? 1 : -1;
  }

  return 0;
}

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

    if (latestVersion && compareVersions(latestVersion, CURRENT_VERSION) > 0) {
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
