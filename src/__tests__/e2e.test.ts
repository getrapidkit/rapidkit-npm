import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, access } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { execa } from 'execa';

describe('E2E Tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'rapidkit-e2e-'));
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('creates demo workspace successfully', async () => {
    const workspaceName = 'test-workspace';
    const workspacePath = join(tempDir, workspaceName);

    // Run rapidkit create command in demo mode
    await execa(
      'node',
      [join(process.cwd(), 'dist/index.js'), workspaceName, '--demo', '--skip-git'],
      {
        cwd: tempDir,
      }
    );

    // Verify workspace structure
    await expect(fileExists(join(workspacePath, 'package.json'))).resolves.toBe(true);
    await expect(fileExists(join(workspacePath, 'generate-demo.js'))).resolves.toBe(true);
    await expect(fileExists(join(workspacePath, 'README.md'))).resolves.toBe(true);

    // Verify package.json content
    const packageJson = JSON.parse(await readFile(join(workspacePath, 'package.json'), 'utf-8'));
    expect(packageJson.name).toBe('test-workspace-workspace');
    expect(packageJson.scripts.generate).toBeDefined();
  }, 30000);

  it('rejects invalid workspace names', async () => {
    const invalidNames = ['invalid name', '123-start', 'test@workspace', 'test workspace'];

    for (const invalidName of invalidNames) {
      await expect(
        execa('node', [join(process.cwd(), 'dist/index.js'), invalidName, '--demo', '--skip-git'], {
          cwd: tempDir,
          reject: false,
        })
      ).resolves.toHaveProperty('exitCode', 1);
    }
  }, 30000);

  it('handles dry-run mode correctly', async () => {
    const workspaceName = 'test-workspace';

    const { stdout } = await execa(
      'node',
      [join(process.cwd(), 'dist/index.js'), workspaceName, '--demo', '--dry-run'],
      {
        cwd: tempDir,
      }
    );

    expect(stdout).toContain('Dry-run mode');
    expect(stdout).toContain('Demo workspace');
    expect(stdout).toContain(workspaceName);

    // Verify nothing was created
    await expect(fileExists(join(tempDir, workspaceName))).resolves.toBe(false);
  }, 15000);

  it('shows version correctly', async () => {
    const { stdout } = await execa('node', [join(process.cwd(), 'dist/index.js'), '--version']);

    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  }, 5000);

  it('shows help correctly', async () => {
    const { stdout } = await execa('node', [join(process.cwd(), 'dist/index.js'), '--help']);

    expect(stdout).toContain('rapidkit');
    expect(stdout).toContain('--demo');
    expect(stdout).toContain('--skip-git');
  }, 5000);
});

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
