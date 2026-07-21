import { describe, expect, it } from 'vitest';
import { parsePageIRJson, validatePageIR } from './validate.js';
import { fixturePage1 } from './fixtures/page1.js';

describe('validatePageIR', () => {
  it('accepts fixture page', () => {
    const ir = validatePageIR(structuredClone(fixturePage1));
    expect(ir.page).toBe(1);
  });

  it('rejects bad version', () => {
    expect(() => validatePageIR({ ...fixturePage1, version: 2 })).toThrow();
  });

  it('parses JSON and rejects oversize', () => {
    const json = JSON.stringify(fixturePage1);
    expect(parsePageIRJson(json).page).toBe(1);
    expect(() => parsePageIRJson('x'.repeat(500_001))).toThrow();
  });
});
