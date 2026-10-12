/** All categories in Indonesian, without loading the other language. */
import morningDhikr from "./data/morning-dhikr.id.json" with { type: "json" };
import eveningDhikr from "./data/evening-dhikr.id.json" with { type: "json" };
import dailyDua from "./data/daily-dua.id.json" with { type: "json" };
import selectedDua from "./data/selected-dua.id.json" with { type: "json" };
import dhikrAfterSalah from "./data/dhikr-after-salah.id.json" with { type: "json" };
import type { DuaCategory, DuaCategorySlug, DuaItem } from "./types.js";

export type { DuaCategory, DuaCategorySlug, DuaItem } from "./types.js";

export const DUA_CATEGORIES: DuaCategory[] = [
  { slug: "morning-dhikr", name: "Dzikir Pagi", items: morningDhikr as DuaItem[] },
  { slug: "evening-dhikr", name: "Dzikir Petang", items: eveningDhikr as DuaItem[] },
  { slug: "daily-dua", name: "Doa Harian", items: dailyDua as DuaItem[] },
  { slug: "selected-dua", name: "Doa Pilihan", items: selectedDua as DuaItem[] },
  { slug: "dhikr-after-salah", name: "Dzikir Setelah Shalat", items: dhikrAfterSalah as DuaItem[] },
];

export function getDuaCategory(slug: DuaCategorySlug | string): DuaCategory | undefined {
  return DUA_CATEGORIES.find((category) => category.slug === slug);
}
