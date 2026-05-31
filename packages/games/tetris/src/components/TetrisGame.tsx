"use client";

import { soundManager } from "@gamehub/game-platform";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CELL_SIZE,
  GameState,
  Position,
  TETROMINO_TYPES,
  TETROMINOS,
} from "../types/game";

interface TetrisGameProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, lines: number, level: number) => void;
}

function detectTSpin(tetromino: any, board: string[][]): boolean {
  if (!tetromino || tetromino.color !== "purple") {return false;}
  const corners = [
    { x: tetromino.position.x, y: tetromino.position.y },
    { x: tetromino.position.x + 2, y: tetromino.position.y },
    { x: tetromino.position.x, y: tetromino.position.y + 2 },
    { x: tetromino.position.x + 2, y: tetromino.position.y + 2 },
  ];
  let count = 0;
  for (const { x, y } of corners) {
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || (y >= 0 && board[y] && board[y][x] !== "")) {
      count++;
    }
  }
  return count >= 3;
}

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

const TetrisGame = ({ onScoreUpdate, onGameOver }: TetrisGameProps = {}) => {
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

  const comboRef = useRef(0);
  const [comboDisplay, setComboDisplay] = useState(0);
  const [tSpinText, setTSpinText] = useState("");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastSession, setLastSession] = useState<{ score: number; lines: number; level: number } | null>(null);

  const lastActionWasRotation = useRef(false);
  const pointerRef = useRef({ startX: 0, startY: 0, startTime: 0 });

  useEffect(() => {
    if (typeof soundManager.registerSound === "function") {
      soundManager.registerSound("tetrisMove", "/sounds/tetris-move.mp3");
      soundManager.registerSound("tetrisRotate", "/sounds/tetris-rotate.mp3");
      soundManager.registerSound("tetrisLock", "/sounds/tetris-lock.mp3");
      soundManager.registerSound("tetrisLineClear", "/sounds/tetris-line-clear.mp3");
      soundManager.registerSound("tetrisGameOver", "/sounds/tetris-game-over.mp3");
      soundManager.registerSound("tetrisLevelUp", "/sounds/tetris-level-up.mp3");
    }
  }, []);

  useEffect(() => {
    try {
      const savedScore = localStorage.getItem("tetrisScore");
      const savedLines = localStorage.getItem("tetrisLines");
      const savedLevel = localStorage.getItem("tetrisLevel");
      if (savedScore && savedLines && savedLevel) {
        const s = parseInt(savedScore, 10);
        const l = parseInt(savedLines, 10);
        const lv = parseInt(savedLevel, 10);
        if (!isNaN(s) && !isNaN(l) && !isNaN(lv) && s > 0) {
          setLastSession({ score: s, lines: l, level: lv });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      try {
        localStorage.setItem("tetrisScore", String(gameState.score));
        localStorage.setItem("tetrisLines", String(gameState.lines));
        localStorage.setItem("tetrisLevel", String(gameState.level));
      } catch {}
    }
  }, [gameState.score, gameState.lines, gameState.level, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

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

    const updatedBoard = newBoard.filter((row) => {
      const isRowFull = row.every((cell) => cell !== "");
      if (isRowFull) {
        linesCleared++;
      }
      return !isRowFull;
    });

    while (updatedBoard.length < BOARD_HEIGHT) {
      updatedBoard.unshift(Array(BOARD_WIDTH).fill(""));
    }

    const newLines = lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;

    const isTSpin = lastActionWasRotation.current && detectTSpin(tetromino, board);
    let points = 0;

    if (linesCleared > 0) {
      if (isTSpin) {
        const tSpinPoints = [0, 400, 800, 1200, 1600][linesCleared] * level;
        points = tSpinPoints;
        setTSpinText(`T-Spin ${["", "Single", "Double", "Triple", "Tetris"][linesCleared]}! +${tSpinPoints}`);
        setTimeout(() => setTSpinText(""), 2500);
      } else {
        points = [0, 40, 100, 300, 1200][linesCleared] * level;
      }
      comboRef.current += 1;
      setComboDisplay(comboRef.current);
      points += 50 * comboRef.current * level;
      if (soundEnabled) {
        soundManager.playSound("tetrisLineClear", 0.7);
      }
    } else {
      comboRef.current = 0;
      setComboDisplay(0);
    }

    if (newLevel > level) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 1800);
      if (soundEnabled) {
        soundManager.playSound("tetrisLevelUp", 0.8);
      }
    }

    if (soundEnabled && linesCleared === 0) {
      soundManager.playSound("tetrisLock", 0.5);
    }

    lastActionWasRotation.current = false;

    const totalScore = score + points;
    const nextTetrominoCollides = checkCollision(gameState.nextTetromino, updatedBoard, gameState.nextTetromino.position);

    setGameState((prev) => ({
      ...prev,
      board: updatedBoard,
      tetromino: prev.nextTetromino,
      nextTetromino: createRandomTetromino(),
      score: totalScore,
      lines: newLines,
      level: newLevel,
      gameOver: checkCollision(prev.nextTetromino, updatedBoard, prev.nextTetromino.position),
    }));

    if (totalScore > gameState.highScore) {
      localStorage.setItem("tetrisHighScore", totalScore.toString());
      setGameState((prev) => ({ ...prev, highScore: totalScore }));
    }

    window.dispatchEvent(new CustomEvent("game:scoreUpdate", { detail: { game: "tetris", score: totalScore } }));
    onScoreUpdate?.(totalScore);

    if (nextTetrominoCollides) {
      if (soundEnabled) {
        soundManager.playSound("tetrisGameOver", 0.8);
      }
      window.dispatchEvent(
        new CustomEvent("game:gameOver", { detail: { game: "tetris", score: totalScore, lines: newLines, level: newLevel } }),
      );
      onGameOver?.(totalScore, newLines, newLevel);
    }
  }, [gameState, checkCollision, soundEnabled, onScoreUpdate, onGameOver]);

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
            lastActionWasRotation.current = true;
            if (soundEnabled) {
              soundManager.playSound("tetrisRotate", 0.5);
            }
          }
        }

        if (direction !== "rotate" && !checkCollision(tetromino, board, newPosition)) {
          if (soundEnabled && (direction === "left" || direction === "right")) {
            soundManager.playSound("tetrisMove", 0.3);
          }
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
      soundEnabled,
    ],
  );

  const hardDrop = useCallback(() => {
    if (gameState.gameOver || gameState.isPaused || !gameState.gameStarted) {return;}
    while (
      !checkCollision(gameState.tetromino, gameState.board, {
        ...gameState.tetromino.position,
        y: gameState.tetromino.position.y + 1,
      })
    ) {
      moveTetromino("down");
    }
    moveTetromino("down");
  }, [gameState, checkCollision, moveTetromino]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    pointerRef.current = { startX: e.clientX, startY: e.clientY, startTime: Date.now() };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    const { startX, startY, startTime } = pointerRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const dt = Date.now() - startTime;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDy > 50 && dy > 0 && dt < 300) {
      hardDrop();
    } else if (absDx > 30 && absDx > absDy) {
      moveTetromino(dx > 0 ? "right" : "left");
    } else if (absDy > 30 && absDy > absDx) {
      if (dt < 300 && dy > 0) {
        hardDrop();
      } else {
        moveTetromino(dy > 0 ? "down" : "rotate");
      }
    } else if (absDx < 15 && absDy < 15 && dt < 300) {
      moveTetromino("rotate");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameStarted) {
        if (e.code === "Space") {
          e.preventDefault();
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
          comboRef.current = 0;
          setComboDisplay(0);
          setTSpinText("");
        }
        return;
      }

      if (gameState.gameOver) {
        if (e.code === "Space") {
          e.preventDefault();
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
          comboRef.current = 0;
          setComboDisplay(0);
          setTSpinText("");
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
          e.preventDefault();
          moveTetromino("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          moveTetromino("right");
          break;
        case "ArrowDown":
          e.preventDefault();
          moveTetromino("down");
          break;
        case "ArrowUp":
          e.preventDefault();
          moveTetromino("rotate");
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveTetromino, checkCollision, gameState, hardDrop]);

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

  const ghostCells = useMemo(() => {
    const cells = new Set<string>();
    const { tetromino, board, gameStarted, gameOver } = gameState;
    if (!gameStarted || gameOver || !tetromino) {return cells;}

    let ghostY = tetromino.position.y;
    while (!checkCollision(tetromino, board, { x: tetromino.position.x, y: ghostY + 1 })) {
      ghostY++;
    }

    if (ghostY === tetromino.position.y) {return cells;}

    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x]) {
          const cellY = ghostY + y;
          const cellX = tetromino.position.x + x;
          const currentY = tetromino.position.y + y;
          const currentX = tetromino.position.x + x;

          if (currentY !== cellY || currentX !== cellX) {
            cells.add(`${cellY}-${cellX}`);
          }
        }
      }
    }
    return cells;
  }, [gameState, checkCollision]);

  const renderCell = (cell: string, rowIndex: number, colIndex: number) => {
    const isCurrentTetromino =
      rowIndex >= gameState.tetromino.position.y &&
      rowIndex < gameState.tetromino.position.y + gameState.tetromino.shape.length &&
      colIndex >= gameState.tetromino.position.x &&
      colIndex < gameState.tetromino.position.x + gameState.tetromino.shape[0].length &&
      gameState.tetromino.shape[rowIndex - gameState.tetromino.position.y]?.[
        colIndex - gameState.tetromino.position.x
      ];

    const isGhost = ghostCells.has(`${rowIndex}-${colIndex}`);
    const cellColor = cell || (isCurrentTetromino ? gameState.tetromino.color : "");

    if (isGhost) {
      return (
        <div
          key={`${rowIndex}-${colIndex}`}
          className="h-8 w-8 border border-gray-200"
          style={{
            backgroundColor: gameState.tetromino.color || "transparent",
            opacity: 0.2,
            border: `1px dashed ${gameState.tetromino.color || "gray"}`,
          }}
        />
      );
    }

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`h-8 w-8 border border-gray-200 ${cellColor ? "border-opacity-50" : ""}`}
        style={{ backgroundColor: cellColor || "transparent" }}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 select-none">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold">Tetris</h1>
        <div className="mb-4 flex justify-center gap-8">
          <div className="text-xl">Score: {gameState.score}</div>
          <div className="text-xl">Level: {gameState.level}</div>
          <div className="text-xl">Lines: {gameState.lines}</div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="text-xl">High Score: {gameState.highScore}</div>
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundManager.setMuted(!next);
            }}
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>
        </div>
        {lastSession && !gameState.gameStarted && (
          <div className="mt-1 text-sm text-gray-500">
            Last session: {lastSession.score} pts, Level {lastSession.level}, {lastSession.lines} lines
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
        <div className="relative touch-none">
          <div
            className="border-2 border-gray-300 bg-white"
            style={{
              display: "grid",
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
            }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {gameState.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex)),
            )}
          </div>

          {comboDisplay > 1 && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused && (
            <div className="absolute right-2 top-2 rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white shadow-lg animate-bounce">
              Combo x{comboDisplay}
            </div>
          )}

          {showLevelUp && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="animate-pulse text-4xl font-bold text-yellow-400 drop-shadow-lg">
                Level Up!
              </div>
            </div>
          )}

          {!gameState.gameStarted && !gameState.gameOver && (
            <div className="bg-opacity-70 absolute inset-0 flex flex-col items-center justify-center bg-black">
              <div className="mb-4 text-2xl font-bold text-white">Tetris</div>
              <div className="mb-6 text-white">Press Space to Start</div>
              <div className="max-w-xs text-center text-sm text-white">
                Use arrow keys to move and rotate. Space to drop.
              </div>
              <div className="mt-2 text-center text-xs text-gray-300">
                Mobile: swipe to move, tap to rotate, flick down to drop
              </div>
            </div>
          )}

          {gameState.gameOver && (
            <div className="bg-opacity-70 absolute inset-0 flex flex-col items-center justify-center bg-black">
              <div className="mb-4 text-2xl font-bold text-white">Game Over!</div>
              <div className="mb-2 text-white">Score: {gameState.score}</div>
              <div className="mb-6 text-sm text-gray-300">
                Level {gameState.level} | {gameState.lines} lines
              </div>
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
                  comboRef.current = 0;
                  setComboDisplay(0);
                  setTSpinText("");
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

        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-2 text-lg font-semibold">Next</h2>
            <div className="mx-auto grid w-[120px] grid-cols-4 gap-1" style={{ width: "120px" }}>
              {gameState.nextTetromino.shape.map((row: number[], rowIndex: number) =>
                row.map((cell: number, colIndex: number) => (
                  <div
                    key={`next-${rowIndex}-${colIndex}`}
                    className="h-6 w-6"
                    style={{
                      backgroundColor: cell ? gameState.nextTetromino.color : "transparent",
                    }}
                  />
                )),
              )}
            </div>
          </div>

          {tSpinText && (
            <div className="rounded-lg bg-purple-100 p-3 text-center text-sm font-bold text-purple-800 shadow animate-pulse">
              {tSpinText}
            </div>
          )}

          <div className="hidden rounded-lg bg-white p-4 shadow md:block">
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

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:hidden">
        <button
          onPointerDown={(e) => { e.preventDefault(); moveTetromino("left"); }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-2xl text-white hover:bg-gray-600 active:scale-95"
          aria-label="Move left"
        >
          ←
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); moveTetromino("right"); }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-2xl text-white hover:bg-gray-600 active:scale-95"
          aria-label="Move right"
        >
          →
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); moveTetromino("rotate"); }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-2xl text-white hover:bg-gray-600 active:scale-95"
          aria-label="Rotate"
        >
          ↻
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); moveTetromino("down"); }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-2xl text-white hover:bg-gray-600 active:scale-95"
          aria-label="Soft drop"
        >
          ↓
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); hardDrop(); }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl text-white hover:bg-red-500 active:scale-95"
          aria-label="Hard drop"
        >
          ⬇
        </button>
      </div>
    </div>
  );
};

export default React.memo(TetrisGame);
