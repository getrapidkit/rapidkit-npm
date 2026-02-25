import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  path.join(root, 'README.md'),
  ...fs
    .readdirSync(path.join(root, 'docs'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(root, 'docs', name)),
];

const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
const errors = [];

for (const file of targets) {
  const raw = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  for (const match of raw.matchAll(linkRegex)) {
    const href = (match[1] || '').trim();
    if (!href) continue;

    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('#')
    ) {
      continue;
    }

    const [filePart] = href.split('#');
    const resolved = path.resolve(dir, filePart);
    if (!fs.existsSync(resolved)) {
      errors.push(`${path.relative(root, file)} -> missing: ${href}`);
    }
  }
}

if (errors.length) {
  console.error('❌ Markdown link check failed:\n');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log('✅ Markdown local links are valid.');
