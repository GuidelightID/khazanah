/**
 * Phase A spot-check: verse → page via Quran Foundation adapter.
 * Usage (from monorepo root, after build):
 *   node examples/guidelight-spike/parity-check.mjs
 *
 * Requires network. Exit 0 if all keys resolve.
 */
import { createQuranFoundationAdapter } from '../../packages/adapters/quran-foundation/dist/index.js';

const keys = ['1:1', '2:255', '18:1', '114:6'];

const adapter = createQuranFoundationAdapter();
const catalog = await adapter.getCatalog();
console.log('surahs:', catalog.surahs.length, 'pageCount:', catalog.pageCount);

let failed = 0;
for (const key of keys) {
  try {
    const page = await adapter.getPageForVerse(key);
    console.log(key, '→ page', page);
  } catch (e) {
    failed += 1;
    console.error(key, 'FAILED', e.message ?? e);
  }
}

process.exit(failed ? 1 : 0);
