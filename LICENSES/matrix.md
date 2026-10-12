# License matrix (ADR-013)

This table is the **normative gate** for redistributing fonts, page IR, Quran text, translations, dzikir/doa collections, and tajweed data.

| Source | SPDX / name | URL | Text | Geometry IR | Fonts | `allowsNpmRedistribution` | `allowsModification` | Package strategy | Legal check |
|--------|-------------|-----|------|-------------|-------|---------------------------|----------------------|------------------|-------------|
| Synthetic fixtures | MIT | in-repo | yes | yes | n/a | yes | yes | `@guidelightid/mushaf-core` fixtures | ✅ |
| Quran Foundation API-derived cache | per QF ToS | api docs | via API | via API | n/a | **no** (local cache only) | limited | adapter + app cache | ⬜ counsel |
| QPC / KFGQPC fonts | vendor | vendor site | n/a | n/a | yes | **often no** | often no | CLI pull only | ⬜ counsel |
| Community open IR (TBD) | TBD | TBD | TBD | TBD | TBD | per row | per row | npm or CLI | ⬜ |
| aliifam/almatsurat — Al-Ma'tsurat sugro/kubro, pagi/petang (Arabic, transliteration, Indonesian translation) | MIT | https://github.com/aliifam/almatsurat | yes | n/a | n/a | yes (keep copyright notice) | yes | `@guidelightid/almatsurat` | ✅ |
| EQuran.id API v2 — Arabic text, Indonesian translation, transliteration, surah descriptions (Kemenag/LPMQ) | EQuran.id terms: Arabic text free to use; translations © (share with credit, not for sale) | https://equran.id/terms | via API | n/a | n/a | **not bundled**: consumers fetch it at runtime with the `equran` SDK | no | `@guidelightid/quran/equran` (adapter only) | ✅ not redistributed |
| Surah index (number, slug, Latin/Arabic name, ayah count, revelation) | first-party, MIT (structural facts) | in-repo | n/a | n/a | n/a | yes | yes | `@guidelightid/quran` | ✅ |

## Rules

1. First-party TypeScript/CSS is **MIT**.
2. Never relicense third-party assets as MIT.
3. `mushaf data pull` verifies `sha256` from an allowlisted manifest and writes `NOTICE`.
4. npm packages for data/fonts require `allowsNpmRedistribution: true` **and** tarball size ceiling.
5. Empty checkbox rows **block** publish PRs for that source.
