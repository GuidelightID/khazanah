/**
 * Doa and dzikir collections (Indonesian and English). This entry loads both
 * languages; in a browser bundle prefer `@guidelightid/doa/id` or `/en`.
 */
import { DUA_CATEGORIES as EN } from "./en.js";
import { DUA_CATEGORIES as ID } from "./id.js";
import type { DuaCategory, DuaCategorySlug, DuaLanguage } from "./types.js";

export type { DuaCategory, DuaCategorySlug, DuaItem, DuaLanguage } from "./types.js";

export const DUA_CATEGORY_SLUGS: readonly DuaCategorySlug[] = [
  "morning-dhikr",
  "evening-dhikr",
  "daily-dua",
  "selected-dua",
  "dhikr-after-salah",
];

export const DUA_LANGUAGES: readonly DuaLanguage[] = ["id", "en"];

const BY_LANGUAGE: Record<DuaLanguage, DuaCategory[]> = { id: ID, en: EN };

/** All categories in one language (default Indonesian). */
export function getDuaCategories(language: DuaLanguage = "id"): DuaCategory[] {
  return BY_LANGUAGE[language];
}

/** One category by slug, in one language (default Indonesian). */
export function getDuaCategory(slug: DuaCategorySlug | string, language: DuaLanguage = "id"): DuaCategory | undefined {
  return BY_LANGUAGE[language].find((category) => category.slug === slug);
}

export function isDuaCategorySlug(value: string): value is DuaCategorySlug {
  return (DUA_CATEGORY_SLUGS as readonly string[]).includes(value);
}
