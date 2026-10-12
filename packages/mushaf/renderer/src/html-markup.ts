import type { MushafPageIR, WordKey } from '@guidelight/mushaf-core';
import type { RenderFrame } from './types.js';
import { resolveWordStyles } from './highlights.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pct(n: number, total: number): string {
  return `${(n / total) * 100}%`;
}

function resolveTheme(theme: RenderFrame['theme']): 'light' | 'dark' {
  if (theme === 'auto') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return theme;
}

/** Fraction of line box height used as font-size (room for harakat). */
const FONT_FILL = 0.58;

function medianLineHeight(page: MushafPageIR): number {
  const hs = page.lines.map((l) => l.bbox.h).filter((h) => h > 0);
  if (!hs.length) return 92;
  const sorted = [...hs].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}

/**
 * Pure function of frame → HTML (ADR-015 hydration contract).
 * Structure keys: data-word, data-line, data-page.
 */
export function renderPageToStaticMarkup(frame: RenderFrame): string {
  const { page, viewMatrix, fontFamily, selection } = frame;
  const theme = resolveTheme(frame.theme);
  const { width: lw, height: lh } = page.metrics;
  const styles = resolveWordStyles(page, frame.highlights);

  if (selection && selection.page === page.page) {
    const keys = page.lines.flatMap((l) => l.wordKeys);
    const from = keys.indexOf(selection.from);
    const to = keys.indexOf(selection.to);
    if (from >= 0 && to >= 0) {
      const [a, b] = from <= to ? [from, to] : [to, from];
      for (const k of keys.slice(a, b + 1)) {
        const prev = styles.get(k as WordKey);
        styles.set(k as WordKey, {
          wordKey: k as WordKey,
          className: [prev?.className, 'mushaf-selection'].filter(Boolean).join(' '),
          background: prev?.background ?? 'rgba(100, 160, 255, 0.35)',
          underline: prev?.underline,
        });
      }
    }
  }

  const paper = theme === 'dark' ? '#1a1a1a' : '#faf6ef';
  const ink = theme === 'dark' ? '#f0e6d2' : '#1a1208';

  const linesHtml = page.lines
    .map((line) => {
      const lineClasses = [
        'mushaf-line',
        line.isCentered ? 'mushaf-line--centered' : '',
        line.isBismillah ? 'mushaf-line--bismillah' : '',
        line.isSurahHeader ? 'mushaf-line--surah-header' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const wordsHtml = line.wordKeys
        .map((key) => {
          const word = page.words[key];
          if (!word) return '';
          const st = styles.get(key);
          const left = pct(word.bbox.x, lw);
          const top = pct(word.bbox.y, lh);
          const w = pct(word.bbox.w, lw);
          const h = pct(word.bbox.h, lh);
          const bg = st?.background
            ? `background:${st.background};`
            : '';
          const underline = st?.underline ? 'text-decoration:underline;' : '';
          const charType = word.charType ?? 'word';
          const cls = [
            'mushaf-word',
            `mushaf-word--${charType}`,
            st?.className,
          ]
            .filter(Boolean)
            .join(' ');
          const label = escapeHtml(`${word.verseKey} ${word.text}`);
          return (
            `<span role="button" tabindex="-1" class="${cls}" data-word="${escapeHtml(key)}" ` +
            `data-char-type="${escapeHtml(charType)}" ` +
            `aria-label="${label}" ` +
            `style="position:absolute;left:${left};top:${top};width:${w};height:${h};` +
            `display:flex;align-items:baseline;justify-content:center;` +
            `box-sizing:border-box;padding-top:0.12em;overflow:visible;` +
            `white-space:nowrap;line-height:1;${bg}${underline}">` +
            `${escapeHtml(word.text)}</span>`
          );
        })
        .join('');

      return (
        `<div class="${lineClasses}" data-line="${line.index}" ` +
        `style="position:absolute;left:${pct(line.bbox.x, lw)};top:${pct(line.bbox.y, lh)};` +
        `width:${pct(line.bbox.w, lw)};height:${pct(line.bbox.h, lh)};overflow:visible;">` +
        `${wordsHtml}</div>`
      );
    })
    .join('');

  const srVerses = page.verses
    .map((v) => {
      const text = v.wordKeys
        .map((k) => page.words[k]?.text ?? '')
        .join(' ');
      return (
        `<li id="verse-${escapeHtml(v.verseKey.replace(':', '-'))}">` +
        `${escapeHtml(v.verseKey)}. ${escapeHtml(text)}</li>`
      );
    })
    .join('');

  const cssW = viewMatrix.cssWidth;
  const cssH = viewMatrix.cssHeight;
  const scale = viewMatrix.scale;
  const ox = viewMatrix.offsetX;
  const oy = viewMatrix.offsetY;
  const fontSizePx = Math.max(12, medianLineHeight(page) * scale * FONT_FILL);

  return (
    `<div class="mushaf-page mushaf-theme-${theme}" role="document" dir="rtl" lang="ar" ` +
    `data-page="${page.page}" data-mushaf-backend="html" ` +
    `aria-label="Quran page ${page.page}" ` +
    `style="position:relative;width:${cssW}px;height:${cssH}px;background:${paper};color:${ink};` +
    `font-family:${escapeHtml(fontFamily)};user-select:none;overflow:hidden;">` +
    `<div class="mushaf-surface" data-mushaf-surface ` +
    `style="position:absolute;left:${ox}px;top:${oy}px;width:${lw * scale}px;height:${lh * scale}px;` +
    `font-size:${fontSizePx}px;">` +
    `<style>` +
    `.mushaf-word--end_marker{font-size:0.85em;opacity:0.92;}` +
    `.mushaf-line--bismillah .mushaf-word,.mushaf-line--surah-header .mushaf-word{font-weight:600;}` +
    `.mushaf-line--surah-header .mushaf-word{letter-spacing:0.02em;}` +
    `</style>` +
    `<div class="mushaf-logical" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;">` +
    `${linesHtml}` +
    `</div>` +
    `<div data-mushaf-overlay-root style="position:absolute;inset:0;pointer-events:none;"></div>` +
    `</div>` +
    `<ol class="mushaf-sr-verses" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;` +
    `overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">` +
    `${srVerses}</ol>` +
    `</div>`
  );
}

export function listFocusableWordKeys(page: MushafPageIR): WordKey[] {
  return page.lines.flatMap((l) => l.wordKeys);
}
