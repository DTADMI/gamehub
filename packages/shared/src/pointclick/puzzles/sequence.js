// libs/shared/src/pointclick/puzzles/sequence.ts
// Pure logic for a Simon/sequence memory puzzle.
export function createSequenceState(target, opts = {}) {
    const lives = Math.max(0, opts.lives ?? 3);
    return {
        target: [...target],
        goal: [...target],
        input: [],
        step: 0,
        mistakes: 0,
        lives,
        solved: false,
        failed: false,
    };
}
export function pressSeq(state, sym) {
    if (state.solved || state.failed) {
        return state;
    }
    const expected = state.target[state.input.length];
    const input = [...state.input, sym];
    if (sym !== expected) {
        const lives = Math.max(0, state.lives - 1);
        return {
            ...state,
            input: [],
            step: 0,
            mistakes: state.mistakes + 1,
            lives,
            failed: lives === 0,
        };
    }
    const nextStep = state.input.length + 1;
    const solved = nextStep === state.target.length;
    return {
        ...state,
        input,
        step: nextStep,
        solved,
    };
}
export function resetSeq(state) {
    return {
        ...state,
        input: [],
        step: 0,
        mistakes: 0,
        // keep lives, target; do not change solved/failed here
    };
}
export function nextRoundSeq(state, extendBy = 1) {
    // Extend the target (e.g., add 1 random symbol) and reset buffers
    const extension = Array.isArray(extendBy)
        ? extendBy
        : state.target.slice(-extendBy);
    return {
        ...state,
        target: [...state.target, ...extension],
        input: [],
        step: 0,
        mistakes: 0,
        solved: false,
        failed: false,
    };
}
