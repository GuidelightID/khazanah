import { ALMATSURAT_KUBRO } from "./kubro.js";
import { ALMATSURAT_SUGRO } from "./sugro.js";
import type { AlMatsuratCollection, AlMatsuratTime, AlMatsuratVariant } from "./types.js";

export type {
  AlMatsuratCollection,
  AlMatsuratItem,
  AlMatsuratSubItem,
  AlMatsuratTime,
  AlMatsuratVariant,
} from "./types.js";

export const ALMATSURAT_VARIANTS: readonly AlMatsuratVariant[] = ["sugro", "kubro"];
export const ALMATSURAT_TIMES: readonly AlMatsuratTime[] = ["pagi", "petang"];

export { ALMATSURAT_KUBRO, getAlMatsuratKubro } from "./kubro.js";
export { ALMATSURAT_SUGRO, getAlMatsuratSugro } from "./sugro.js";

const COLLECTIONS: Record<AlMatsuratVariant, Record<AlMatsuratTime, AlMatsuratCollection>> = {
  sugro: ALMATSURAT_SUGRO,
  kubro: ALMATSURAT_KUBRO,
};

/**
 * The full collection for one variant and time of day. This entry loads all
 * four collections; in a browser bundle prefer `@guidelightid/almatsurat/sugro`
 * or `/kubro` to ship only the one you use.
 */
export function getAlMatsurat(variant: AlMatsuratVariant, time: AlMatsuratTime): AlMatsuratCollection {
  return COLLECTIONS[variant][time];
}

export function isAlMatsuratVariant(value: string): value is AlMatsuratVariant {
  return value === "sugro" || value === "kubro";
}

export function isAlMatsuratTime(value: string): value is AlMatsuratTime {
  return value === "pagi" || value === "petang";
}
