# NOTICE

This package bundles **no Quran text, translation or transliteration**.

What it ships, all first-party (MIT):

- the surah index in `src/surah-index.ts`: number, URL slug, Latin and Arabic
  surah name, ayah count and place of revelation, i.e. structural facts, not
  translated or authored content;
- the Standar Mushaf Indonesia juz boundary table and the helper functions.

## Content loaded through `@guidelightid/quran/equran`

`createEquranSource()` lets your app fetch verse text, the Indonesian
translation, transliteration and surah descriptions from **EQuran.id** through
its official SDK ([`equran`](https://www.npmjs.com/package/equran)). That
content is not part of this package and stays under
[EQuran.id's terms](https://equran.id/terms): use it via the API, credit the
source, and do not sell the data. EQuran.id names its Quran source as
Kementerian Agama Republik Indonesia (quran.kemenag.go.id).

Suggested attribution wherever the content is shown:

> Teks Al-Qur'an, terjemahan, dan transliterasi: Kementerian Agama RI, melalui
> EQuran.id.
