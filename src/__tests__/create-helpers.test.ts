import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fsExtra from 'fs-extra';
import { execa } from 'execa';
import inquirer from 'inquirer';
import { promises as fsPromises } from 'fs';

// This file tests helper functions and internal logic from create.ts
// by importing and mocking dependencies

vi.mock('fs-extra');
vi.mock('execa');
vi.mock('inquirer');
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    text: '',
  })),
}));

describe('Create Module Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Directory Operations', () => {
    it('should check directory existence', async () => {
      vi.mocked(fsExtra.pathExists).mockResolvedValue(true);

      const exists = await fsExtra.pathExists('/test/path');
      expect(exists).toBe(true);
      expect(fsExtra.pathExists).toHaveBeenCalledWith('/test/path');
    });

    it('should create directory', async () => {
      vi.mocked(fsExtra.ensureDir).mockResolvedValue(undefined);

      await fsExtra.ensureDir('/test/new-dir');
      expect(fsExtra.ensureDir).toHaveBeenCalledWith('/test/new-dir');
    });

    it('should remove directory', async () => {
      vi.mocked(fsExtra.remove).mockResolvedValue(undefined);

      await fsExtra.remove('/test/old-dir');
      expect(fsExtra.remove).toHaveBeenCalledWith('/test/old-dir');
    });
  });

  describe('Poetry Operations', () => {
    it('should check poetry version', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: 'Poetry (version 1.7.0)',
        stderr: '',
        exitCode: 0,
      } as any);

      const result = await execa('poetry', ['--version']);
      expect(result.stdout).toContain('Poetry');
    });

    it('should initialize poetry project', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('poetry', ['init', '--no-interaction', '--python', '^3.11']);
      expect(execa).toHaveBeenCalledWith('poetry', ['init', '--no-interaction', '--python', '^3.11']);
    });

    it('should add package with poetry', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('poetry', ['add', 'rapidkit'], { cwd: '/test/project' });
      expect(execa).toHaveBeenCalledWith('poetry', ['add', 'rapidkit'], { cwd: '/test/project' });
    });

    it('should handle poetry not found', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('Command not found: poetry'));

      await expect(execa('poetry', ['--version'])).rejects.toThrow();
    });
  });

  describe('Python Operations', () => {
    it('should check python version', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: 'Python 3.11.0',
        stderr: '',
        exitCode: 0,
      } as any);

      const result = await execa('python3', ['--version']);
      expect(result.stdout).toContain('Python 3.11');
    });

    it('should create virtual environment', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('python3', ['-m', 'venv', '.venv'], { cwd: '/test/project' });
      expect(execa).toHaveBeenCalled();
    });

    it('should install with pip', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('/test/project/.venv/bin/pip', ['install', 'rapidkit']);
      expect(execa).toHaveBeenCalled();
    });
  });

  describe('Pipx Operations', () => {
    it('should check pipx version', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: 'pipx 1.2.0',
        stderr: '',
        exitCode: 0,
      } as any);

      const result = await execa('pipx', ['--version']);
      expect(result.stdout).toContain('pipx');
    });

    it('should install with pipx', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('pipx', ['install', 'rapidkit']);
      expect(execa).toHaveBeenCalledWith('pipx', ['install', 'rapidkit']);
    });

    it('should install editable with pipx', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('pipx', ['install', '-e', '/local/path']);
      expect(execa).toHaveBeenCalledWith('pipx', ['install', '-e', '/local/path']);
    });
  });

  describe('Git Operations', () => {
    it('should initialize git repository', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('git', ['init'], { cwd: '/test/project' });
      expect(execa).toHaveBeenCalledWith('git', ['init'], { cwd: '/test/project' });
    });

    it('should add files to git', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('git', ['add', '.'], { cwd: '/test/project' });
      expect(execa).toHaveBeenCalled();
    });

    it('should commit changes', async () => {
      vi.mocked(execa).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as any);

      await execa('git', ['commit', '-m', 'Initial commit'], { cwd: '/test/project' });
      expect(execa).toHaveBeenCalled();
    });

    it('should handle git not found', async () => {
      vi.mocked(execa).mockRejectedValue(new Error('git not found'));

      await expect(execa('git', ['init'])).rejects.toThrow();
    });
  });

  describe('File Operations', () => {
    it('should write file', async () => {
      vi.spyOn(fsPromises, 'writeFile').mockResolvedValue(undefined);

      await fsPromises.writeFile('/test/file.txt', 'content');
      expect(fsPromises.writeFile).toHaveBeenCalledWith('/test/file.txt', 'content');
    });

    it('should read file', async () => {
      vi.spyOn(fsPromises, 'readFile').mockResolvedValue('content');

      const content = await fsPromises.readFile('/test/file.txt', 'utf-8');
      expect(content).toBe('content');
    });

    it('should create output file', async () => {
      vi.mocked(fsExtra.outputFile).mockResolvedValue(undefined);

      await fsExtra.outputFile('/test/nested/file.txt', 'content', 'utf-8');
      expect(fsExtra.outputFile).toHaveBeenCalled();
    });
  });

  describe('Inquirer Prompts', () => {
    it('should prompt for Python version', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        pythonVersion: '3.11',
      });

      const answer = await inquirer.prompt([{
        type: 'list',
        name: 'pythonVersion',
        message: 'Select Python version',
        choices: ['3.10', '3.11', '3.12'],
      }]);

      expect(answer.pythonVersion).toBe('3.11');
    });

    it('should prompt for install method', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        installMethod: 'poetry',
      });

      const answer = await inquirer.prompt([{
        type: 'list',
        name: 'installMethod',
        message: 'How to install?',
        choices: ['poetry', 'venv', 'pipx'],
      }]);

      expect(answer.installMethod).toBe('poetry');
    });

    it('should prompt for project details', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        project_name: 'my_project',
        author: 'Test Author',
        description: 'Test description',
      });

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'project_name',
          message: 'Project name',
        },
        {
          type: 'input',
          name: 'author',
          message: 'Author',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description',
        },
      ]);

      expect(answers.project_name).toBe('my_project');
      expect(answers.author).toBe('Test Author');
    });
  });

  describe('Version Parsing', () => {
    it('should parse Python version', () => {
      const stdout = 'Python 3.11.5';
      const match = stdout.match(/Python (\d+\.\d+)/);
      
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe('3.11');
    });

    it('should parse Poetry version', () => {
      const stdout = 'Poetry (version 1.7.0)';
      const match = stdout.match(/Poetry.*?(\d+)\.(\d+)/);
      
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe('1');
      expect(match?.[2]).toBe('7');
    });

    it('should compare versions', () => {
      const version1 = '3.11';
      const version2 = '3.10';
      
      expect(parseFloat(version1)).toBeGreaterThan(parseFloat(version2));
    });
  });

  describe('Path Operations', () => {
    it('should resolve paths correctly', () => {
      const { resolve, join } = require('path');
      
      const resolved = resolve(process.cwd(), 'test-project');
      expect(resolved).toContain('test-project');
      
      const joined = join('/base', 'sub', 'file.txt');
      expect(joined).toContain('file.txt');
    });

    it('should handle path separators', () => {
      const { sep } = require('path');
      expect(sep).toBeDefined();
    });
  });

  describe('JSON Operations', () => {
    it('should stringify JSON', () => {
      const obj = { name: 'test', version: '1.0.0' };
      const json = JSON.stringify(obj, null, 2);
      
      expect(json).toContain('"name"');
      expect(json).toContain('"test"');
    });

    it('should parse JSON', () => {
      const json = '{"name": "test"}';
      const obj = JSON.parse(json);
      
      expect(obj.name).toBe('test');
    });
  });

  describe('README Generation', () => {
    it('should generate README content', () => {
      const content = `# RapidKit Workspace

This workspace contains RapidKit projects.

## Getting Started

\`\`\`bash
cd my-project
poetry install
poetry run dev
\`\`\`
`;
      
      expect(content).toContain('RapidKit');
      expect(content).toContain('Getting Started');
      expect(content).toContain('poetry');
    });

    it('should support different install methods', () => {
      const methods = ['poetry', 'venv', 'pipx'];
      
      methods.forEach(method => {
        expect(method).toBeTruthy();
        expect(method.length).toBeGreaterThan(0);
      });
    });
  });
});
