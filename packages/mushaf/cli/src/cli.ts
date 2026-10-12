#!/usr/bin/env node
/**
 * Mushaf CLI — dual-distribution asset helper (ADR-013).
 */
import { getSource, PULL_SOURCES } from './sources.js';
import { pullFixtureSource } from './pull-fixture.js';
import { flagValue } from './args.js';

function printHelp(): void {
  const sourceLines = PULL_SOURCES.map(
    (s) =>
      `  ${s.id.padEnd(18)} ${s.kind === 'disabled' ? '(disabled) ' : ''}${s.displayName}`,
  ).join('\n');

  console.log(`mushaf — Mushaf CLI

Usage:
  mushaf data pull --source <id> --out <dir>
  mushaf data sources
  mushaf help

Sources:
${sourceLines}

Notes:
  - Downloads/writes are allowlisted; restricted assets stay disabled until
    LICENSES/matrix.md is approved.
  - Restricted fonts/IR are never relicensed as MIT.
  - Fixture source is MIT synthetic data for local development only.
`);
}

async function dataPull(args: string[]): Promise<number> {
  const sourceId = flagValue(args, '--source');
  const out = flagValue(args, '--out');

  if (!sourceId || !out) {
    console.error('error: --source and --out are required');
    printHelp();
    return 1;
  }

  const source = getSource(sourceId);
  if (!source) {
    console.error(`error: unknown source "${sourceId}". Run: mushaf data sources`);
    return 1;
  }

  if (source.kind === 'disabled') {
    console.error(
      `error: source "${source.id}" is disabled.\n` +
        `  ${source.disabledReason ?? 'See LICENSES/matrix.md'}\n` +
        `  license: ${source.licenseSpdx} (allowsNpmRedistribution=${source.allowsNpmRedistribution})`,
    );
    return 2;
  }

  if (source.kind === 'fixture') {
    const result = await pullFixtureSource(out);
    console.log(
      `pulled fixture → ${result.outDir}\n` +
        `  pages: ${result.pagesWritten}\n` +
        `  manifest: ${result.manifestPath}\n` +
        `  notice: ${result.noticePath}`,
    );
    return 0;
  }

  console.error(`error: no puller implemented for kind`);
  return 1;
}

function dataSources(): number {
  for (const s of PULL_SOURCES) {
    const status = s.kind === 'disabled' ? 'disabled' : 'ok';
    console.log(`${s.id}\t${status}\t${s.licenseSpdx}\t${s.displayName}`);
  }
  return 0;
}

async function main(argv: string[]): Promise<number> {
  const [cmd, sub, ...rest] = argv.slice(2);

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    return 0;
  }

  if (cmd === 'data' && sub === 'sources') {
    return dataSources();
  }

  if (cmd === 'data' && sub === 'pull') {
    return dataPull(rest);
  }

  console.error(`Unknown command: ${cmd} ${sub ?? ''}`.trim());
  printHelp();
  return 1;
}

main(process.argv)
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
