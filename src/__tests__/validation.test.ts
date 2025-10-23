import { describe, it, expect } from 'vitest';
import { validateProjectName, toSnakeCase, toKebabCase } from '../validation.js';
import { InvalidProjectNameError } from '../errors.js';

describe('validateProjectName', () => {
  it('should accept valid project names', () => {
    expect(validateProjectName('my-api')).toBe(true);
    expect(validateProjectName('my_api')).toBe(true);
    expect(validateProjectName('myapi')).toBe(true);
    expect(validateProjectName('my-awesome-api')).toBe(true);
    expect(validateProjectName('api2024')).toBe(true);
  });

  it('should reject names starting with uppercase', () => {
    expect(() => validateProjectName('My-Api')).toThrow(InvalidProjectNameError);
    expect(() => validateProjectName('API')).toThrow(InvalidProjectNameError);
  });

  it('should reject names starting with numbers', () => {
    expect(() => validateProjectName('123api')).toThrow(InvalidProjectNameError);
  });

  it('should reject names with invalid characters', () => {
    expect(() => validateProjectName('my@api')).toThrow(InvalidProjectNameError);
    expect(() => validateProjectName('my api')).toThrow(InvalidProjectNameError);
    expect(() => validateProjectName('my.api')).toThrow(InvalidProjectNameError);
  });

  it('should reject reserved names', () => {
    expect(() => validateProjectName('test')).toThrow(InvalidProjectNameError);
    expect(() => validateProjectName('python')).toThrow(InvalidProjectNameError);
    expect(() => validateProjectName('rapidkit')).toThrow(InvalidProjectNameError);
  });

  it('should reject names that are too short', () => {
    expect(() => validateProjectName('a')).toThrow(InvalidProjectNameError);
  });

  it('should reject names that are too long', () => {
    const longName = 'a'.repeat(215);
    expect(() => validateProjectName(longName)).toThrow(InvalidProjectNameError);
  });
});

describe('toSnakeCase', () => {
  it('should convert kebab-case to snake_case', () => {
    expect(toSnakeCase('my-api')).toBe('my_api');
    expect(toSnakeCase('my-awesome-api')).toBe('my_awesome_api');
  });

  it('should leave snake_case unchanged', () => {
    expect(toSnakeCase('my_api')).toBe('my_api');
  });

  it('should handle mixed cases', () => {
    expect(toSnakeCase('my-api_test')).toBe('my_api_test');
  });
});

describe('toKebabCase', () => {
  it('should convert snake_case to kebab-case', () => {
    expect(toKebabCase('my_api')).toBe('my-api');
    expect(toKebabCase('my_awesome_api')).toBe('my-awesome-api');
  });

  it('should leave kebab-case unchanged', () => {
    expect(toKebabCase('my-api')).toBe('my-api');
  });

  it('should handle mixed cases', () => {
    expect(toKebabCase('my_api-test')).toBe('my-api-test');
  });
});
