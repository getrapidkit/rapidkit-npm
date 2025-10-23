import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { logger } from './logger.js';

export interface UserConfig {
  defaultKit?: string;
  defaultInstallMethod?: 'poetry' | 'venv' | 'pipx';
  pythonVersion?: '3.10' | '3.11' | '3.12';
  author?: string;
  license?: string;
  skipGit?: boolean;
  // Test mode configuration (for development only)
  testRapidKitPath?: string;
}

const CONFIG_FILE_NAME = '.rapidkitrc.json';

/**
 * Load user configuration from home directory
 */
export async function loadUserConfig(): Promise<UserConfig> {
  const configPath = path.join(os.homedir(), CONFIG_FILE_NAME);
  
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content) as UserConfig;
    logger.debug(`Loaded config from ${configPath}`);
    return config;
  } catch (error) {
    // Config file doesn't exist or is invalid - return empty config
    logger.debug('No user config found, using defaults');
    return {};
  }
}

/**
 * Save user configuration to home directory
 */
export async function saveUserConfig(config: UserConfig): Promise<void> {
  const configPath = path.join(os.homedir(), CONFIG_FILE_NAME);
  
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    logger.debug(`Saved config to ${configPath}`);
  } catch (error) {
    logger.warn('Could not save configuration file');
  }
}

/**
 * Get test RapidKit path from config or environment
 */
export function getTestRapidKitPath(config: UserConfig): string | undefined {
  // Priority: CLI option > Environment variable > Config file
  return (
    process.env.RAPIDKIT_DEV_PATH ||
    config.testRapidKitPath ||
    undefined
  );
}
