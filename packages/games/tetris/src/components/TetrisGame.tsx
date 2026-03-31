"use client";

import { useCallback, useEffect, useState } from "react";

import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CELL_SIZE,
  GameState,
  Position,
  TETROMINO_TYPES,
  TETROMINOS,
} from "../types/game";

const createEmptyBoard = () =>
  Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(""));

const createRandomTetromino = () => {
  const tetrominos = TETROMINO_TYPES;
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return {
    ...TETROMINOS[randTetromino],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
  };
};

const TetrisGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    tetromino: createRandomTetromino(),
    nextTetromino: createRandomTetromino(),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    gameStarted: false,
    highScore:
      typeof window !== "undefined" ? parseInt(localStorage.getItem("tetrisHighScore") || "0") : 0,
  });

  const checkCollision = useCallback((tetromino: any, board: string[][], position: Position) => {
    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x] !== 0) {
          const newX = position.x + x;
          const newY = position.y + y;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX] !== "")
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const rotate = useCallback((matrix: number[][]) => {
    const N = matrix.length;
    const rotated = Array(N)
      .fill(null)
      .map(() => Array(N).fill(0));

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        rotated[x][N - 1 - y] = matrix[y][x];
      }
    }

    return rotated;
  }, []);

  const placeTetromino = useCallback(() => {
    const { tetromino, board, score, lines, level } = gameState;
    const newBoard = board.map((row) => [...row]);
    let linesCleared = 0;

    // Place the tetromino on the board
    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x]) {
          const newY = tetromino.position.y + y;
          const newX = tetromino.position.x + x;
          if (newY >= 0) {
            newBoard[newY][newX] = tetromino.color;
          }
        }
      }
    }

    // Check for completed lines
    const updatedBoard = newBoard.filter((row) => {
      const isRowFull = row.every((cell) => cell !== "");
      if (isRowFull) {
        linesCleared++;
      }
      return !isRowFull;
    });

    // Add empty lines at the top
    while (updatedBoard.length < BOARD_HEIGHT) {
      updatedBoard.unshift(Array(BOARD_WIDTH).fill(""));
    }

    const newLines = lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;
    const points = [0, 40, 100, 300, 1200][linesCleared] * level;

    setGameState((prev) => ({
      ...prev,
      board: updatedBoard,
      tetromino: prev.nextTetromino,
      nextTetromino: createRandomTetromino(),
      score: prev.score + points,
      lines: newLines,
      level: newLevel,
      gameOver: checkCollision(prev.nextTetromino, updatedBoard, prev.nextTetromino.position),
    }));

    // Update high score if needed
    if (score + points > gameState.highScore) {
      const newHighScore = score + points;
      localStorage.setItem("tetrisHighScore", newHighScore.toString());
      setGameState((prev) => ({ ...prev, highScore: newHighScore }));
    }
  }, [gameState, checkCollision]);

  const moveTetromino = useCallback(
    (direction: "left" | "right" | "down" | "rotate") => {
      if (gameState.gameOver || gameState.isPaused || !gameState.gameStarted) {
        return;
      }

      setGameState((prev) => {
        const { tetromino, board } = prev;
        const newPosition = { ...tetromino.position };

        if (direction === "left") {
          newPosition.x -= 1;
        } else if (direction === "right") {
          newPosition.x += 1;
        } else if (direction === "down") {
          newPosition.y += 1;
        }

        let newTetromino = { ...tetromino };
        if (direction === "rotate") {
          const rotatedShape = rotate(tetromino.shape);
          if (!checkCollision({ ...tetromino, shape: rotatedShape }, board, tetromino.position)) {
            newTetromino = { ...tetromino, shape: rotatedShape };
          }
        }

        if (direction !== "rotate" && !checkCollision(tetromino, board, newPosition)) {
          return {
            ...prev,
            tetromino: { ...tetromino, position: newPosition },
          };
        } else if (direction === "down" && checkCollision(tetromino, board, newPosition)) {
          placeTetromino();
        }

        return { ...prev, tetromino: newTetromino };
      });
    },
    [
      checkCollision,
      placeTetromino,
      rotate,
      gameState.gameOver,
      gameState.isPaused,
      gameState.gameStarted,
    ],
  );

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameStarted) {
        if (e.code === "Space") {
          setGameState((prev) => ({
            ...prev,
            gameStarted: true,
            gameOver: false,
            score: 0,
            lines: 0,
            level: 1,
            board: createEmptyBoard(),
            tetromino: createRandomTetromino(),
            nextTetromino: createRandomTetromino(),
          }));
        }
        return;
      }

      if (gameState.gameOver) {
        if (e.code === "Space") {
          setGameState((prev) => ({
            ...prev,
            gameOver: false,
            gameStarted: true,
            score: 0,
            lines: 0,
            level: 1,
            board: createEmptyBoard(),
            tetromino: createRandomTetromino(),
            nextTetromino: createRandomTetromino(),
          }));
        }
        return;
      }

      if (e.code === "Escape") {
        setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
        return;
      }

      if (gameState.isPaused) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          moveTetromino("left");
          break;
        case "ArrowRight":
          moveTetromino("right");
          break;
        case "ArrowDown":
          moveTetromino("down");
          break;
        case "ArrowUp":
          moveTetromino("rotate");
          break;
        case " ":
          // Hard drop
          while (
            !checkCollision(gameState.tetromino, gameState.board, {
              ...gameState.tetromino.position,
              y: gameState.tetromino.position.y + 1,
            })
          ) {
            moveTetromino("down");
          }
          moveTetromino("down");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveTetromino, checkCollision, gameState]);

  // Game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
      return;
    }

    const gameLoop = setInterval(() => {
      moveTetromino("down");
    }, 1000 / gameState.level);

    return () => clearInterval(gameLoop);
  }, [
    gameState.gameStarted,
    gameState.gameOver,
    gameState.isPaused,
    gameState.level,
    moveTetromino,
  ]);

  const saveScore = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameType: "tetris", score: gameState.score }),
      });
      if (!response.ok) {
        throw new Error(`Score save failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  }, [gameState.score]);

  useEffect(() => {
    if (gameState.gameOver && gameState.gameStarted) {
      saveScore();
    }
  }, [gameState.gameOver, gameState.gameStarted, gameState.score, saveScore]);

  const renderCell = (cell: string, rowIndex: number, colIndex: number) => {
    const isCurrentTetromino =
      rowIndex >= gameState.tetromino.position.y &&
      rowIndex < gameState.tetromino.position.y + gameState.tetromino.shape.length &&
      colIndex >= gameState.tetromino.position.x &&
      colIndex < gameState.tetromino.position.x + gameState.tetromino.shape[0].length &&
      gameState.tetromino.shape[rowIndex - gameState.tetromino.position.y]?.[
        colIndex - gameState.tetromino.position.x
      ];

    const cellColor = cell || (isCurrentTetromino ? gameState.tetromino.color : "");

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`h-8 w-8 border border-gray-200 ${cellColor ? "border-opacity-50" : ""}`}
        style={{ backgroundColor: cellColor || "transparent" }}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold">Tetris</h1>
        <div className="mb-4 flex justify-center gap-8">
          <div className="text-xl">Score: {gameState.score}</div>
          <div className="text-xl">Level: {gameState.level}</div>
          <div className="text-xl">Lines: {gameState.lines}</div>
        </div>
        <div className="text-xl">High Score: {gameState.highScore}</div>
      </div>

      <div className="flex gap-8">
        <div className="relative">
          <div
            className="border-2 border-gray-300 bg-white"
            style={{
              display: "grid",
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
            }}
          >
            {gameState.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex)),
            )}
          </div>

          {!gameState.gameStarted && !gameState.gameOver && (
            <div className="bg-opacity-70 absolute inset-0 flex flex-col items-center justify-center bg-black">
              <div className="mb-4 text-2xl font-bold text-white">Tetris</div>
              <div className="mb-6 text-white">Press Space to Start</div>
              <div className="max-w-xs text-center text-sm text-white">
                Use arrow keys to move and rotate. Space to drop.
              </div>
            </div>
          )}

          {gameState.gameOver && (
            <div className="bg-opacity-70 absolute inset-0 flex flex-col items-center justify-center bg-black">
              <div className="mb-4 text-2xl font-bold text-white">Game Over!</div>
              <div className="mb-6 text-white">Score: {gameState.score}</div>
              <button
                onClick={() => {
                  setGameState((prev) => ({
                    ...prev,
                    gameOver: false,
                    gameStarted: true,
                    score: 0,
                    lines: 0,
                    level: 1,
                    board: createEmptyBoard(),
                    tetromino: createRandomTetromino(),
                    nextTetromino: createRandomTetromino(),
                  }));
                }}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Play Again
              </button>
            </div>
          )}

          {gameState.isPaused && (
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-2xl font-bold text-white">Paused</div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-4 rounded-lg bg-white p-4 shadow">
            <h2 className="mb-2 text-lg font-semibold">Next</h2>
            <div className="grid grid-cols-4 gap-1" style={{ width: "120px", height: "120px" }}>
              {gameState.nextTetromino.shape.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`next-${rowIndex}-${colIndex}`}
                    className={`h-6 w-6 ${cell ? `bg-${gameState.nextTetromino.color}-500` : "bg-transparent"}`}
                    style={{
                      backgroundColor: cell ? gameState.nextTetromino.color : "transparent",
                    }}
                  />
                )),
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-2 text-lg font-semibold">Controls</h2>
            <ul className="space-y-1 text-sm">
              <li>← → : Move</li>
              <li>↑ : Rotate</li>
              <li>↓ : Soft Drop</li>
              <li>Space : Hard Drop</li>
              <li>Esc : Pause</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
