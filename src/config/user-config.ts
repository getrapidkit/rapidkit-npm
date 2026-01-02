import fs from 'fs';
import path from 'path';
import os from 'os';

export interface UserConfig {
  openaiApiKey?: string;
  aiEnabled?: boolean;
  telemetry?: boolean;
}

const CONFIG_DIR = path.join(os.homedir(), '.rapidkit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Get user configuration from ~/.rapidkit/config.json
 */
export function getUserConfig(): UserConfig {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return {};
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (_error) {
    // Return empty config on any error (file not found, parse error, etc.)
    return {};
  }
}

/**
 * Update user configuration (merges with existing)
 */
export function setUserConfig(config: Partial<UserConfig>): void {
  const current = getUserConfig();
  const updated = { ...current, ...config };

  // Create config directory if it doesn't exist
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  // Write updated config
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}

/**
 * Get OpenAI API key from environment or config
 * Priority: 1. Environment variable, 2. User config file
 */
export function getOpenAIKey(): string | null {
  return process.env.OPENAI_API_KEY || getUserConfig().openaiApiKey || null;
}

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  const config = getUserConfig();
  return config.aiEnabled !== false; // Enabled by default
}

/**
 * Get config file path for display
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
}
