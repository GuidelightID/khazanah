/** CSS color values for tajweed class tokens */
export type TajweedScheme = Record<string, string>;

/** Default illustrative palette (not a fatwa; for demo / QPC-like classes). */
export const DEFAULT_TAJWEED_SCHEME: TajweedScheme = {
  ghunnah: 'rgba(255, 165, 0, 0.35)',
  idgham: 'rgba(0, 128, 0, 0.3)',
  ikhfa: 'rgba(0, 0, 255, 0.25)',
  iqlab: 'rgba(128, 0, 128, 0.3)',
  qalqalah: 'rgba(255, 0, 0, 0.25)',
  madd: 'rgba(0, 128, 128, 0.3)',
  ham_wasl: 'rgba(128, 128, 128, 0.25)',
  laam_shamsiyah: 'rgba(165, 42, 42, 0.25)',
  silent: 'rgba(160, 160, 160, 0.2)',
};

export const SCHEMES: Record<string, TajweedScheme> = {
  default: DEFAULT_TAJWEED_SCHEME,
  qpc: {
    ...DEFAULT_TAJWEED_SCHEME,
    // placeholder aliases used by some datasets
    hamzat_wasl: DEFAULT_TAJWEED_SCHEME.ham_wasl!,
  },
};
