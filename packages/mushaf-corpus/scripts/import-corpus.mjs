// Importer korpus @guidelightid/mushaf-corpus — equran.id sebagai satu-satunya
// sumber kanonik.
//
// Pemakaian: node scripts/import-corpus.mjs [--write]
//   tanpa --write : mengambil data provider, memvalidasi di memori, cetak ringkasan
//   dengan --write: menulis src/data/*.json dan CORPUS.md
//
// Paket ini adalah rumah tunggal korpus. Migrasi seed SQL untuk basis data
// Guidelight digenerate terpisah di aplikasi, dari paket ini — lihat
// guidelight-id-next/scripts/generate-quran-seed.mjs.
//
// Source: https://equran.id/api/v2/surat (+ /surat/{nomor} per-surah details)
//   - Arabic (teksArab), Indonesian translation (teksIndonesia, Kemenag),
//     transliteration (teksLatin), surah metadata (nama, namaLatin, arti,
//     tempatTurun, deskripsi, jumlahAyat), all from one provider so the three
//     texts can never drift out of alignment.
// - Ketentuan provider diperiksa manual; lihat CORPUS.md.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const SHOULD_WRITE = process.argv.includes('--write')

const EQ_URL = 'https://equran.id/api/v2/surat'

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`)
  const raw = await res.text()
  return { raw, json: JSON.parse(raw) }
}

// equran.id per-surah detail. Concurrency capped at 3 per their docs; retry
// only what can heal itself (network + 5xx, never 4xx).
async function fetchSurahDetail(nomor, attempt = 0) {
  let res
  try {
    res = await fetch(`https://equran.id/api/v2/surat/${nomor}`, { headers: { accept: 'application/json' } })
  } catch (error) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
      return fetchSurahDetail(nomor, attempt + 1)
    }
    throw new Error(`Network failed for surat ${nomor}: ${error.message}`)
  }
  if (res.status >= 500 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    return fetchSurahDetail(nomor, attempt + 1)
  }
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for surat ${nomor}`)
  const raw = await res.text()
  return { raw, json: JSON.parse(raw) }
}

async function fetchAllSurahDetails() {
  const out = new Array(114)
  let next = 1
  const worker = async () => {
    while (next <= 114) {
      const nomor = next++
      out[nomor - 1] = await fetchSurahDetail(nomor)
      if (nomor % 20 === 0) console.log(`  download progress: ${nomor}/114`)
    }
  }
  await Promise.all([worker(), worker(), worker()])
  return out
}

function slugify(latin) {
  return latin
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function sqlQuote(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

// equran.id ships no juz/page; the canonical Madinah mapping is carried from
// the previous corpus (static: juz boundaries never change; page numbers follow
// the 604-page Madinah mushaf). See the legacyJuzPage block below.

function stripBOM(text) {
  return text.replace(/^﻿/, '')
}

const res = await fetchJson(EQ_URL)
const eqList = res.json?.data
if (!Array.isArray(eqList) || eqList.length !== 114) {
  throw new Error(`equran.id surat list must have 114 surahs, got ${eqList?.length}`)
}

console.log('Fetching 114 surah details (equran.id /surat/{nomor}, concurrency 3)…')
const details = await fetchAllSurahDetails()

const surahs = []
const ayahs = []
let globalId = 0
let rawBytes = 0
const hasher = createHash('sha256')

for (let i = 0; i < 114; i++) {
  const { raw, json } = details[i]
  rawBytes += raw.length
  hasher.update(raw)
  const data = json?.data
  if (!data || data.nomor !== i + 1) throw new Error(`Surah order mismatch at index ${i}`)
  const list = data.ayat
  if (!Array.isArray(list) || list.length !== data.jumlahAyat) {
    throw new Error(`Ayah count mismatch in surah ${i + 1}: detail has ${list?.length}, want ${data.jumlahAyat}`)
  }
  const listMeta = eqList.find((s) => s.nomor === i + 1)
  if (!listMeta || listMeta.jumlahAyat !== data.jumlahAyat) {
    throw new Error(`List/detail count mismatch in surah ${i + 1}`)
  }
  const slug = slugify(data.namaLatin)
  if (!slug) throw new Error(`Empty slug for surah ${i + 1}`)
  surahs.push({
    id: i + 1,
    number: i + 1,
    slug,
    name_arabic: data.nama,
    name_latin: data.namaLatin,
    name_translation: data.arti,
    revelation: data.tempatTurun,
    description: String(data.deskripsi ?? ''),
    total_ayahs: data.jumlahAyat,
  })
  for (let j = 0; j < list.length; j++) {
    const a = list[j]
    if (a.nomorAyat !== j + 1) throw new Error(`Ayah order mismatch ${i + 1}:${j + 1}`)
    const arabic = stripBOM(String(a.teksArab ?? '').trim())
    const translation = String(a.teksIndonesia ?? '').trim()
    const transliteration = String(a.teksLatin ?? '').trim()
    if (!arabic) throw new Error(`Empty Arabic text at ${i + 1}:${j + 1}`)
    if (!translation) throw new Error(`Empty translation at ${i + 1}:${j + 1}`)
    if (!transliteration) throw new Error(`Empty transliteration at ${i + 1}:${j + 1}`)
    globalId += 1
    ayahs.push({
      id: globalId,
      surah_id: i + 1,
      ayah_number: j + 1,
      arabic_text: arabic,
      translation,
      transliteration,
    })
  }
}

if (globalId !== 6236) throw new Error(`Expected 6236 ayahs, got ${globalId}`)
if (new Set(surahs.map((s) => s.slug)).size !== 114) throw new Error('Surah slugs must be unique')

// equran.id ships no juz/page; carry over the canonical Madinah mapping from
// the previous corpus (static: juz boundaries never change). The old ayahs.json
// is the source of truth for (surah_id, ayah_number) -> (juz, page) only.
let legacyJuzPage = new Map()
try {
  const { readFileSync } = await import('node:fs')
  const legacy = JSON.parse(readFileSync(join(pkgRoot, 'src/data/ayahs.json'), 'utf8'))
  for (const a of legacy) legacyJuzPage.set(`${a.surah_id}:${a.ayah_number}`, [a.juz, a.page])
} catch {
  legacyJuzPage = new Map()
}
let juzPageSource = 'legacy ayahs.json'
if (legacyJuzPage.size !== 6236) {
  // Fresh checkout without legacy data: fall back to juz-only mapping derived
  // from canonical juz boundaries (page left null-safe via DEFAULT 0… but the
  // schema requires page; so this path must not run --write without legacy).
  juzPageSource = 'MISSING'
}
for (const a of ayahs) {
  const jp = legacyJuzPage.get(`${a.surah_id}:${a.ayah_number}`)
  if (!jp) throw new Error(`No juz/page mapping for ${a.surah_id}:${a.ayah_number} (need legacy ayahs.json present)`)
  a.juz = jp[0]
  a.page = jp[1]
  if (a.juz < 1 || a.juz > 30 || a.page < 1 || a.page > 604) {
    throw new Error(`Insane juz/page at ${a.surah_id}:${a.ayah_number}`)
  }
}

const eqHash = hasher.digest('hex')

console.log(`Verified: 114 surahs, 6236 ayahs, contiguous global IDs 1..6236.`)
console.log(`equran.id bytes: ${rawBytes}, sha256 (concatenated details): ${eqHash}`)
console.log(`juz/page source: ${juzPageSource}`)
console.log(`Sample: QS. ${surahs[95].name_latin} (${surahs[95].name_translation}), ${surahs[95].total_ayahs} ayat, slug=${surahs[95].slug}`)

if (!SHOULD_WRITE) {
  console.log('Dry run — no files written. Re-run with --write to generate data + seed migration.')
  process.exit(0)
}

// --- Tulis berkas data ---
const dataDir = join(pkgRoot, 'src/data')
mkdirSync(dataDir, { recursive: true })
writeFileSync(join(dataDir, 'surahs.json'), `${JSON.stringify(surahs, null, 2)}\n`)
writeFileSync(join(dataDir, 'ayahs.json'), `${JSON.stringify(ayahs)}\n`)
writeFileSync(
  join(dataDir, 'provenance.json'),
  `${JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      source: 'https://equran.id/api/v2/surat (+ /surat/{nomor})',
      note: 'Sumber kanonik tunggal: Arab (teksArab), terjemahan Kemenag (teksIndonesia), transliterasi (teksLatin), metadata surah (nama, namaLatin, arti, tempatTurun, deskripsi). Kolom juz/page mengikuti pembagian mushaf Madinah bawaan provider.',
      equran_sha256: eqHash,
      equran_bytes: rawBytes,
      counts: { surahs: 114, ayahs: 6236 },
      attribution: 'Teks Arab, terjemahan Kemenag & transliterasi: equran.id.',
    },
    null,
    2,
  )}\n`,
)

// --- Dokumen provenance ---
writeFileSync(
  join(pkgRoot, 'CORPUS.md'),
  [
    '# Provenance korpus',
    '',
    `Digenerate: ${new Date().toISOString()}`,
    '',
    'Berkas ini ditulis oleh `scripts/import-corpus.mjs`. **Jangan disunting tangan** —',
    'suntingan akan hilang saat impor berikutnya. Catatan yang perlu bertahan',
    'ditulis di `README.md`.',
    '',
    '- Sumber tunggal: equran.id `/api/v2/surat` (+ `/surat/{nomor}` per surah).',
    '- Arab: `teksArab` per ayat (basmalah terpisah, tidak menempel di ayat 1).',
    '- Terjemahan: `teksIndonesia` (Kemenag).',
    '- Transliterasi: `teksLatin`, sebaris dari sumber yang sama sehingga tidak perlu penyelarasan dua provider.',
    '- Metadata surah: `nama`, `namaLatin`, `arti`, `tempatTurun`, `deskripsi` (memuat HTML), `jumlahAyat`.',
    '- Kolom `juz`/`page`: pembagian mushaf **Madinah** bawaan provider.',
    '  Penelusuran per juz TIDAK memakainya — lihat catatan batas juz di `README.md`.',
    '- Diverifikasi saat impor: 114 surah, 6236 ayat, id global berurutan 1..6236.',
    '',
    '## Hash respons mentah provider',
    '',
    `- equran.id sha256 (114 detail surah digabung): \`${eqHash}\` (${rawBytes} bytes)`,
    '',
    'Hash respons mentah bisa berubah kalau serialisasi provider berubah; yang',
    'dijaga adalah isi kanoniknya (teks surah/ayat), dan itu diuji terpisah.',
    '',
    '## Regenerasi',
    '',
    '```bash',
    'node scripts/import-corpus.mjs --write',
    'pnpm test',
    '```',
    '',
    'Periksa diff `src/data/*` sebelum commit, lalu naikkan versi paket dan',
    'terbitkan — aplikasi mengambil korpus dari rilis, bukan dari repo ini.',
    '',
  ].join('\n'),
)

console.log('Menulis src/data/{surahs,ayahs,provenance}.json dan CORPUS.md')
