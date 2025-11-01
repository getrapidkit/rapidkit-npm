/**
 * Custom error classes for rapidkit
 */

export class RapidKitError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string
  ) {
    super(message);
    this.name = 'RapidKitError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PythonNotFoundError extends RapidKitError {
  constructor(requiredVersion: string, foundVersion?: string) {
    const message = foundVersion
      ? `Python ${requiredVersion}+ required, found ${foundVersion}`
      : `Python ${requiredVersion}+ not found`;
    super(
      message,
      'PYTHON_NOT_FOUND',
      `Please install Python from https://www.python.org/downloads/`
    );
  }
}

export class PoetryNotFoundError extends RapidKitError {
  constructor() {
    super(
      'Poetry is not installed',
      'POETRY_NOT_FOUND',
      'Install Poetry from https://python-poetry.org/docs/#installation'
    );
  }
}

export class PipxNotFoundError extends RapidKitError {
  constructor() {
    super(
      'pipx is not installed',
      'PIPX_NOT_FOUND',
      'Install pipx from https://pypa.github.io/pipx/installation/'
    );
  }
}

export class DirectoryExistsError extends RapidKitError {
  constructor(dirName: string) {
    super(
      `Directory "${dirName}" already exists`,
      'DIRECTORY_EXISTS',
      'Please choose a different name or remove the existing directory'
    );
  }
}

export class InvalidProjectNameError extends RapidKitError {
  constructor(name: string, reason: string) {
    super(`Invalid project name: "${name}"`, 'INVALID_PROJECT_NAME', reason);
  }
}

export class InstallationError extends RapidKitError {
  constructor(step: string, originalError: Error) {
    super(`Installation failed at step: ${step}`, 'INSTALLATION_ERROR', originalError.message);
  }
}

export class RapidKitNotAvailableError extends RapidKitError {
  constructor() {
    super(
      'RapidKit Python package is not yet available on PyPI',
      'RAPIDKIT_NOT_AVAILABLE',
      'Please use --demo mode or --test-mode with a local RapidKit installation'
    );
  }
}
