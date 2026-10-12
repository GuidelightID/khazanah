/** All categories in English, without loading the other language. */
import morningDhikr from "./data/morning-dhikr.en.json" with { type: "json" };
import eveningDhikr from "./data/evening-dhikr.en.json" with { type: "json" };
import dailyDua from "./data/daily-dua.en.json" with { type: "json" };
import selectedDua from "./data/selected-dua.en.json" with { type: "json" };
import dhikrAfterSalah from "./data/dhikr-after-salah.en.json" with { type: "json" };
import type { DuaCategory, DuaCategorySlug, DuaItem } from "./types.js";

export type { DuaCategory, DuaCategorySlug, DuaItem } from "./types.js";

export const DUA_CATEGORIES: DuaCategory[] = [
  { slug: "morning-dhikr", name: "Morning Dhikr", items: morningDhikr as DuaItem[] },
  { slug: "evening-dhikr", name: "Evening Dhikr", items: eveningDhikr as DuaItem[] },
  { slug: "daily-dua", name: "Daily Dua", items: dailyDua as DuaItem[] },
  { slug: "selected-dua", name: "Selected Dua", items: selectedDua as DuaItem[] },
  { slug: "dhikr-after-salah", name: "Dhikr After Salah", items: dhikrAfterSalah as DuaItem[] },
];

export function getDuaCategory(slug: DuaCategorySlug | string): DuaCategory | undefined {
  return DUA_CATEGORIES.find((category) => category.slug === slug);
}
