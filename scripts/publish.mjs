#!/usr/bin/env node
// Publish every public workspace package whose current version is not on npm
// yet, with `npm publish`. In GitHub Actions, npm >= 11.5.1 authenticates via
// npm trusted publishing (OIDC) and adds provenance automatically. Afterwards
// `changeset tag` creates the git tags; changesets/action reads its
// "New tag:" output to create GitHub releases.
//
//   node scripts/publish.mjs            publish
//   node scripts/publish.mjs --dry-run  show what would be published
//
// `npm publish` does not rewrite `workspace:` ranges, so a package that still
// depends on another workspace package that way is refused instead of being
// published broken.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dryRun = process.argv.includes('--dry-run');
const root = fileURLToPath(new URL('..', import.meta.url));

function packageDirs() {
  const dirs = [];
  const walk = (dir, depth) => {
    if (existsSync(join(dir, 'package.json'))) dirs.push(dir);
    if (depth === 0) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !['node_modules', 'dist', 'src'].includes(entry.name)) {
        walk(join(dir, entry.name), depth - 1);
      }
    }
  };
  walk(join(root, 'packages'), 3);
  return dirs;
}

function isPublished(name, version) {
  try {
    execFileSync('npm', ['view', `${name}@${version}`, 'version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

let published = 0;
for (const dir of packageDirs()) {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  if (pkg.private) continue;

  if (isPublished(pkg.name, pkg.version)) {
    console.log(`= ${pkg.name}@${pkg.version} already on npm`);
    continue;
  }

  const workspaceDeps = ['dependencies', 'peerDependencies', 'optionalDependencies']
    .flatMap((field) => Object.entries(pkg[field] ?? {}))
    .filter(([, range]) => String(range).startsWith('workspace:'));
  if (workspaceDeps.length > 0) {
    console.error(
      `! ${pkg.name}: workspace: ranges (${workspaceDeps.map(([n]) => n).join(', ')}), refusing to publish`,
    );
    process.exitCode = 1;
    continue;
  }

  console.log(`+ ${pkg.name}@${pkg.version}${dryRun ? ' (dry run)' : ''}`);
  execFileSync('npm', ['publish', '--access', 'public', ...(dryRun ? ['--dry-run'] : [])], {
    cwd: dir,
    stdio: 'inherit',
  });
  published++;
}

if (published > 0 && !dryRun) {
  execFileSync('pnpm', ['changeset', 'tag'], { cwd: root, stdio: 'inherit' });
}
