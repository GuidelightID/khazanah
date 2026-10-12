import { describe, expect, it } from "vitest";
import { DUA_CATEGORIES as EN } from "./en.js";
import { DUA_CATEGORIES as ID } from "./id.js";
import { DUA_CATEGORY_SLUGS, getDuaCategories, getDuaCategory, isDuaCategorySlug } from "./index.js";

const COUNTS = {
  "morning-dhikr": 19,
  "evening-dhikr": 19,
  "daily-dua": 38,
  "selected-dua": 8,
  "dhikr-after-salah": 13,
} as const;

describe("doa collections", () => {
  for (const [language, categories] of [["id", ID], ["en", EN]] as const) {
    it(`${language}: has every category with the expected number of items`, () => {
      expect(categories.map((c) => c.slug)).toEqual([...DUA_CATEGORY_SLUGS]);
      for (const category of categories) {
        expect(category.items).toHaveLength(COUNTS[category.slug]);
        expect(category.name).not.toBe("");
      }
    });

    it(`${language}: has non-empty Arabic text and translation, and no nulls`, () => {
      for (const category of categories) {
        for (const item of category.items) {
          expect(item.arabic.trim()).not.toBe("");
          expect(item.translation.trim()).not.toBe("");
          expect(Object.keys(item).sort()).toEqual(
            ["arabic", "fawaid", "latin", "notes", "source", "title", "translation"],
          );
          for (const value of Object.values(item)) expect(typeof value).toBe("string");
        }
      }
    });
  }

  it("pairs the same Arabic text in both languages", () => {
    // Compared after NFC: upstream orders shadda/fatha differently in one item
    // (evening-dhikr #13); the two spellings are canonically equivalent and
    // render identically, so the data is left as published.
    const arabic = (slug: string, language: "id" | "en") =>
      getDuaCategory(slug, language)!.items.map((i) => i.arabic.normalize("NFC"));
    for (const slug of DUA_CATEGORY_SLUGS) {
      const id = arabic(slug, "id");
      const en = arabic(slug, "en");
      expect(id).toEqual(en);
    }
  });

  it("carries the documented correction", () => {
    expect(getDuaCategory("daily-dua")!.items[0]!.translation).not.toContain("dan dan");
  });

  it("looks categories up by language and slug", () => {
    expect(getDuaCategories()).toBe(ID);
    expect(getDuaCategories("en")).toBe(EN);
    expect(getDuaCategory("daily-dua", "en")?.name).toBe("Daily Dua");
    expect(getDuaCategory("tidak-ada")).toBeUndefined();
    expect(isDuaCategorySlug("selected-dua")).toBe(true);
    expect(isDuaCategorySlug("doa-harian")).toBe(false);
  });
});
