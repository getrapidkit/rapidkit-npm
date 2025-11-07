import { describe, it, expect } from 'vitest';
import {
  RapidKitError,
  PythonNotFoundError,
  PoetryNotFoundError,
  PipxNotFoundError,
  DirectoryExistsError,
  InvalidProjectNameError,
  InstallationError,
  RapidKitNotAvailableError,
} from '../errors.js';

describe('Error classes', () => {
  it('should create RapidKitError with code and details', () => {
    const error = new RapidKitError('Test error', 'TEST_ERROR', 'Some details');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.details).toBe('Some details');
    expect(error.name).toBe('RapidKitError');
  });

  it('should create PythonNotFoundError with version', () => {
    const error = new PythonNotFoundError('3.11');
    expect(error.message).toContain('Python 3.11+');
    expect(error.code).toBe('PYTHON_NOT_FOUND');
    expect(error.details).toContain('python.org');
  });

  it('should create PythonNotFoundError with found version', () => {
    const error = new PythonNotFoundError('3.11', '3.9');
    expect(error.message).toContain('required');
    expect(error.message).toContain('found 3.9');
  });

  it('should create PoetryNotFoundError', () => {
    const error = new PoetryNotFoundError();
    expect(error.message).toContain('Poetry');
    expect(error.code).toBe('POETRY_NOT_FOUND');
    expect(error.details).toContain('python-poetry.org');
  });

  it('should create PipxNotFoundError', () => {
    const error = new PipxNotFoundError();
    expect(error.message).toContain('pipx');
    expect(error.code).toBe('PIPX_NOT_FOUND');
  });

  it('should create DirectoryExistsError', () => {
    const error = new DirectoryExistsError('my-project');
    expect(error.message).toContain('my-project');
    expect(error.code).toBe('DIRECTORY_EXISTS');
  });

  it('should create InvalidProjectNameError', () => {
    const error = new InvalidProjectNameError('My-Project', 'Must be lowercase');
    expect(error.message).toContain('My-Project');
    expect(error.code).toBe('INVALID_PROJECT_NAME');
    expect(error.details).toBe('Must be lowercase');
  });

  it('should create InstallationError', () => {
    const originalError = new Error('Connection timeout');
    const error = new InstallationError('Installing dependencies', originalError);
    expect(error.message).toContain('Installing dependencies');
    expect(error.code).toBe('INSTALLATION_ERROR');
    expect(error.details).toContain('Connection timeout');
    expect(error.details).toContain('Troubleshooting');
  });

  it('should create RapidKitNotAvailableError', () => {
    const error = new RapidKitNotAvailableError();
    expect(error.message).toContain('not yet available');
    expect(error.code).toBe('RAPIDKIT_NOT_AVAILABLE');
    expect(error.details).toContain('--demo');
  });
});
