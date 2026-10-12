# NOTICE — data source

The collections in `src/data/` come from
**[fitrahive/dua-dhikr](https://github.com/fitrahive/dua-dhikr)**, commit
`f42f895f914319a844c3e3c2279483cae060ea19`, released under the **MIT License**
(Copyright (c) 2023 Fitrahive). `src/data/provenance.json` records the upstream
path and SHA-256 of every file.

Three changes were made on import, all recorded in `provenance.json`:

1. `null` fields (mostly `notes`, `fawaid`) were replaced with empty strings, so
   every field is a string.
2. In `daily-dua.id.json`, item 0 ("Doa Sebelum Tidur"), the duplicated word
   "dan dan" in the translation was corrected to "dan".
3. In the English files, the field `benefits` was renamed to `fawaid`. Upstream
   uses both names (even within one file), so every item now has the same
   seven fields: `title`, `arabic`, `latin`, `translation`, `source`, `fawaid`,
   `notes`.

Corrections are welcome as pull requests, with the source cited.
