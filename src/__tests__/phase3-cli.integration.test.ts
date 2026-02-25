import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

function ensureDistBuilt(): string {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const distPath = path.join(repoRoot, 'dist', 'index.js');
  const srcEntryPath = path.join(repoRoot, 'src', 'index.ts');

  const shouldBuild = (() => {
    if (!fs.existsSync(distPath)) return true;
    if (!fs.existsSync(srcEntryPath)) return false;

    const distMtime = fs.statSync(distPath).mtimeMs;
    const srcMtime = fs.statSync(srcEntryPath).mtimeMs;
    return srcMtime > distMtime;
  })();

  if (shouldBuild) {
    const build = spawnSync('npm', ['run', 'build'], {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    if (build.status !== 0) {
      throw new Error('Failed to build dist/index.js for CLI integration tests');
    }
  }

  return distPath;
}

describe('Phase 3 commands - CLI process integration', () => {
  it('keeps init at workspace root on wrapper path (no local script delegation)', () => {
    const dist = ensureDistBuilt();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapidkit-ws-init-'));
    const workspaceDir = path.join(tempDir, 'my-workspace');
    const childProjectDir = path.join(workspaceDir, 'node-app');

    try {
      fs.mkdirSync(path.join(childProjectDir, '.rapidkit'), { recursive: true });

      fs.writeFileSync(
        path.join(workspaceDir, '.rapidkit-workspace'),
        JSON.stringify({
          signature: 'RAPIDKIT_WORKSPACE',
          createdBy: 'rapidkit-npm',
          version: '0.0.0-test',
          createdAt: new Date().toISOString(),
          name: 'my-workspace',
          metadata: {
            npm: {
              packageVersion: '0.0.0-test',
              installMethod: 'pip',
            },
          },
        })
      );

      fs.writeFileSync(
        path.join(workspaceDir, 'rapidkit'),
        '#!/usr/bin/env sh\necho delegated-local-script\nexit 99\n'
      );
      fs.chmodSync(path.join(workspaceDir, 'rapidkit'), 0o755);

      fs.writeFileSync(
        path.join(childProjectDir, '.rapidkit', 'project.json'),
        JSON.stringify({ runtime: 'node', kit_name: 'nestjs.standard' }, null, 2)
      );
      fs.writeFileSync(
        path.join(childProjectDir, 'package.json'),
        JSON.stringify({ name: 'node-app', version: '1.0.0', private: true }, null, 2)
      );

      const run = spawnSync(process.execPath, [dist, 'init'], {
        cwd: workspaceDir,
        encoding: 'utf8',
        env: {
          ...process.env,
          RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '1',
        },
      });

      expect(run.status).not.toBe(99);
      const output = `${run.stdout || ''}\n${run.stderr || ''}`;
      expect(output).not.toContain('delegated-local-script');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('executes setup node successfully when runtime adapters are enabled', () => {
    const dist = ensureDistBuilt();

    const run = spawnSync(process.execPath, [dist, 'setup', 'node'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '1',
      },
    });

    expect(run.status).toBe(0);
    const output = `${run.stdout || ''}\n${run.stderr || ''}`;
    expect(output).toContain('prerequisites look good');
  });

  it('returns error for setup node when runtime adapters are disabled', () => {
    const dist = ensureDistBuilt();

    const run = spawnSync(process.execPath, [dist, 'setup', 'node'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '0',
      },
    });

    expect(run.status).toBe(1);
    const output = `${run.stdout || ''}\n${run.stderr || ''}`;
    expect(output).toContain('Runtime adapters are disabled');
  });

  it('handles cache status command at npm wrapper level', () => {
    const dist = ensureDistBuilt();

    const run = spawnSync(process.execPath, [dist, 'cache', 'status'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '1',
      },
    });

    expect(run.status).toBe(0);
    const output = `${run.stdout || ''}\n${run.stderr || ''}`;
    expect(output).toContain('RapidKit cache is enabled');
  });

  it('clears disk cache entries via cache clear command', () => {
    const dist = ensureDistBuilt();
    const cacheDir = path.join(os.homedir(), '.rapidkit', 'cache');
    const markerKey = `phase3-cli-marker-${Date.now()}-${Math.random()}`;
    const markerFile = `${createHash('md5').update(markerKey).digest('hex')}.json`;
    const markerPath = path.join(cacheDir, markerFile);

    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(
      markerPath,
      JSON.stringify({
        data: { ok: true },
        timestamp: Date.now(),
        version: '1.0',
      })
    );
    expect(fs.existsSync(markerPath)).toBe(true);

    const run = spawnSync(process.execPath, [dist, 'cache', 'clear'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '1',
      },
    });

    expect(run.status).toBe(0);
    const output = `${run.stdout || ''}\n${run.stderr || ''}`;
    expect(output).toContain('Cache clear completed');
    expect(fs.existsSync(markerPath)).toBe(false);
  });

  it('executes bootstrap for a node project path via init rewrite when adapters are enabled', () => {
    const dist = ensureDistBuilt();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapidkit-bootstrap-node-'));
    const projectDir = path.join(tempDir, 'node-app');

    try {
      fs.mkdirSync(projectDir, { recursive: true });
      fs.mkdirSync(path.join(projectDir, '.rapidkit'), { recursive: true });
      fs.writeFileSync(
        path.join(projectDir, '.rapidkit', 'project.json'),
        JSON.stringify({ runtime: 'node', kit_name: 'nestjs.standard' }, null, 2)
      );
      fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify(
          {
            name: 'node-app',
            version: '1.0.0',
            private: true,
          },
          null,
          2
        )
      );

      const run = spawnSync(process.execPath, [dist, 'bootstrap', projectDir], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '1',
        },
      });

      expect(run.status).toBe(0);
      const output = `${run.stdout || ''}\n${run.stderr || ''}`;
      expect(output).not.toContain('Unknown command: bootstrap');
      expect(output).not.toContain('Runtime adapters are disabled');
      expect(fs.existsSync(path.join(projectDir, 'package-lock.json'))).toBe(true);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('applies dependency policy context across dev/test/build/start lifecycle commands', () => {
    const dist = ensureDistBuilt();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapidkit-lifecycle-policy-'));
    const workspaceDir = path.join(tempDir, 'workspace');
    const projectDir = path.join(workspaceDir, 'node-app');

    try {
      fs.mkdirSync(path.join(projectDir, '.rapidkit'), { recursive: true });
      fs.mkdirSync(path.join(workspaceDir, '.rapidkit'), { recursive: true });
      fs.writeFileSync(path.join(workspaceDir, '.rapidkit-workspace'), '{}');
      fs.writeFileSync(
        path.join(workspaceDir, '.rapidkit', 'policies.yml'),
        [
          'version: "1.0"',
          'mode: warn',
          'dependency_sharing_mode: shared-runtime-caches',
          'rules:',
          '  enforce_workspace_marker: true',
          '',
        ].join('\n')
      );

      fs.writeFileSync(
        path.join(projectDir, '.rapidkit', 'project.json'),
        JSON.stringify({ runtime: 'node', kit_name: 'nestjs.standard' }, null, 2)
      );
      fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify(
          {
            name: 'node-app',
            version: '1.0.0',
            private: true,
            scripts: {
              dev: "node -e \"console.log('MODE:' + (process.env.RAPIDKIT_DEP_SHARING_MODE || ''))\"",
              test: "node -e \"console.log('MODE:' + (process.env.RAPIDKIT_DEP_SHARING_MODE || ''))\"",
              build:
                "node -e \"console.log('MODE:' + (process.env.RAPIDKIT_DEP_SHARING_MODE || ''))\"",
              start:
                "node -e \"console.log('MODE:' + (process.env.RAPIDKIT_DEP_SHARING_MODE || ''))\"",
            },
          },
          null,
          2
        )
      );

      for (const command of ['dev', 'test', 'build', 'start']) {
        const run = spawnSync(process.execPath, [dist, command], {
          cwd: projectDir,
          encoding: 'utf8',
          env: {
            ...process.env,
            RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '1',
          },
        });

        expect(run.status).toBe(0);
        const output = `${run.stdout || ''}\n${run.stderr || ''}`;
        expect(output).toContain('MODE:shared-runtime-caches');
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('fails fast on invalid dependency_sharing_mode for lifecycle commands', () => {
    const dist = ensureDistBuilt();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapidkit-lifecycle-policy-invalid-'));
    const workspaceDir = path.join(tempDir, 'workspace');
    const projectDir = path.join(workspaceDir, 'node-app');

    try {
      fs.mkdirSync(path.join(projectDir, '.rapidkit'), { recursive: true });
      fs.mkdirSync(path.join(workspaceDir, '.rapidkit'), { recursive: true });
      fs.writeFileSync(path.join(workspaceDir, '.rapidkit-workspace'), '{}');
      fs.writeFileSync(
        path.join(workspaceDir, '.rapidkit', 'policies.yml'),
        [
          'version: "1.0"',
          'mode: warn',
          'dependency_sharing_mode: invalid-mode',
          'rules:',
          '  enforce_workspace_marker: true',
          '',
        ].join('\n')
      );

      fs.writeFileSync(
        path.join(projectDir, '.rapidkit', 'project.json'),
        JSON.stringify({ runtime: 'node', kit_name: 'nestjs.standard' }, null, 2)
      );
      fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify(
          {
            name: 'node-app',
            version: '1.0.0',
            private: true,
            scripts: {
              dev: 'node -e "console.log(\'SHOULD_NOT_RUN\')"',
            },
          },
          null,
          2
        )
      );

      const run = spawnSync(process.execPath, [dist, 'dev'], {
        cwd: projectDir,
        encoding: 'utf8',
        env: {
          ...process.env,
          RAPIDKIT_ENABLE_RUNTIME_ADAPTERS: '1',
        },
      });

      expect(run.status).toBe(1);
      const output = `${run.stdout || ''}\n${run.stderr || ''}`;
      expect(output).toContain('Invalid dependency_sharing_mode');
      expect(output).not.toContain('SHOULD_NOT_RUN');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
