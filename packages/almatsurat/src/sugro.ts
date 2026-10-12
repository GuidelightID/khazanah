/** Al-Ma'tsurat Sugro only, so apps bundle just this collection. */
import pagi from "./data/sugro-pagi.json" with { type: "json" };
import petang from "./data/sugro-petang.json" with { type: "json" };
import type { AlMatsuratCollection, AlMatsuratTime } from "./types.js";

export type { AlMatsuratCollection, AlMatsuratItem, AlMatsuratSubItem, AlMatsuratTime } from "./types.js";

export const ALMATSURAT_SUGRO: Record<AlMatsuratTime, AlMatsuratCollection> = {
  pagi: pagi as AlMatsuratCollection,
  petang: petang as AlMatsuratCollection,
};

export function getAlMatsuratSugro(time: AlMatsuratTime): AlMatsuratCollection {
  return ALMATSURAT_SUGRO[time];
}
