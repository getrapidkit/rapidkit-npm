import fs from 'fs';
import path from 'path';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

const npmRoot = path.resolve(process.cwd());
const coreSchema = process.env.RAPIDKIT_CORE_SCHEMA_PATH
  ? path.resolve(process.env.RAPIDKIT_CORE_SCHEMA_PATH)
  : path.resolve(npmRoot, '..', '..', 'core', 'docs', 'contracts', 'rapidkit-cli-contracts.json');
const npmSchema = path.resolve(npmRoot, 'docs', 'contracts', 'rapidkit-cli-contracts.json');

if (!fs.existsSync(coreSchema)) {
  console.error(`Core contract schema not found: ${coreSchema}`);
  process.exit(1);
}

const coreContent = fs.readFileSync(coreSchema, 'utf-8');
const npmExists = fs.existsSync(npmSchema);
const npmContent = npmExists ? fs.readFileSync(npmSchema, 'utf-8') : '';

if (checkOnly) {
  if (coreContent !== npmContent) {
    console.error('Contract schema mismatch between Core and npm.');
    console.error(`Core: ${coreSchema}`);
    console.error(`NPM:  ${npmSchema}`);
    process.exit(1);
  }
  console.log('Contract schema is in sync.');
  process.exit(0);
}

fs.mkdirSync(path.dirname(npmSchema), { recursive: true });
fs.writeFileSync(npmSchema, coreContent, 'utf-8');
console.log('Contract schema synced from Core to npm.');
