/** Minimal shapes from Quran.com API v4 used by this adapter */

export interface QfChapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
  revelation_place: string;
  pages?: [number, number];
  translated_name?: { name: string; language_name?: string };
}

export interface QfChaptersResponse {
  chapters: QfChapter[];
}

export interface QfWord {
  id?: number;
  position: number;
  text_uthmani?: string;
  text?: string;
  line_number?: number;
  char_type_name?: string;
  code_v1?: string;
  translation?: { text?: string };
}

export interface QfVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  page_number?: number;
  words?: QfWord[];
}

export interface QfVersesByPageResponse {
  verses: QfVerse[];
  pagination?: unknown;
}

export interface QfVerseByKeyResponse {
  verse: QfVerse;
}
