/** One verse of a surah item (e.g. "Ayat 1"). */
export interface AlMatsuratSubItem {
  title: string;
  arabic: string;
  latin?: string;
  translation?: string;
}

export interface AlMatsuratItem {
  title: string;
  /** Recommended number of repetitions (1, 3, 10 or 100). */
  repeat: number;
  /** "single" = one recitation; "parent" = a group of verses in `data`. */
  type: "single" | "parent";
  arabic: string;
  latin?: string;
  translation?: string;
  /** The verses of a "parent" item (e.g. a surah), in order. */
  data?: AlMatsuratSubItem[];
}

export interface AlMatsuratCollection {
  title: string;
  description: string;
  data: AlMatsuratItem[];
}

/** Sugro = the short compilation, kubro = the long one. */
export type AlMatsuratVariant = "sugro" | "kubro";

/** Pagi = morning (after Subuh), petang = evening (after Ashar). */
export type AlMatsuratTime = "pagi" | "petang";
