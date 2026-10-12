export interface DuaItem {
  title: string;
  arabic: string;
  /** Latin transliteration with diacritics, e.g. "Bismika Allāhumma amūtu wa aḥyā". */
  latin: string;
  translation: string;
  /** Hadith reference. Empty for a few entries. */
  source: string;
  /** Virtues of the recitation. Empty for some entries. */
  fawaid: string;
  /** Notes on how to recite. Empty for most entries. */
  notes: string;
}

export type DuaCategorySlug =
  | "morning-dhikr"
  | "evening-dhikr"
  | "daily-dua"
  | "selected-dua"
  | "dhikr-after-salah";

export type DuaLanguage = "id" | "en";

export interface DuaCategory {
  slug: DuaCategorySlug;
  /** Category name in the collection's language, e.g. "Doa Harian" / "Daily Dua". */
  name: string;
  items: DuaItem[];
}
