import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger.js';
import chalk from 'chalk';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    logger.setDebug(false);
  });

  describe('setDebug', () => {
    it('should enable debug mode', () => {
      logger.setDebug(true);
      logger.debug('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.gray('[DEBUG] test message'));
    });

    it('should disable debug mode', () => {
      logger.setDebug(false);
      logger.debug('test message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages when debug is enabled', () => {
      logger.setDebug(true);
      logger.debug('debug message', 'arg1', 'arg2');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        chalk.gray('[DEBUG] debug message'),
        'arg1',
        'arg2'
      );
    });

    it('should not log debug messages when debug is disabled', () => {
      logger.setDebug(false);
      logger.debug('debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('info message');
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.blue('info message'));
    });

    it('should log info messages with additional arguments', () => {
      logger.info('info message', 'arg1', 'arg2');
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.blue('info message'), 'arg1', 'arg2');
    });
  });

  describe('success', () => {
    it('should log success messages', () => {
      logger.success('success message');
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.green('success message'));
    });

    it('should log success messages with additional arguments', () => {
      logger.success('success message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.green('success message'), { key: 'value' });
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('warning message');
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.yellow('warning message'));
    });

    it('should log warning messages with additional arguments', () => {
      logger.warn('warning message', 123);
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.yellow('warning message'), 123);
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith(chalk.red('error message'));
    });

    it('should log error messages with additional arguments', () => {
      const errorObj = new Error('test error');
      logger.error('error message', errorObj);
      expect(consoleErrorSpy).toHaveBeenCalledWith(chalk.red('error message'), errorObj);
    });
  });

  describe('step', () => {
    it('should log step messages with progress', () => {
      logger.step(1, 5, 'First step');
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.cyan('\n[1/5]'), chalk.white('First step'));
    });

    it('should log step messages with different numbers', () => {
      logger.step(3, 10, 'Third step');
      expect(consoleLogSpy).toHaveBeenCalledWith(chalk.cyan('\n[3/10]'), chalk.white('Third step'));
    });
  });
});
