import sugroPagi from "./data/sugro-pagi.json" with { type: "json" };
import sugroPetang from "./data/sugro-petang.json" with { type: "json" };
import kubroPagi from "./data/kubro-pagi.json" with { type: "json" };
import kubroPetang from "./data/kubro-petang.json" with { type: "json" };
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

const COLLECTIONS: Record<AlMatsuratVariant, Record<AlMatsuratTime, AlMatsuratCollection>> = {
  sugro: {
    pagi: sugroPagi as AlMatsuratCollection,
    petang: sugroPetang as AlMatsuratCollection,
  },
  kubro: {
    pagi: kubroPagi as AlMatsuratCollection,
    petang: kubroPetang as AlMatsuratCollection,
  },
};

/** The full collection for one variant and time of day. */
export function getAlMatsurat(variant: AlMatsuratVariant, time: AlMatsuratTime): AlMatsuratCollection {
  return COLLECTIONS[variant][time];
}

export function isAlMatsuratVariant(value: string): value is AlMatsuratVariant {
  return value === "sugro" || value === "kubro";
}

export function isAlMatsuratTime(value: string): value is AlMatsuratTime {
  return value === "pagi" || value === "petang";
}
