# NOTICE — data sources and terms

Everything in `src/data/` was imported once from the **EQuran.id API v2**
(`https://equran.id/api/v2/surat`) and frozen as JSON. See
`src/data/provenance.json` for the exact snapshot (date, SHA-256, counts).

EQuran.id names its Quran source as **Kementerian Agama Republik Indonesia**
(quran.kemenag.go.id).

| Content | Field(s) | Terms | Status |
|---|---|---|---|
| Arabic text (Mushaf Standar Indonesia) | `teksArab` | EQuran.id: "Teks Al-Quran adalah milik umat Islam dan bebas digunakan." | ✅ free to use, with attribution |
| Indonesian translation | `teksIndonesia` | Kemenag (LPMQ) translation. EQuran.id states that translations, tafsir and audio are protected by copyright; content may be shared **with credit to EQuran.id**, and data from the API **may not be sold**. | ⚠️ no written license for bulk redistribution |
| Transliteration | `teksLatin` | as above | ⚠️ as above |
| Surah metadata (names, meaning, place of revelation, description) | `nama`, `namaLatin`, `arti`, `tempatTurun`, `deskripsi` | as above | ⚠️ as above |
| Juz boundaries (Standar Mushaf Indonesia) | `juz` table in `src/juz.ts` | first-party work, MIT | ✅ |

## Attribution

Any use of this data must credit:

> Teks Al-Qur'an, terjemahan, dan transliterasi: Kementerian Agama Republik
> Indonesia, melalui EQuran.id (https://equran.id).

The data must not be sold or traded.

## Publication status

Because the translation, transliteration and metadata have no written license
for bulk redistribution, this package is marked `"private": true` and is **not
published to npm**. It will be published once EQuran.id (and, if needed,
Kemenag/LPMQ) confirm in writing that a free, attributed, non-commercial npm
package is allowed — or the restricted fields are split out.

This is not legal advice.
