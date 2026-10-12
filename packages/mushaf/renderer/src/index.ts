export type { RenderFrame, RendererBackend, WordStyle } from './types.js';
export { composeFrame, paint } from './pipeline.js';
export type { ComposeFrameInput } from './pipeline.js';
export { renderPageToStaticMarkup, listFocusableWordKeys } from './html-markup.js';
export { createHtmlBackend, HtmlGlyphRenderer } from './backends/html.js';
export type { HtmlGlyphRendererOptions } from './backends/html.js';
export { expandHighlightToWords, resolveWordStyles } from './highlights.js';
