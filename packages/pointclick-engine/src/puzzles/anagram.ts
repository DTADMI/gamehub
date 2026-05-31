export type AnagramState = {
  word: string;
  scrambled: string;
  userInput: string;
  solved: boolean;
  attempts: number;
};

function scramble(word: string): string {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const result = letters.join("");
  if (result === word && word.length > 1) {
    return scramble(word);
  }
  return result;
}

export function createAnagramState(word: string): AnagramState {
  return {
    word: word.toUpperCase().replace(/[^A-Z]/g, ""),
    scrambled: scramble(word.toUpperCase().replace(/[^A-Z]/g, "")),
    userInput: "",
    solved: false,
    attempts: 0,
  };
}

export function updateAnagramInput(state: AnagramState, value: string): AnagramState {
  if (state.solved) {return state;}
  const sanitized = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, state.word.length);
  return { ...state, userInput: sanitized };
}

export function submitAnagram(state: AnagramState): AnagramState {
  if (state.solved) {return state;}
  const solved = state.userInput === state.word;
  return {
    ...state,
    solved,
    attempts: state.attempts + 1,
  };
}
