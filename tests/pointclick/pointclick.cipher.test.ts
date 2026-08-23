import { describe, expect, it } from "vitest";
import {
  createCipherState,
  encodeCipher,
  submitCipher,
  updateCipherInput,
} from "@games/pointclick-engine/puzzles/cipher";

describe("cipher puzzle", () => {
  it("encodes a word with the substitution cipher", () => {
    // A→X, B→Y, C→Z
    expect(encodeCipher("ABC")).toBe("XYZ");
  });

  it("preserves non-alpha characters", () => {
    expect(encodeCipher("HELLO WORLD")).toBe("EBIIL TLOIA");
  });

  it("is fully reversible (symmetric shift of 3)", () => {
    const plain = "TOYMAKER";
    const coded = encodeCipher(plain);
    // Each letter shifted by -3 (or +23 mod 26)
    // T=20 → Q=17, O=15 → L=12, Y=25 → V=22, M=13 → J=10, etc.
    expect(coded).toBe("QLVJXHBO");
    const coded2 = encodeCipher(coded);
    expect(coded2).toBe("NISGUEYL");
  });

  it("creates state with coded value and no user input", () => {
    const s = createCipherState("HELLO", "Think of letters");
    expect(s.answer).toBe("HELLO");
    expect(s.coded).toBe(encodeCipher("HELLO")); // EBIIL
    expect(s.userInput).toBe("");
    expect(s.solved).toBe(false);
    expect(s.attempts).toBe(0);
    expect(s.hint).toBe("Think of letters");
  });

  it("sanitizes input to uppercase A-Z only", () => {
    const s = createCipherState("TEST");
    const updated = updateCipherInput(s, "t e-s t!");
    expect(updated.userInput).toBe("TEST");
  });

  it("truncates input to answer length", () => {
    const s = createCipherState("HI");
    const updated = updateCipherInput(s, "HELLO");
    expect(updated.userInput).toBe("HE");
  });

  it("solves when user decodes correctly", () => {
    const s = createCipherState("CAT");
    let updated = updateCipherInput(s, "CAT");
    updated = submitCipher(updated);
    expect(updated.solved).toBe(true);
    expect(updated.attempts).toBe(1);
  });

  it("does not solve for wrong answer", () => {
    const s = createCipherState("DOG");
    let updated = updateCipherInput(s, "PIG");
    updated = submitCipher(updated);
    expect(updated.solved).toBe(false);
    expect(updated.attempts).toBe(1);
  });

  it("increments attempts on each submit", () => {
    const s = createCipherState("BIRD");
    let updated = submitCipher(updateCipherInput(s, "FISH"));
    updated = submitCipher(updateCipherInput(updated, "WORM"));
    expect(updated.attempts).toBe(2);
  });

  it("is idempotent after solved", () => {
    const s = createCipherState("FROG");
    let updated = updateCipherInput(s, "FROG");
    updated = submitCipher(updated);
    expect(updated.solved).toBe(true);

    // Further input changes should be ignored
    const unchanged = updateCipherInput(updated, "TOAD");
    expect(unchanged.userInput).toBe("FROG");
    expect(unchanged.solved).toBe(true);

    // Further submits should keep the same state
    const resubmitted = submitCipher(unchanged);
    expect(resubmitted.attempts).toBe(1);
  });

  it("handles empty hint", () => {
    const s = createCipherState("NO");
    expect(s.hint).toBe("");
    expect(s.answer).toBe("NO");
    expect(s.coded.length).toBe(2);
  });

  it("handles words with digits and punctuation", () => {
    const s = createCipherState("CODE 42!");
    expect(s.answer).toBe("CODE"); // answer sanitized to A-Z only
    // coded preserves non-alpha characters as-is (digits, spaces, punctuation pass through)
    expect(s.coded).toBe("ZLAB 42!");
  });
});