/**
 * Cross-platform Python command utility
 */

export function getPythonCommand(): string {
  return process.platform === 'win32' ? 'python' : 'python3';
}
