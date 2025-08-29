// CPF utilities and mappings

const NINE_DIGIT_SPACE = 1000000000n; // 1e9 values for the base CPF part
const FEISTEL_BITS = 30n; // domain >= 1e9
const HALF_BITS = 15n;
const FEISTEL_MASK = (1n << FEISTEL_BITS) - 1n;
const HALF_MASK = (1n << HALF_BITS) - 1n;
const ROUNDS = 4;
const FEISTEL_CONSTANTS = [0x47f5n, 0x90a7n, 0xd879n, 0x6f4an];

function feistelRoundFn(right, round) {
  let x = right ^ FEISTEL_CONSTANTS[round % FEISTEL_CONSTANTS.length];
  // rotate and mix in 15-bit space
  x = ((x << 5n) | (x >> (HALF_BITS - 5n))) & HALF_MASK;
  x = (x * 0x9e37n) & HALF_MASK;
  x = ((x << 7n) | (x >> (HALF_BITS - 7n))) & HALF_MASK;
  return x & HALF_MASK;
}

function feistelForward(v) {
  v &= FEISTEL_MASK;
  let L = (v >> HALF_BITS) & HALF_MASK;
  let R = v & HALF_MASK;
  for (let i = 0; i < ROUNDS; i++) {
    const f = feistelRoundFn(R, i);
    const newL = R;
    const newR = (L ^ f) & HALF_MASK;
    L = newL;
    R = newR;
  }
  return ((L << HALF_BITS) | R) & FEISTEL_MASK;
}

function feistelBackward(v) {
  v &= FEISTEL_MASK;
  let L = (v >> HALF_BITS) & HALF_MASK;
  let R = v & HALF_MASK;
  for (let i = ROUNDS - 1; i >= 0; i--) {
    const f = feistelRoundFn(L, i);
    const newR = L;
    const newL = (R ^ f) & HALF_MASK;
    L = newL;
    R = newR;
  }
  return ((L << HALF_BITS) | R) & FEISTEL_MASK;
}

function permuteIndex(i) {
  // cycle-walk to keep within 0..NINE_DIGIT_SPACE-1
  let v = BigInt(i) & FEISTEL_MASK;
  let out = feistelForward(v);
  while (out >= NINE_DIGIT_SPACE) {
    out = feistelForward(out);
  }
  return out;
}

function invertPermuteIndex(x) {
  let v = BigInt(x) & FEISTEL_MASK;
  let out = feistelBackward(v);
  while (out >= NINE_DIGIT_SPACE) {
    out = feistelBackward(out);
  }
  return out;
}

let permutationEnabled = true;
export function setPermutationEnabled(enabled) {
  permutationEnabled = !!enabled;
}

function computeCPFCheckDigits(baseNineDigits) {
  const digits = baseNineDigits.split("").map((d) => parseInt(d, 10));
  // d1
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += digits[i] * (10 - i);
  }
  const r1 = sum1 % 11;
  const d1 = r1 < 2 ? 0 : 11 - r1;
  // d2
  let sum2 = 0;
  for (let i = 0; i < 9; i++) {
    sum2 += digits[i] * (11 - i);
  }
  sum2 += d1 * 2;
  const r2 = sum2 % 11;
  const d2 = r2 < 2 ? 0 : 11 - r2;
  return `${d1}${d2}`;
}

export function indexToUUID(index, randomizedOverride) {
  if (typeof index !== "bigint") index = BigInt(index);
  if (index < 0n) return null;
  const useRandom =
    typeof randomizedOverride === "boolean" ? randomizedOverride : permutationEnabled;
  const permuted = useRandom ? permuteIndex(index) : index;
  const base = permuted.toString().padStart(9, "0");
  if (base.length > 9) return null;
  const check = computeCPFCheckDigits(base);
  return `${base}${check}`;
}

export function uuidToIndex(uuid, randomizedOverride) {
  if (!uuid) return null;
  const digits = uuid.toString().replace(/\D/g, "");
  if (digits.length !== 11) return null;
  // Reject CPFs with all digits equal
  if (/^(\d)\1{10}$/.test(digits)) return null;
  const base = digits.slice(0, 9);
  const expected = computeCPFCheckDigits(base);
  const actual = digits.slice(9);
  if (expected !== actual) return null;
  // invert permutation to get virtual index
  const baseBig = BigInt(base);
  const useRandom =
    typeof randomizedOverride === "boolean" ? randomizedOverride : permutationEnabled;
  return useRandom ? invertPermuteIndex(baseBig) : baseBig;
}

export function intToUUID(n) {
  return indexToUUID(n);
}
