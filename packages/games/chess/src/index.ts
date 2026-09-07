export { ChessGame } from "./components/ChessGame";
// Re-export chess logic so unit tests (and consumers) can import from the package root
export { CHESS_TX } from "./i18n";
export { applyMove, initialState, legalMoves } from "./logic/rules";
export * from "./logic/types";
