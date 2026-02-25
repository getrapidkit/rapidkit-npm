import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';
import { GoRuntimeAdapter } from '../runtime-adapters/go.js';
import { NodeRuntimeAdapter } from '../runtime-adapters/node.js';
import { PythonRuntimeAdapter } from '../runtime-adapters/python.js';
import { areRuntimeAdaptersEnabled, getRuntimeAdapter } from '../runtime-adapters/index.js';

describe('Runtime Adapters', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.RAPIDKIT_ENABLE_RUNTIME_ADAPTERS;
    delete process.env.RAPIDKIT_DEP_SHARING_MODE;
    delete process.env.RAPIDKIT_WORKSPACE_PATH;
    delete process.env.npm_config_cache;
    delete process.env.npm_config_store_dir;
    delete process.env.PIP_CACHE_DIR;
    delete process.env.POETRY_CACHE_DIR;
    delete process.env.GOMODCACHE;
    delete process.env.GOCACHE;
  });

  describe('GoRuntimeAdapter', () => {
    it('runs go mod tidy for initProject', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new GoRuntimeAdapter(run);

      const result = await adapter.initProject('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('go', ['mod', 'tidy'], '/tmp/project');
    });

    it('uses make run when Makefile exists', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new GoRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = await adapter.runDev('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('make', ['run'], '/tmp/project');
    });

    it('falls back to go run when Makefile is missing', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new GoRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await adapter.runDev('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('go', ['run', './main.go'], '/tmp/project');
    });

    it('uses project-isolated go caches in isolated mode', async () => {
      process.env.RAPIDKIT_DEP_SHARING_MODE = 'isolated';
      process.env.RAPIDKIT_WORKSPACE_PATH = '/tmp/workspace';
      const run = vi.fn().mockImplementation(async () => {
        expect(process.env.GOMODCACHE).toContain('/tmp/project/.rapidkit/cache/go/mod');
        expect(process.env.GOCACHE).toContain('/tmp/project/.rapidkit/cache/go/build');
        return 0;
      });
      const adapter = new GoRuntimeAdapter(run);

      const result = await adapter.initProject('/tmp/project');

      expect(result.exitCode).toBe(0);
    });

    it('uses workspace-shared go caches in shared-runtime-caches mode', async () => {
      process.env.RAPIDKIT_DEP_SHARING_MODE = 'shared-runtime-caches';
      process.env.RAPIDKIT_WORKSPACE_PATH = '/tmp/workspace';
      const run = vi.fn().mockImplementation(async () => {
        expect(process.env.GOMODCACHE).toContain('/tmp/workspace/.rapidkit/cache/go/mod');
        expect(process.env.GOCACHE).toContain('/tmp/workspace/.rapidkit/cache/go/build');
        return 0;
      });
      const adapter = new GoRuntimeAdapter(run);

      const result = await adapter.initProject('/tmp/project');

      expect(result.exitCode).toBe(0);
    });

    it('runs test/build/start commands via go adapter branches', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new GoRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      await adapter.runTest('/tmp/project');
      await adapter.runBuild('/tmp/project');
      await adapter.runStart('/tmp/project');

      expect(run).toHaveBeenCalledWith('go', ['test', './...'], '/tmp/project');
      expect(run).toHaveBeenCalledWith('go', ['build', './...'], '/tmp/project');
      expect(run).toHaveBeenCalledWith('go', ['run', './main.go'], '/tmp/project');
    });

    it('runs binary directly for start when built binary exists', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new GoRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockImplementation((p: fs.PathLike) =>
        String(p).endsWith('/server')
      );

      const result = await adapter.runStart('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('/tmp/project/server', [], '/tmp/project');
    });
  });

  describe('PythonRuntimeAdapter', () => {
    it('runs prereq check via doctor check command', async () => {
      const runCore = vi.fn().mockResolvedValue(0);
      const adapter = new PythonRuntimeAdapter(runCore);

      const result = await adapter.checkPrereqs();

      expect(result.exitCode).toBe(0);
      expect(runCore).toHaveBeenCalledWith(['doctor', 'check'], process.cwd());
    });

    it('falls back to legacy doctor command when doctor check fails', async () => {
      const runCore = vi.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(0);
      const adapter = new PythonRuntimeAdapter(runCore);

      const result = await adapter.checkPrereqs();

      expect(result.exitCode).toBe(0);
      expect(runCore).toHaveBeenNthCalledWith(1, ['doctor', 'check'], process.cwd());
      expect(runCore).toHaveBeenNthCalledWith(2, ['doctor'], process.cwd());
    });

    it('delegates initProject to core runner', async () => {
      const runCore = vi.fn().mockResolvedValue(0);
      const adapter = new PythonRuntimeAdapter(runCore);

      const result = await adapter.initProject('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(runCore).toHaveBeenCalledWith(['init'], '/tmp/project');
    });

    it('delegates runDev to core runner', async () => {
      const runCore = vi.fn().mockResolvedValue(0);
      const adapter = new PythonRuntimeAdapter(runCore);

      const result = await adapter.runDev('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(runCore).toHaveBeenCalledWith(['dev'], '/tmp/project');
    });

    it('uses shared python caches in shared-runtime-caches mode', async () => {
      process.env.RAPIDKIT_DEP_SHARING_MODE = 'shared-runtime-caches';
      process.env.RAPIDKIT_WORKSPACE_PATH = '/tmp/workspace';

      const runCore = vi.fn().mockImplementation(async () => {
        expect(process.env.PIP_CACHE_DIR).toContain('/tmp/workspace/.rapidkit/cache/python/pip');
        expect(process.env.POETRY_CACHE_DIR).toContain(
          '/tmp/workspace/.rapidkit/cache/python/poetry'
        );
        return 0;
      });
      const adapter = new PythonRuntimeAdapter(runCore);

      const result = await adapter.initProject('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(runCore).toHaveBeenCalledWith(['init'], '/tmp/project');
    });

    it('keeps project-isolated python caches for shared-node-deps alias mode', async () => {
      process.env.RAPIDKIT_DEP_SHARING_MODE = 'shared-node-deps';
      process.env.RAPIDKIT_WORKSPACE_PATH = '/tmp/workspace';

      const runCore = vi.fn().mockImplementation(async () => {
        expect(process.env.PIP_CACHE_DIR).toContain('/tmp/project/.rapidkit/cache/python/pip');
        expect(process.env.POETRY_CACHE_DIR).toContain(
          '/tmp/project/.rapidkit/cache/python/poetry'
        );
        return 0;
      });
      const adapter = new PythonRuntimeAdapter(runCore);

      const result = await adapter.initProject('/tmp/project');

      expect(result.exitCode).toBe(0);
      expect(runCore).toHaveBeenCalledWith(['init'], '/tmp/project');
    });

    it('delegates test/build/start to core runner', async () => {
      const runCore = vi.fn().mockResolvedValue(0);
      const adapter = new PythonRuntimeAdapter(runCore);

      await adapter.runTest('/tmp/project');
      await adapter.runBuild('/tmp/project');
      await adapter.runStart('/tmp/project');

      expect(runCore).toHaveBeenCalledWith(['test'], '/tmp/project');
      expect(runCore).toHaveBeenCalledWith(['build'], '/tmp/project');
      expect(runCore).toHaveBeenCalledWith(['start'], '/tmp/project');
    });
  });

  describe('NodeRuntimeAdapter', () => {
    it('uses npm install by default for initProject', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new NodeRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await adapter.initProject('/tmp/node-project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('npm', ['install'], '/tmp/node-project');
    });

    it('uses pnpm when pnpm-lock exists', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new NodeRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockImplementation((p: fs.PathLike) =>
        String(p).includes('pnpm-lock.yaml')
      );

      const result = await adapter.runDev('/tmp/node-project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('pnpm', ['run', 'dev'], '/tmp/node-project');
    });

    it('uses yarn when yarn lock exists', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new NodeRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockImplementation((p: fs.PathLike) =>
        String(p).includes('yarn.lock')
      );

      const result = await adapter.runBuild('/tmp/node-project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('yarn', ['run', 'build'], '/tmp/node-project');
    });

    it('uses workspace-shared node cache with prefer-offline in shared modes', async () => {
      process.env.RAPIDKIT_DEP_SHARING_MODE = 'shared-runtime-caches';
      process.env.RAPIDKIT_WORKSPACE_PATH = '/tmp/workspace';

      const run = vi.fn().mockImplementation(async (command: string) => {
        expect(command).toBe('npm');
        expect(process.env.npm_config_cache).toContain(
          '/tmp/workspace/.rapidkit/cache/node/npm-cache'
        );
        return 0;
      });
      const adapter = new NodeRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await adapter.initProject('/tmp/node-project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith('npm', ['install', '--prefer-offline'], '/tmp/node-project');
    });

    it('uses pnpm store/cache paths in shared-node-deps alias mode', async () => {
      process.env.RAPIDKIT_DEP_SHARING_MODE = 'shared-node-deps';
      process.env.RAPIDKIT_WORKSPACE_PATH = '/tmp/workspace';

      const run = vi.fn().mockImplementation(async (command: string) => {
        expect(command).toBe('pnpm');
        expect(process.env.npm_config_store_dir).toContain(
          '/tmp/workspace/.rapidkit/cache/node/pnpm-store'
        );
        expect(process.env.npm_config_cache).toContain(
          '/tmp/workspace/.rapidkit/cache/node/pnpm-cache'
        );
        return 0;
      });

      const adapter = new NodeRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockImplementation((p: fs.PathLike) =>
        String(p).includes('pnpm-lock.yaml')
      );

      const result = await adapter.initProject('/tmp/node-project');

      expect(result.exitCode).toBe(0);
      expect(run).toHaveBeenCalledWith(
        'pnpm',
        ['install', '--prefer-offline'],
        '/tmp/node-project'
      );
    });

    it('uses yarn cache path and restores env after init', async () => {
      process.env.RAPIDKIT_DEP_SHARING_MODE = 'shared-runtime-caches';
      process.env.RAPIDKIT_WORKSPACE_PATH = '/tmp/workspace';

      let seenCache = '';
      const run = vi.fn().mockImplementation(async (command: string) => {
        expect(command).toBe('yarn');
        seenCache = process.env.npm_config_cache || '';
        return 0;
      });

      const adapter = new NodeRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockImplementation((p: fs.PathLike) =>
        String(p).includes('yarn.lock')
      );

      const result = await adapter.initProject('/tmp/node-project');

      expect(result.exitCode).toBe(0);
      expect(seenCache).toContain('/tmp/workspace/.rapidkit/cache/node/yarn-cache');
      expect(process.env.npm_config_cache).toBeUndefined();
    });

    it('runs test/start scripts through npm adapter branches', async () => {
      const run = vi.fn().mockResolvedValue(0);
      const adapter = new NodeRuntimeAdapter(run);
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      await adapter.runTest('/tmp/node-project');
      await adapter.runStart('/tmp/node-project');

      expect(run).toHaveBeenCalledWith('npm', ['run', 'test'], '/tmp/node-project');
      expect(run).toHaveBeenCalledWith('npm', ['run', 'start'], '/tmp/node-project');
    });
  });

  describe('adapter factory and feature flag', () => {
    it('keeps adapters disabled by default', () => {
      expect(areRuntimeAdaptersEnabled()).toBe(false);
    });

    it('enables adapters with environment flag', () => {
      process.env.RAPIDKIT_ENABLE_RUNTIME_ADAPTERS = '1';
      expect(areRuntimeAdaptersEnabled()).toBe(true);
    });

    it('returns go adapter from factory', async () => {
      const adapter = getRuntimeAdapter('go', {
        runCommandInCwd: vi.fn().mockResolvedValue(0),
        runCoreRapidkit: vi.fn().mockResolvedValue(0),
      });

      expect(adapter.runtime).toBe('go');
      const result = await adapter.checkPrereqs();
      expect(result.exitCode).toBe(0);
    });

    it('returns python adapter from factory', async () => {
      const runCoreRapidkit = vi.fn().mockResolvedValue(0);
      const adapter = getRuntimeAdapter('python', {
        runCommandInCwd: vi.fn().mockResolvedValue(0),
        runCoreRapidkit,
      });

      expect(adapter.runtime).toBe('python');
      const result = await adapter.initProject('/tmp/project');
      expect(result.exitCode).toBe(0);
      expect(runCoreRapidkit).toHaveBeenCalledWith(
        ['init'],
        expect.objectContaining({ cwd: '/tmp/project' })
      );
    });

    it('returns node adapter from factory', async () => {
      const runCommandInCwd = vi.fn().mockResolvedValue(0);
      const adapter = getRuntimeAdapter('node', {
        runCommandInCwd,
        runCoreRapidkit: vi.fn().mockResolvedValue(0),
      });

      expect(adapter.runtime).toBe('node');
      const result = await adapter.initProject('/tmp/project');
      expect(result.exitCode).toBe(0);
      expect(runCommandInCwd).toHaveBeenCalledWith('npm', ['install'], '/tmp/project');
    });
  });
});
