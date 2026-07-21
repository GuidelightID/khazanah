/**
 * Helper for Playwright — imports built packages via absolute file URLs.
 * Run after: pnpm --filter @mushaf/core build && pnpm --filter @mushaf/renderer build
 *
 * Fonts: system stack only (no network) so CI/Linux baselines stay offline-stable.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const coreUrl = pathToFileURL(path.join(root, 'packages/core/dist/index.js')).href;
const rendererUrl = pathToFileURL(
  path.join(root, 'packages/renderer/dist/index.js'),
).href;

const { fixturePages } = await import(coreUrl);
const { composeFrame, renderPageToStaticMarkup } = await import(rendererUrl);

/** Prefer common Arabic-capable system faces; fall back to serif. */
export const E2E_FONT_STACK =
  '"Noto Naskh Arabic", "Noto Sans Arabic", "Geeza Pro", "Arial Unicode MS", "Times New Roman", serif';

export const GOLDEN_PAGES = [1, 2, 5];

export function listGoldenPages() {
  return [...GOLDEN_PAGES];
}

export function getFixturePage(page) {
  const ir = fixturePages[page];
  if (!ir) throw new Error(`No fixture IR for page ${page}`);
  return ir;
}

export function buildPageDocument(page, opts = {}) {
  const ir = getFixturePage(page);
  const width = opts.width ?? 400;
  const height =
    opts.height ?? Math.round(width * (ir.metrics.height / ir.metrics.width));
  const frame = composeFrame({
    page: ir,
    cssWidth: width,
    cssHeight: height,
    theme: opts.theme ?? 'light',
    fontFamily: opts.fontFamily ?? E2E_FONT_STACK,
  });
  const body = renderPageToStaticMarkup(frame);

  return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; background: #ebe4d6; }
    body {
      display: flex;
      justify-content: center;
      padding: 16px;
      font-family: ${E2E_FONT_STACK};
    }
    * { animation: none !important; transition: none !important; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}
