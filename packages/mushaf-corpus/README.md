# @guidelightid/mushaf-corpus

Korpus Al-Qur'an Indonesia beserta peta juz dan utilitas rentang ayat.
**Tanpa tampilan** — paket ini tidak membawa komponen, gaya, maupun font.

Dipakai oleh `guidelight-id-next` untuk modul Al-Qur'an & Tadabbur.

## Sumber data

Teks Arab, terjemahan Kemenag, transliterasi, dan metadata surah berasal dari
**equran.id API v2** (`teksArab`, `teksIndonesia`, `teksLatin`, `namaLatin`,
`arti`, `tempatTurun`, `deskripsi`). Korpus dibekukan sebagai JSON, bukan
diambil saat runtime.

Terverifikasi di CI setiap kali paket ini dibangun: 114 surah, 6236 ayat, tiap
surah bernomor 1..n tanpa bolong.

## Batas juz

Penelusuran per juz memakai **Standar Mushaf Indonesia** (Kemenag), bukan
pembagian mushaf Madinah. Keduanya berbeda di 13 juz — misalnya juz 23 dibuka
Yasin 22 di mushaf Indonesia dan Yasin 28 di mushaf Madinah.

Kolom `juz` pada tiap objek ayat masih membawa nilai bawaan equran.id yang
mengikuti pembagian Madinah. **Jangan pakai kolom itu untuk navigasi juz**;
pakai `juzOfAyah()`. Tabel batasnya diuji: bersambung, tanpa celah maupun
tumpang tindih, dan mencakup seluruh 6236 ayat tepat satu kali.

## Dua entry, disengaja

```ts
// Aman untuk klien (~87 KB): katalog surah, peta juz, tipe, utilitas.
import { getSurah, getJuzList, parseAyahRange } from '@guidelightid/mushaf-corpus';

// Hanya untuk server (~3,9 MB): teks ayat lengkap.
import { getPassageAyahs, getJuzAyahs } from '@guidelightid/mushaf-corpus/ayahs';
```

Teks ayat sengaja tidak diekspor dari entry utama. Menariknya ke sana akan
mengirim seluruh mushaf ke browser.

## API

### Entry utama

| Fungsi | Kegunaan |
|---|---|
| `getSurahs()` | 114 surah |
| `getSurah(nomor \| slug)` | satu surah; menerima alias seperti `ash-sharh` |
| `totalAyahs()` | 6236 |
| `passageLabel(passage)` | `"QS. Al-'Alaq: 1–10"` |
| `parseAyahRange(teks, totalAyat)` | mengurai `"7"`, `"1-10"`, `"1–10"`; `null` bila di luar jangkauan |
| `normalizeQuranSearch(teks)` | menyeragamkan kapital, diakritik, apostrof keriting |
| `plainSurahDescription(html)` | membuang HTML sederhana dari `deskripsi` equran.id |
| `getJuzList()` / `getJuz(n)` | 30 juz beserta nama, rentang surah, jumlah ayat |
| `juzOfAyah(surah, ayat)` | nomor juz menurut Standar Mushaf Indonesia |
| `juzOfSurah(surah)` | daftar juz yang disentuh sebuah surah |
| `juzCoverageTotal()` | total ayat tercakup 30 juz; harus 6236 |

### Entry `/ayahs`

| Fungsi | Kegunaan |
|---|---|
| `getSurahAyahs(surahId)` | seluruh ayat satu surah, terurut |
| `getPassageAyahs(passage)` | ayat pada rentang; `[]` bila rentang tidak sah |
| `getJuzAyahs(n)` | ayat satu juz, lintas batas surah |
| `getCorpusStats()` | `{ surahs, ayahs }` |

## Yang sengaja TIDAK ada di sini

- **Font.** LPMQ Isep Misbah di-self-host dari `public/` aplikasi. Next.js
  tidak menyajikan aset dari `node_modules`, jadi menaruhnya di paket justru
  menyulitkan konsumennya.
- **Komponen dan gaya.** Tampilan pembaca sangat khas Guidelight — copy
  Indonesia, refleksi, murottal, mode malam. Menaruhnya di sini berarti tiap
  perubahan UI menuntut rilis versi baru.
- **Rute.** Fungsi seperti `passageHref()` membentuk URL aplikasi, jadi tetap
  di aplikasi.

## Kenapa scope-nya `@guidelightid`, bukan `@mushaf`

Paket lain di repo ini bernama `@mushaf/*`. Paket ini tidak, dan itu bukan
ketidakkonsistenan yang bisa dirapikan: **GitHub Packages mewajibkan scope npm
sama dengan pemilik repo**, jadi apa pun yang terbit dari
`github.com/GuidelightID/...` harus ber-scope `@guidelightid`.

Konsekuensinya berlaku dua arah — sepuluh paket `@mushaf/*` yang ada di repo
ini **tidak bisa** terbit ke GitHub Packages dengan nama sekarang; mereka
dirancang untuk npm publik (lihat `docs/npm-scope.md`). Kalau suatu saat mereka
ikut pindah ke GitHub Packages, polanya mengikuti paket ini:
`@guidelightid/mushaf-<nama>`.

## Pemasangan

Paket ini terbit di **GitHub Packages**, bukan npm publik. Konsumennya perlu
`.npmrc`:

```
@guidelightid:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

## Rilis

```bash
# dari root monorepo
pnpm --filter @guidelightid/mushaf-corpus test
# naikkan "version" di packages/mushaf-corpus/package.json, lalu:
git tag mushaf-corpus-v0.1.0 && git push origin mushaf-corpus-v0.1.0
```

Workflow `publish-mushaf-corpus.yml` memverifikasi tag cocok dengan versi paket,
menjalankan tes, lalu menerbitkannya.

## Regenerasi korpus

Paket ini adalah **rumah tunggal** korpus — tidak ada salinan lain di repo mana
pun.

```bash
pnpm --filter @guidelightid/mushaf-corpus import        # dry run, validasi saja
pnpm --filter @guidelightid/mushaf-corpus import:write  # tulis src/data/* + CORPUS.md
pnpm --filter @guidelightid/mushaf-corpus test
```

Periksa diff `src/data/*`, naikkan `version`, lalu terbitkan. Aplikasi
mengambil korpus dari rilis, bukan dari repo ini.

Setelah versi baru terpasang di `guidelight-id-next`, regenerate migrasi
seed-nya di sana: `npm run quran:seed`.
