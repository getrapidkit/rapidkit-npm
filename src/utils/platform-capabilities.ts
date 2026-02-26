import os from 'os';
import path from 'path';

export type PlatformKind = 'windows' | 'linux' | 'macos' | 'other';

export type PythonVersionProbe = {
  command: string;
  args: string[];
};

export function detectPlatformKind(platform: NodeJS.Platform = process.platform): PlatformKind {
  if (platform === 'win32') return 'windows';
  if (platform === 'linux') return 'linux';
  if (platform === 'darwin') return 'macos';
  return 'other';
}

export function isWindowsPlatform(platform: NodeJS.Platform = process.platform): boolean {
  return detectPlatformKind(platform) === 'windows';
}

export function shouldUseShellExecution(platform: NodeJS.Platform = process.platform): boolean {
  return isWindowsPlatform(platform);
}

export function getDefaultPythonCommand(platform: NodeJS.Platform = process.platform): string {
  return isWindowsPlatform(platform) ? 'python' : 'python3';
}

export function getPythonCommandCandidates(platform: NodeJS.Platform = process.platform): string[] {
  return isWindowsPlatform(platform) ? ['python', 'py', 'python3'] : ['python3', 'python'];
}

export function getPythonVersionProbeCandidates(
  maxMinor = 14,
  minMinor = 10,
  platform: NodeJS.Platform = process.platform
): PythonVersionProbe[] {
  const probes: PythonVersionProbe[] = [];

  if (isWindowsPlatform(platform)) {
    for (let minor = maxMinor; minor >= minMinor; minor -= 1) {
      probes.push({ command: 'py', args: [`-3.${minor}`, '--version'] });
    }
    probes.push({ command: 'py', args: ['-3', '--version'] });
    probes.push({ command: 'python', args: ['--version'] });
    return probes;
  }

  for (let minor = maxMinor; minor >= minMinor; minor -= 1) {
    probes.push({ command: `python3.${minor}`, args: ['--version'] });
  }
  probes.push({ command: 'python3', args: ['--version'] });
  probes.push({ command: 'python', args: ['--version'] });
  return probes;
}

export function getVenvBinDirectory(
  venvPath: string,
  platform: NodeJS.Platform = process.platform
): string {
  return isWindowsPlatform(platform) ? path.join(venvPath, 'Scripts') : path.join(venvPath, 'bin');
}

export function getVenvPythonPath(
  venvPath: string,
  platform: NodeJS.Platform = process.platform
): string {
  return isWindowsPlatform(platform)
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python');
}

export function getVenvRapidkitPath(
  venvPath: string,
  platform: NodeJS.Platform = process.platform
): string {
  return isWindowsPlatform(platform)
    ? path.join(venvPath, 'Scripts', 'rapidkit.exe')
    : path.join(venvPath, 'bin', 'rapidkit');
}

export function getVenvActivateScriptPath(
  venvPath: string,
  platform: NodeJS.Platform = process.platform
): string {
  return isWindowsPlatform(platform)
    ? path.join(venvPath, 'Scripts', 'activate')
    : path.join(venvPath, 'bin', 'activate');
}

export function getRapidkitLocalScriptCandidates(
  cwd: string,
  platform: NodeJS.Platform = process.platform
): string[] {
  if (isWindowsPlatform(platform)) {
    return [path.join(cwd, 'rapidkit.cmd'), path.join(cwd, '.rapidkit', 'rapidkit.cmd')];
  }
  return [path.join(cwd, 'rapidkit'), path.join(cwd, '.rapidkit', 'rapidkit')];
}

export function getWorkspaceRegistryDirectory(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform
): string {
  const configHome = env.XDG_CONFIG_HOME || env.APPDATA || path.join(os.homedir(), '.config');
  return isWindowsPlatform(platform)
    ? path.join(configHome, 'rapidkit')
    : path.join(os.homedir(), '.rapidkit');
}
