import { describe, expect, it } from 'vitest';
import { CAPACITIES, decodeBase62, encodeBase62, getBase62Capacity, XOR_SECRET_KEY } from './base62';

describe('encodeBase62 / decodeBase62', () => {
  it('round-trips sequential counter IDs', () => {
    const samples = [0, 1, 61, 62, 1000, 1000000000];
    for (const id of samples) {
      const { code } = encodeBase62(id);
      const decoded = decodeBase62(code);
      expect(decoded.valid).toBe(true);
      expect(decoded.originalId).toBe(BigInt(id));
    }
  });

  it('applies a reversible XOR mask', () => {
    const id = 1000000003;
    const encoded = encodeBase62(id, true);
    const decoded = decodeBase62(encoded.code, true);
    expect(decoded.valid).toBe(true);
    expect(decoded.originalId).toBe(BigInt(id));
    expect(encoded.transformedId).toBe(BigInt(id) ^ XOR_SECRET_KEY);
  });

  it('rejects invalid alphabet characters', () => {
    expect(decodeBase62('abc!').valid).toBe(false);
  });
});

describe('Base62 capacity', () => {
  it('matches 62^n for listed lengths', () => {
    for (const row of CAPACITIES) {
      expect(getBase62Capacity(row.length)).toBe(row.combinations);
    }
  });
});
