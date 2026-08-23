import { describe, expect, it } from "vitest";
import {
  createAnagramState,
  submitAnagram,
  updateAnagramInput,
} from "@games/pointclick-engine/puzzles/anagram";

describe("anagram puzzle", () => {
  it("creates a scrambled version of the word", () => {
    const s = createAnagramState("HELLO");
    expect(s.word).toBe("HELLO");
    expect(s.scrambled).not.toBe("HELLO");
    // Scrambled should have the same letters
    expect(s.scrambled.split("").sort().join("")).toBe(
      "HELLO".split("").sort().join(""),
    );
  });

  it("starts unsolved with empty input and zero attempts", () => {
    const s = createAnagramState("WORLD");
    expect(s.solved).toBe(false);
    expect(s.userInput).toBe("");
    expect(s.attempts).toBe(0);
  });

  it("sanitizes input to uppercase A-Z only", () => {
    const s = createAnagramState("TEST");
    const updated = updateAnagramInput(s, "t e-s t!");
    expect(updated.userInput).toBe("TEST");
  });

  it("truncates input to word length", () => {
    const s = createAnagramState("HI");
    const updated = updateAnagramInput(s, "HELLO");
    expect(updated.userInput).toBe("HE");
  });

  it("solves when input matches word", () => {
    const s = createAnagramState("CAT");
    let updated = updateAnagramInput(s, "CAT");
    updated = submitAnagram(updated);
    expect(updated.solved).toBe(true);
    expect(updated.attempts).toBe(1);
  });

  it("does not solve when input does not match", () => {
    const s = createAnagramState("DOG");
    let updated = updateAnagramInput(s, "PIG");
    updated = submitAnagram(updated);
    expect(updated.solved).toBe(false);
    expect(updated.attempts).toBe(1);
  });

  it("increments attempts on each submit", () => {
    const s = createAnagramState("BIRD");
    let updated = updateAnagramInput(s, "FISH");
    updated = submitAnagram(updated);
    updated = updateAnagramInput(updated, "WORM");
    updated = submitAnagram(updated);
    expect(updated.attempts).toBe(2);
    expect(updated.solved).toBe(false);
  });

  it("is idempotent after solved", () => {
    const s = createAnagramState("FROG");
    let updated = updateAnagramInput(s, "FROG");
    updated = submitAnagram(updated);
    expect(updated.solved).toBe(true);

    // Further input changes should be ignored
    const unchanged = updateAnagramInput(updated, "TOAD");
    expect(unchanged.userInput).toBe("FROG");
    expect(unchanged.solved).toBe(true);

    // Further submits should keep the same state
    const resubmitted = submitAnagram(unchanged);
    expect(resubmitted.attempts).toBe(1);
  });

  it("handles words with spaces and punctuation stripped", () => {
    const s = createAnagramState("ICE CREAM");
    expect(s.word).toBe("ICECREAM");
    // Scrambled should not be identical to the sanitized word
    expect(s.scrambled).not.toBe("ICECREAM");
  });

  it("single-letter words stay as-is", () => {
    const s = createAnagramState("A");
    expect(s.word).toBe("A");
    // Single-letter scramble is trivially the same
    expect(s.scrambled).toBe("A");
  });
});