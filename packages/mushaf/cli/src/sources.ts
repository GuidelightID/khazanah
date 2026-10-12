/**
 * Allowlisted data sources for `mushaf data pull` (ADR-013).
 * Restricted vendor fonts/IR stay disabled until LICENSES/matrix.md is cleared.
 */

export interface PullSource {
  id: string;
  displayName: string;
  /** SPDX or LicenseRef for pulled assets */
  licenseSpdx: string;
  allowsNpmRedistribution: boolean;
  description: string;
  /** Built-in puller id */
  kind: 'fixture' | 'disabled';
  disabledReason?: string;
}

export const PULL_SOURCES: PullSource[] = [
  {
    id: 'fixture',
    displayName: 'Synthetic fixture pages (MIT)',
    licenseSpdx: 'MIT',
    allowsNpmRedistribution: true,
    description: 'Writes demo MushafPageIR pages 1–5 + pages.manifest.json for local/dev.',
    kind: 'fixture',
  },
  {
    id: 'kfgqpc',
    displayName: 'KFGQPC / QPC Madinah geometry',
    licenseSpdx: 'LicenseRef-KFGQPC-Vendor',
    allowsNpmRedistribution: false,
    description: 'Official page fonts/geometry — blocked until license matrix row is approved.',
    kind: 'disabled',
    disabledReason:
      'Fill LICENSES/matrix.md legal checkbox and implement allowlisted download URLs.',
  },
  {
    id: 'quran-foundation',
    displayName: 'Quran Foundation API snapshot',
    licenseSpdx: 'LicenseRef-QuranFoundation-ToS',
    allowsNpmRedistribution: false,
    description: 'Not pulled as redistributable corpus; use @guidelight/mushaf-adapter-quran-foundation at runtime.',
    kind: 'disabled',
    disabledReason: 'Use the online adapter + app cache; do not republish API data via CLI.',
  },
];

export function getSource(id: string): PullSource | undefined {
  return PULL_SOURCES.find((s) => s.id === id);
}
