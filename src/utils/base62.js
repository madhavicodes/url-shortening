// Standard Base62 Alphabet: 0-9, a-z, A-Z (62 characters)
export const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = 62n;

// Secret mask used for optional reversible XOR transformation to prevent URL enumeration
export const XOR_SECRET_KEY = 0x5b3c9a7fn; // 32-bit/64-bit friendly reversible mask

/**
 * Encodes a numeric counter ID to a Base62 string.
 */
export function encodeBase62(num, applyXor = false) {
  let value = BigInt(num);
  if (value < 0n) value = 0n;

  if (applyXor) {
    // Reversible XOR transformation to randomize sequential predictability
    value = value ^ XOR_SECRET_KEY;
  }

  const transformedId = value;

  if (value === 0n) {
    return {
      code: BASE62_ALPHABET[0],
      transformedId,
      steps: [
        {
          step: 1,
          quotient: '0',
          remainder: 0,
          character: BASE62_ALPHABET[0],
          expression: '0 % 62 = 0',
        },
      ],
    };
  }

  let temp = value;
  const chars = [];
  const steps = [];
  let stepIndex = 1;

  while (temp > 0n) {
    const remainder = Number(temp % BASE);
    const quotient = temp / BASE;
    const char = BASE62_ALPHABET[remainder];
    chars.unshift(char);

    steps.push({
      step: stepIndex++,
      quotient: quotient.toString(),
      remainder,
      character: char,
      expression: `${temp.toString()} ÷ 62 = ${quotient.toString()} (remainder ${remainder} -> '${char}')`,
    });

    temp = quotient;
  }

  return {
    code: chars.join(''),
    transformedId,
    steps,
  };
}

/**
 * Decodes a Base62 string back to numeric counter ID.
 */
export function decodeBase62(code, applyXor = false) {
  let value = 0n;
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const index = BASE62_ALPHABET.indexOf(char);
    if (index === -1) {
      return { rawId: 0n, originalId: 0n, valid: false };
    }
    value = value * BASE + BigInt(index);
  }

  const rawId = value;
  const originalId = applyXor ? rawId ^ XOR_SECRET_KEY : rawId;

  return {
    rawId,
    originalId,
    valid: true,
  };
}

/**
 * Returns theoretical capacity for a given code length N (62^N)
 */
export function getBase62Capacity(length) {
  return BASE ** BigInt(length);
}

export const CAPACITIES = [
  { length: 1, combinations: 62n, readable: '62 URLs' },
  { length: 2, combinations: 3844n, readable: '3.84 Thousand' },
  { length: 3, combinations: 238328n, readable: '238 Thousand' },
  { length: 4, combinations: 14776336n, readable: '14.7 Million' },
  { length: 5, combinations: 916132832n, readable: '916 Million' },
  { length: 6, combinations: 56800235584n, readable: '56.8 Billion (Handles 1B comfortably!)' },
  { length: 7, combinations: 3521614606208n, readable: '3.52 Trillion' },
  { length: 8, combinations: 218340105584896n, readable: '218 Trillion' },
];
