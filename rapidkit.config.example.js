/**
 * RapidKit Configuration File
 * 
 * Place this file in your project root as:
 * - rapidkit.config.js (CommonJS)
 * - rapidkit.config.mjs (ES Module)
 * - rapidkit.config.cjs (CommonJS explicit)
 * 
 * This file is automatically detected when creating workspaces or projects.
 * CLI arguments override config file settings.
 */

export default {
  // Workspace configuration
  workspace: {
    // Default author name for new workspaces
    defaultAuthor: 'Your Name or Team',
    
    // Default Python version to use
    // Options: '3.10' | '3.11' | '3.12'
    pythonVersion: '3.10',
    
    // Default installation method for RapidKit Core
    // Options: 'poetry' | 'venv' | 'pipx'
    installMethod: 'poetry',
  },
  
  // Project configuration
  projects: {
    // Default kit/template to use when creating projects
    // Examples: 'fastapi.standard', 'fastapi.ddd', 'nestjs.standard'
    defaultKit: 'fastapi.standard',
    
    // Default modules to add to new projects
    // These modules will be automatically added after project creation
    addDefaultModules: [
      // 'prisma',          // Database ORM
      // 'redis',           // Caching
      // 'auth-jwt',        // JWT Authentication
      // 'monitoring',      // Monitoring and logging
    ],
    
    // Skip git initialization by default
    skipGit: false,
    
    // Skip dependency installation by default
    skipInstall: false,
  },
};

// Example usage:
// npx rapidkit my-workspace
// → Uses config: author='Your Name or Team', pythonVersion='3.10', installMethod='poetry'
//
// npx rapidkit my-workspace --author "Different Author"
// → Overrides: author='Different Author', but still uses pythonVersion='3.10', installMethod='poetry'
//
// npx rapidkit create project my-api
// → Uses config: defaultKit='fastapi.standard', adds default modules
