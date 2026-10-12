# License matrix (ADR-013)

This table is the **normative gate** for redistributing fonts, page IR, Quran text, and tajweed data.

| Source | SPDX / name | URL | Text | Geometry IR | Fonts | `allowsNpmRedistribution` | `allowsModification` | Package strategy | Legal check |
|--------|-------------|-----|------|-------------|-------|---------------------------|----------------------|------------------|-------------|
| Synthetic fixtures | MIT | in-repo | yes | yes | n/a | yes | yes | `@guidelight/mushaf-core` fixtures | ✅ |
| Quran Foundation API-derived cache | per QF ToS | api docs | via API | via API | n/a | **no** (local cache only) | limited | adapter + app cache | ⬜ counsel |
| QPC / KFGQPC fonts | vendor | vendor site | n/a | n/a | yes | **often no** | often no | CLI pull only | ⬜ counsel |
| Community open IR (TBD) | TBD | TBD | TBD | TBD | TBD | per row | per row | npm or CLI | ⬜ |

## Rules

1. First-party TypeScript/CSS is **MIT**.
2. Never relicense third-party assets as MIT.
3. `mushaf data pull` verifies `sha256` from an allowlisted manifest and writes `NOTICE`.
4. npm packages for data/fonts require `allowsNpmRedistribution: true` **and** tarball size ceiling.
5. Empty checkbox rows **block** publish PRs for that source.
