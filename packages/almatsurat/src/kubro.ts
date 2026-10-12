/** Al-Ma'tsurat Kubro only, so apps bundle just this collection. */
import pagi from "./data/kubro-pagi.json" with { type: "json" };
import petang from "./data/kubro-petang.json" with { type: "json" };
import type { AlMatsuratCollection, AlMatsuratTime } from "./types.js";

export type { AlMatsuratCollection, AlMatsuratItem, AlMatsuratSubItem, AlMatsuratTime } from "./types.js";

export const ALMATSURAT_KUBRO: Record<AlMatsuratTime, AlMatsuratCollection> = {
  pagi: pagi as AlMatsuratCollection,
  petang: petang as AlMatsuratCollection,
};

export function getAlMatsuratKubro(time: AlMatsuratTime): AlMatsuratCollection {
  return ALMATSURAT_KUBRO[time];
}
