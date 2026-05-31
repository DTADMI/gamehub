export type CipherState = {
  coded: string;
  answer: string;
  userInput: string;
  solved: boolean;
  attempts: number;
  hint: string;
};

const CIPHER_MAP: Record<string, string> = {
  A: "X", B: "Y", C: "Z", D: "A", E: "B",
  F: "C", G: "D", H: "E", I: "F", J: "G",
  K: "H", L: "I", M: "J", N: "K", O: "L",
  P: "M", Q: "N", R: "O", S: "P", T: "Q",
  U: "R", V: "S", W: "T", X: "U", Y: "V",
  Z: "W",
};

export function encodeCipher(plain: string): string {
  return plain
    .toUpperCase()
    .split("")
    .map((c) => CIPHER_MAP[c] ?? c)
    .join("");
}

export function createCipherState(answer: string, hint?: string): CipherState {
  return {
    coded: encodeCipher(answer),
    answer: answer.toUpperCase().replace(/[^A-Z]/g, ""),
    userInput: "",
    solved: false,
    attempts: 0,
    hint: hint ?? "",
  };
}

export function updateCipherInput(state: CipherState, value: string): CipherState {
  if (state.solved) {return state;}
  const sanitized = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, state.answer.length);
  return { ...state, userInput: sanitized };
}

export function submitCipher(state: CipherState): CipherState {
  if (state.solved) {return state;}
  const solved = state.userInput === state.answer;
  return {
    ...state,
    solved,
    attempts: state.attempts + 1,
  };
}
