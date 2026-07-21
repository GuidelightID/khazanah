export * from './ids.js';
export * from './normalize.js';
export * from './validate.js';
export * from './view-matrix.js';
export * from './hit-test.js';
export * from './page-loader.js';
export * from './plugin.js';
export * from './pointer.js';
export * from './runtime.js';
export * from './adapter.js';

export type * from './types/ir.js';
export type * from './types/catalog.js';
export type * from './types/highlights.js';
export type * from './types/adapter.js';
export type * from './types/events.js';
export type * from './types/search.js';
export { IR_LIMITS } from './types/ir.js';

export { fixturePage1 } from './fixtures/page1.js';
export { fixtureCatalog } from './fixtures/catalog.js';
export { fixtureAdapter } from './fixtures/adapter.js';
export {
  fixturePages,
  makeFixturePage,
  FIXTURE_PAGE_COUNT,
} from './fixtures/pages.js';
