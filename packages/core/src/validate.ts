import { IR_LIMITS, type MushafPageIR } from './types/ir.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export class IrValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid MushafPageIR: ${issues.join('; ')}`);
    this.name = 'IrValidationError';
    this.issues = issues;
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function rejectForbiddenKeys(obj: Record<string, unknown>, path: string, issues: string[]): void {
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_KEYS.has(key)) {
      issues.push(`${path}: forbidden key ${key}`);
    }
  }
}

/**
 * Validate and narrow unknown JSON to MushafPageIR.
 * Enforces IR_LIMITS and rejects prototype-pollution keys.
 */
export function validatePageIR(input: unknown): MushafPageIR {
  const issues: string[] = [];

  if (!isPlainObject(input)) {
    throw new IrValidationError(['root must be an object']);
  }
  rejectForbiddenKeys(input, 'root', issues);

  if (input.version !== 1) issues.push('version must be 1');
  if (typeof input.page !== 'number' || !Number.isInteger(input.page) || input.page < 1) {
    issues.push('page must be a positive integer');
  }

  if (!isPlainObject(input.metrics)) {
    issues.push('metrics is required');
  } else {
    rejectForbiddenKeys(input.metrics, 'metrics', issues);
    const m = input.metrics;
    for (const k of ['width', 'height', 'lineCount'] as const) {
      if (typeof m[k] !== 'number') issues.push(`metrics.${k} must be a number`);
    }
    if (typeof m.fontModel !== 'string') issues.push('metrics.fontModel is required');
  }

  if (!Array.isArray(input.lines)) issues.push('lines must be an array');
  else if (input.lines.length > IR_LIMITS.maxLines) {
    issues.push(`lines exceeds max ${IR_LIMITS.maxLines}`);
  }

  if (!isPlainObject(input.words)) issues.push('words must be an object');
  else {
    rejectForbiddenKeys(input.words, 'words', issues);
    const wordCount = Object.keys(input.words).length;
    if (wordCount > IR_LIMITS.maxWordsPerPage) {
      issues.push(`words exceeds max ${IR_LIMITS.maxWordsPerPage}`);
    }
    for (const [key, word] of Object.entries(input.words)) {
      if (!isPlainObject(word)) {
        issues.push(`words.${key} must be an object`);
        continue;
      }
      rejectForbiddenKeys(word, `words.${key}`, issues);
      if (typeof word.text === 'string' && word.text.length > IR_LIMITS.maxTextLengthPerWord) {
        issues.push(`words.${key}.text too long`);
      }
      if (Array.isArray(word.glyphs) && word.glyphs.length > IR_LIMITS.maxGlyphsPerWord) {
        issues.push(`words.${key}.glyphs exceeds max`);
      }
    }
  }

  if (!Array.isArray(input.verses)) issues.push('verses must be an array');

  if (issues.length) throw new IrValidationError(issues);

  return input as unknown as MushafPageIR;
}

/** Parse JSON text with size cap and prototype-safe parse. */
export function parsePageIRJson(text: string): MushafPageIR {
  if (text.length > IR_LIMITS.maxJsonBytes) {
    throw new IrValidationError([
      `JSON exceeds maxJsonBytes (${text.length} > ${IR_LIMITS.maxJsonBytes})`,
    ]);
  }
  const data = JSON.parse(text, (key, value) => {
    if (FORBIDDEN_KEYS.has(key)) return undefined;
    return value;
  }) as unknown;
  return validatePageIR(data);
}
