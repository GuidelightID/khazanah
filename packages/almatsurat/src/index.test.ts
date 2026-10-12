import { describe, expect, it } from "vitest";

import {
  ALMATSURAT_TIMES,
  ALMATSURAT_VARIANTS,
  getAlMatsurat,
  isAlMatsuratTime,
  isAlMatsuratVariant,
} from "./index.js";

const EXPECTED_ITEMS = { sugro: 32, kubro: 40 } as const;

describe("Al-Ma'tsurat collections", () => {
  for (const variant of ALMATSURAT_VARIANTS) {
    for (const time of ALMATSURAT_TIMES) {
      describe(`${variant} ${time}`, () => {
        const collection = getAlMatsurat(variant, time);

        it("has the expected number of items", () => {
          expect(collection.data).toHaveLength(EXPECTED_ITEMS[variant]);
        });

        it("gives every item a positive repeat count and Arabic text", () => {
          for (const item of collection.data) {
            expect(item.repeat).toBeGreaterThan(0);
            if (item.type === "parent") {
              expect(item.data?.length ?? 0).toBeGreaterThan(0);
              for (const verse of item.data ?? []) expect(verse.arabic.trim()).not.toBe("");
            } else {
              expect(item.arabic.trim()).not.toBe("");
            }
          }
        });

        it("has a distinct translation for every single item", () => {
          const translations = collection.data
            .filter((item) => item.type === "single" && item.translation)
            .map((item) => item.translation);
          expect(new Set(translations).size).toBe(translations.length);
        });
      });
    }
  }

  it("narrows variant and time strings", () => {
    expect(isAlMatsuratVariant("kubro")).toBe(true);
    expect(isAlMatsuratVariant("besar")).toBe(false);
    expect(isAlMatsuratTime("petang")).toBe(true);
    expect(isAlMatsuratTime("malam")).toBe(false);
  });
});
