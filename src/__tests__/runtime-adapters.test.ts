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
  });

  describe('PythonRuntimeAdapter', () => {
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
      expect(runCoreRapidkit).toHaveBeenCalledWith(['init'], { cwd: '/tmp/project' });
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
