import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const adapterCheckPrereqs = vi.fn();
const adapterDoctorHints = vi.fn();
const getRuntimeAdapterMock = vi.fn();
const areRuntimeAdaptersEnabledMock = vi.fn();
const cacheClearMock = vi.fn();

vi.mock('../runtime-adapters/index.js', () => ({
  getRuntimeAdapter: getRuntimeAdapterMock,
  areRuntimeAdaptersEnabled: areRuntimeAdaptersEnabledMock,
}));

vi.mock('../utils/cache.js', () => ({
  Cache: {
    getInstance: vi.fn(() => ({
      clear: cacheClearMock,
    })),
  },
}));

describe('Phase 3 command contract handlers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    areRuntimeAdaptersEnabledMock.mockReturnValue(false);
    getRuntimeAdapterMock.mockReturnValue({
      checkPrereqs: adapterCheckPrereqs,
      doctorHints: adapterDoctorHints,
    });

    adapterCheckPrereqs.mockResolvedValue({ exitCode: 0 });
    adapterDoctorHints.mockResolvedValue([]);
    cacheClearMock.mockResolvedValue(undefined);

    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.RAPIDKIT_ENABLE_RUNTIME_ADAPTERS;
  });

  describe('bootstrap', () => {
    it('rewrites bootstrap command to init and preserves trailing args', async () => {
      const index = await import('../index.js');
      const initRunner = vi.fn().mockResolvedValue(0);

      const code = await index.handleBootstrapCommand(['bootstrap', './apps/api'], initRunner);

      expect(initRunner).toHaveBeenCalledWith(['init', './apps/api']);
      expect(code).toBe(0);
    });

    it('propagates init runner exit code', async () => {
      const index = await import('../index.js');
      const initRunner = vi.fn().mockResolvedValue(1);

      const code = await index.handleBootstrapCommand(['bootstrap'], initRunner);

      expect(code).toBe(1);
    });
  });

  describe('setup', () => {
    it('returns usage error for unsupported runtime', async () => {
      const index = await import('../index.js');

      const code = await index.handleSetupCommand(['setup', 'ruby']);

      expect(code).toBe(1);
      expect(getRuntimeAdapterMock).not.toHaveBeenCalled();
    });

    it('returns error when runtime adapters are disabled', async () => {
      const index = await import('../index.js');
      areRuntimeAdaptersEnabledMock.mockReturnValue(false);

      const code = await index.handleSetupCommand(['setup', 'python']);

      expect(code).toBe(1);
      expect(getRuntimeAdapterMock).not.toHaveBeenCalled();
    });

    it('runs prereq checks and returns adapter exit code when enabled', async () => {
      const index = await import('../index.js');
      areRuntimeAdaptersEnabledMock.mockReturnValue(true);
      adapterCheckPrereqs.mockResolvedValue({ exitCode: 2 });
      adapterDoctorHints.mockResolvedValue(['Install runtime']);

      const code = await index.handleSetupCommand(['setup', 'node']);

      expect(getRuntimeAdapterMock).toHaveBeenCalledWith('node', expect.any(Object));
      expect(adapterCheckPrereqs).toHaveBeenCalledTimes(1);
      expect(adapterDoctorHints).toHaveBeenCalledWith(process.cwd());
      expect(code).toBe(2);
    });
  });

  describe('cache', () => {
    it('shows status by default', async () => {
      const index = await import('../index.js');

      const code = await index.handleCacheCommand(['cache']);

      expect(code).toBe(0);
      expect(cacheClearMock).not.toHaveBeenCalled();
    });

    it('clears cache for clear/prune/repair actions', async () => {
      const index = await import('../index.js');

      const clearCode = await index.handleCacheCommand(['cache', 'clear']);
      const pruneCode = await index.handleCacheCommand(['cache', 'prune']);
      const repairCode = await index.handleCacheCommand(['cache', 'repair']);

      expect(clearCode).toBe(0);
      expect(pruneCode).toBe(0);
      expect(repairCode).toBe(0);
      expect(cacheClearMock).toHaveBeenCalledTimes(3);
    });

    it('returns usage error for unsupported action', async () => {
      const index = await import('../index.js');

      const code = await index.handleCacheCommand(['cache', 'unknown']);

      expect(code).toBe(1);
      expect(cacheClearMock).not.toHaveBeenCalled();
    });
  });

  describe('core forwarding boundary', () => {
    it('keeps bootstrap/setup/cache npm-local and never forwards to core', async () => {
      const index = await import('../index.js');

      await expect(index.shouldForwardToCore(['bootstrap'])).resolves.toBe(false);
      await expect(index.shouldForwardToCore(['setup', 'python'])).resolves.toBe(false);
      await expect(index.shouldForwardToCore(['cache', 'status'])).resolves.toBe(false);
    });
  });
});
