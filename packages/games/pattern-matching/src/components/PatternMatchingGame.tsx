"use client";

import { GameContainer, soundManager } from "@gamehub/game-platform";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Pattern {
  id: number;
  type: "color" | "shape" | "sequence" | "grid";
  target: PatternTarget;
  options: PatternOption[];
  correctIndex: number;
}

interface PatternTarget {
  colors?: string[];
  shapes?: string[];
  sequence?: number[];
  grid?: (number | null)[][];
  missingIndex?: number;
}

interface PatternOption {
  id: number;
  value: string | number;
  display: string | number;
}

const COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6",
  "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1", "#84CC16",
];

const SHAPES = ["square", "triangle", "circle", "star", "diamond", "hexagon"] as const;

const DIFFICULTY_CONFIG = {
  easy: { optionCount: 4, timeLimit: 0, lives: 5 },
  medium: { optionCount: 6, timeLimit: 0, lives: 3 },
  hard: { optionCount: 8, timeLimit: 30, lives: 3 },
} as const;

type Difficulty = keyof typeof DIFFICULTY_CONFIG;

const HIGH_SCORE_KEY = "pattern-matching-high-score";

function generatePattern(difficulty: Difficulty): Pattern {
  const config = DIFFICULTY_CONFIG[difficulty];
  const types: Pattern["type"][] = ["color", "shape", "sequence", "grid"];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case "color": {
      const count = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
      const colors = shuffleArray(COLORS).slice(0, count);
      const correctColor = colors[Math.floor(Math.random() * colors.length)];
      const distractors = shuffleArray(COLORS.filter((c) => c !== correctColor)).slice(0, config.optionCount - 1);
      const options = shuffleArray([
        { id: 0, value: correctColor, display: correctColor },
        ...distractors.map((c, i) => ({ id: i + 1, value: c, display: c })),
      ]);
      return {
        id: Date.now(),
        type: "color",
        target: { colors },
        options,
        correctIndex: options.findIndex((o) => o.value === correctColor),
      };
    }
    case "shape": {
      const count = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
      const shapes = shuffleArray([...SHAPES]).slice(0, count);
      const correctShape = shapes[Math.floor(Math.random() * shapes.length)];
      const distractors = shuffleArray(SHAPES.filter((s) => s !== correctShape)).slice(0, config.optionCount - 1);
      const options = shuffleArray([
        { id: 0, value: correctShape, display: correctShape },
        ...distractors.map((s, i) => ({ id: i + 1, value: s, display: s })),
      ]);
      return {
        id: Date.now(),
        type: "shape",
        target: { shapes },
        options,
        correctIndex: options.findIndex((o) => o.value === correctShape),
      };
    }
    case "sequence": {
      const patternType = Math.random() < 0.5 ? "ab" : "abc";
      const numPool = [2, 4, 6, 8, 10, 3, 5, 7, 9];
      if (patternType === "ab") {
        const a = numPool[Math.floor(Math.random() * numPool.length)];
        const b = numPool.filter((n) => n !== a)[Math.floor(Math.random() * (numPool.length - 1))];
        const sequence = [a, b, a, b, a, b, a];
        const correct = a;
        const distractors = shuffleArray(numPool.filter((n) => n !== correct)).slice(0, config.optionCount - 1);
        const options = shuffleArray([
          { id: 0, value: correct, display: correct },
          ...distractors.map((n, i) => ({ id: i + 1, value: n, display: n })),
        ]);
        return {
          id: Date.now(),
          type: "sequence",
          target: { sequence: sequence.slice(0, -1) },
          options,
          correctIndex: options.findIndex((o) => o.value === correct),
        };
      } else {
        const pool = shuffleArray(numPool).slice(0, 3);
        const [a, b, c] = pool.sort(() => Math.random() - 0.5);
        const sequence = [a, b, c, a, b, c, a, b];
        const correct = c;
        const distractors = shuffleArray(numPool.filter((n) => n !== correct)).slice(0, config.optionCount - 1);
        const options = shuffleArray([
          { id: 0, value: correct, display: correct },
          ...distractors.map((n, i) => ({ id: i + 1, value: n, display: n })),
        ]);
        return {
          id: Date.now(),
          type: "sequence",
          target: { sequence: sequence.slice(0, -1) },
          options,
          correctIndex: options.findIndex((o) => o.value === correct),
        };
      }
    }
    case "grid": {
      const size = difficulty === "easy" ? 2 : 3;
      const gridValues = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, size * size);
      const grid: (number | null)[][] = [];
      let idx = 0;
      for (let r = 0; r < size; r++) {
        grid[r] = [];
        for (let c = 0; c < size; c++) {
          grid[r][c] = gridValues[idx++];
        }
      }
      const missingRow = Math.floor(Math.random() * size);
      const missingCol = Math.floor(Math.random() * size);
      const correct = grid[missingRow][missingCol]!;
      grid[missingRow][missingCol] = null;
      const distractors = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== correct)).slice(0, config.optionCount - 1);
      const options = shuffleArray([
        { id: 0, value: correct, display: correct },
        ...distractors.map((n, i) => ({ id: i + 1, value: n, display: n })),
      ]);
      return {
        id: Date.now(),
        type: "grid",
        target: { grid, missingIndex: missingRow * size + missingCol },
        options,
        correctIndex: options.findIndex((o) => o.value === correct),
      };
    }
    default:
      return generatePattern(difficulty);
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getShapePath(shape: string, size: number): React.ReactNode {
  const half = size / 2;
  switch (shape) {
    case "circle":
      return <circle cx={half} cy={half} r={half * 0.8} />;
    case "square":
      return <rect x={half * 0.2} y={half * 0.2} width={half * 1.6} height={half * 1.6} />;
    case "triangle": {
      const s = half * 0.8;
      return <polygon points={`${half},${half - s} ${half - s},${half + s} ${half + s},${half + s}`} />;
    }
    case "star": {
      const points = [];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? half * 0.8 : half * 0.35;
        const px = half + Math.cos(angle) * r;
        const py = half + Math.sin(angle) * r;
        points.push(`${px},${py}`);
      }
      return <polygon points={points.join(" ")} />;
    }
    case "diamond":
      return <polygon points={`${half},${half * 0.1} ${half * 1.9},${half} ${half},${half * 1.9} ${half * 0.1},${half}`} />;
    case "hexagon": {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        pts.push(`${half + Math.cos(angle) * half * 0.8},${half + Math.sin(angle) * half * 0.8}`);
      }
      return <polygon points={pts.join(" ")} />;
    }
    default:
      return null;
  }
}

export const PatternMatchingGame: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<"timed" | "survival">("survival");
  const [phase, setPhase] = useState<"ready" | "playing" | "paused" | "over">("ready");
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState<number>(1);
  const [lives, setLives] = useState<number>(DIFFICULTY_CONFIG.easy.lives);
  const [timeLeft, setTimeLeft] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    if (stored) {
      setHighScore(parseInt(stored, 10));
    }
  }, []);

  const updateHighScore = useCallback((newScore: number) => {
    setHighScore((prev) => {
      const next = Math.max(prev, newScore);
      localStorage.setItem(HIGH_SCORE_KEY, String(next));
      return next;
    });
  }, []);

  const advancePattern = useCallback(() => {
    const newPattern = generatePattern(difficulty);
    setPattern(newPattern);
    setSelectedIndex(null);
    setFeedback(null);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
  }, [difficulty]);

  const startGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setScore(0);
    setStreak(0);
    setLevel(1);
    setLives(config.lives);
    setPhase("playing");
    setFeedback(null);
    setSelectedIndex(null);
    if (mode === "timed") {
      setTimeLeft(config.timeLimit > 0 ? config.timeLimit : 60);
    }
    advancePattern();
    soundManager.preloadSound("click", "/sounds/click.mp3");
    soundManager.preloadSound("gameOver", "/sounds/game-over.mp3");
    soundManager.preloadSound("powerUp", "/sounds/power-up.mp3");
    soundManager.preloadSound("loseLife", "/sounds/lose-life.mp3");
    soundManager.preloadSound("background", "/sounds/background.mp3", true);
    soundManager.playMusic("background");
  }, [difficulty, mode, advancePattern]);

  useEffect(() => {
    if (phase !== "playing" || mode !== "timed") return;
    if (timeLeft <= 0) {
      setPhase("over");
      updateHighScore(score);
      soundManager.stopMusic();
      soundManager.playSound("gameOver");
      window.dispatchEvent(
        new CustomEvent("pattern-matching:gameover", { detail: { score } }),
      );
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, mode, timeLeft, score, updateHighScore]);

  useEffect(() => {
    return () => {
      soundManager.stopMusic();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleOptionSelect = useCallback(
    (index: number) => {
      if (phase !== "playing" || !pattern || feedback) return;
      setSelectedIndex(index);

      if (index === pattern.correctIndex) {
        setFeedback("correct");
        soundManager.playSound("powerUp");
        const points = 100 + streak * 10;
        setScore((s) => s + points);
        setStreak((s) => s + 1);
        const newLevel = Math.floor(streak / 5) + 1;
        if (newLevel > level) setLevel(newLevel);

        if (streak + 1 > 0 && (streak + 1) % 5 === 0) {
          if (mode === "timed") setTimeLeft((t) => t + 5);
        }

        feedbackTimerRef.current = setTimeout(() => {
          advancePattern();
        }, 600);
      } else {
        setFeedback("wrong");
        soundManager.playSound("loseLife");
        setStreak(0);
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            setTimeout(() => {
              setPhase("over");
              updateHighScore(score);
              soundManager.stopMusic();
              soundManager.playSound("gameOver");
              window.dispatchEvent(
                new CustomEvent("pattern-matching:gameover", { detail: { score } }),
              );
            }, 800);
          }
          return next;
        });
        setScore((s) => Math.max(0, s - 25));
        feedbackTimerRef.current = setTimeout(() => {
          advancePattern();
        }, 1000);
      }
    },
    [phase, pattern, feedback, streak, level, score, mode, advancePattern, updateHighScore],
  );

  const patternTypeLabel = (type: string) => {
    switch (type) {
      case "color": return "Color Pattern";
      case "shape": return "Shape Pattern";
      case "sequence": return "Number Sequence";
      case "grid": return "Grid Puzzle";
      default: return "Pattern";
    }
  };

  const renderTarget = () => {
    if (!pattern) return null;
    const { target, type } = pattern;

    if (type === "color" && target.colors) {
      return (
        <div className="flex gap-2 flex-wrap justify-center">
          {target.colors.map((c, i) => (
            <div
              key={i}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-lg border-2 border-white"
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center">
            <span className="text-xl text-gray-400">?</span>
          </div>
        </div>
      );
    }

    if (type === "shape" && target.shapes) {
      const shapeSize = 48;
      return (
        <div className="flex gap-2 flex-wrap justify-center items-center">
          {target.shapes.map((s, i) => (
            <svg key={i} width={shapeSize} height={shapeSize} className="fill-blue-500 stroke-blue-700 stroke-2">
              {getShapePath(s, shapeSize)}
            </svg>
          ))}
          <div className="flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg"
            style={{ width: shapeSize, height: shapeSize }}>
            <span className="text-xl text-gray-400">?</span>
          </div>
        </div>
      );
    }

    if (type === "sequence" && target.sequence) {
      return (
        <div className="flex gap-1.5 flex-wrap justify-center items-center">
          {target.sequence.map((n, i) => (
            <span key={i} className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-lg">
              {n}
            </span>
          ))}
          <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md border-2 border-dashed border-gray-400 dark:border-gray-500 text-xl text-gray-400 font-bold">
            ?
          </span>
        </div>
      );
    }

    if (type === "grid" && target.grid) {
      const size = target.grid.length;
      return (
        <div
          className="grid gap-1 mx-auto"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {target.grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center font-bold text-lg ${
                  cell === null
                    ? "border-2 border-dashed border-gray-400 dark:border-gray-500 text-gray-400"
                    : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                }`}
              >
                {cell === null ? "?" : cell}
              </div>
            )),
          )}
        </div>
      );
    }

    return null;
  };

  const renderOption = (option: PatternOption, index: number) => {
    if (!pattern) return null;

    const isSelected = selectedIndex === index;
    const isCorrect = feedback === "correct" && isSelected;
    const isWrong = feedback === "wrong" && isSelected;

    return (
      <button
        key={option.id}
        onClick={() => handleOptionSelect(index)}
        disabled={feedback !== null}
        className={`min-h-[56px] min-w-[80px] p-3 rounded-xl font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-4 ${
          isCorrect
            ? "bg-green-500 text-white scale-105 ring-green-300"
            : isWrong
              ? "bg-red-500 text-white scale-95 ring-red-300"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow-lg active:scale-95"
        }`}
      >
        {pattern.type === "color" ? (
          <div className="w-8 h-8 rounded-full mx-auto border border-gray-300" style={{ backgroundColor: String(option.display) }} />
        ) : pattern.type === "shape" ? (
          <svg width={36} height={36} className="fill-blue-500 stroke-blue-700 stroke-2 mx-auto">
            {getShapePath(String(option.display), 36)}
          </svg>
        ) : (
          <span>{option.display}</span>
        )}
      </button>
    );
  };

  const diffConfig = DIFFICULTY_CONFIG[difficulty];

  return (
    <GameContainer
      title="Pattern Matching"
      description={`Match the missing pattern piece! ${pattern ? patternTypeLabel(pattern.type) : ""}`}
      lockTouch={false}
      backgroundImage="/images/bg-pastel-pattern.jpg"
      showParticleControls={false}
    >
      <div className="overflow-hidden p-3 md:p-4">
        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-center">
          <div>
            <label className="mr-2 text-gray-700 dark:text-gray-300 text-sm">Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              disabled={phase === "playing"}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mr-2 text-gray-700 dark:text-gray-300 text-sm">Mode:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "timed" | "survival")}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              disabled={phase === "playing"}
            >
              <option value="survival">Survival</option>
              <option value="timed">Timed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {phase === "ready" || phase === "over" ? (
              <button
                onClick={startGame}
                className="min-h-11 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-sm font-medium"
              >
                {phase === "over" ? "Play Again" : "Start"}
              </button>
            ) : (
              <button
                onClick={() => setPhase((p) => (p === "paused" ? "playing" : "paused"))}
                className="min-h-11 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 text-sm font-medium"
              >
                {phase === "paused" ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>

        {/* HUD */}
        <div className="mb-4 flex flex-wrap justify-center gap-4 text-center text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Score: {score}</span>
          <span>Streak: {streak}</span>
          <span>Level: {level}</span>
          {mode === "survival" && (
            <span className={lives <= 1 ? "text-red-500 font-bold" : ""}>
              Lives: {"❤".repeat(lives)}{"♡".repeat(Math.max(0, diffConfig.lives - lives))}
            </span>
          )}
          {mode === "timed" && (
            <span className={timeLeft <= 10 ? "text-red-500 font-bold" : ""}>
              Time: {timeLeft}s
            </span>
          )}
          <span>Best: {highScore}</span>
        </div>

        {/* Game Area */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center">
          {/* Target Pattern */}
          <div className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl min-w-[200px]">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Target
            </h3>
            {renderTarget()}
          </div>

          {/* Options Grid */}
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Choose Match
            </h3>
            <div className={`grid gap-3 ${
              pattern?.options.length === 4 ? "grid-cols-2" :
              pattern?.options.length === 6 ? "grid-cols-3" :
              "grid-cols-4"
            }`}>
              {pattern?.options.map((opt, i) => renderOption(opt, i))}
            </div>
          </div>
        </div>

        {/* Pause Overlay */}
        {phase === "paused" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40">
            <button
              onClick={() => setPhase("playing")}
              className="rounded-md bg-white dark:bg-gray-800 px-6 py-3 text-lg font-semibold text-gray-900 dark:text-gray-100 shadow-xl"
            >
              Paused — Tap to resume
            </button>
          </div>
        )}

        {/* Game Over */}
        {phase === "over" && (
          <div className="mt-4 text-center">
            <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                Game Over!
              </h3>
              <p className="mt-1 text-green-700 dark:text-green-300">
                Final Score: {score} | Level: {level} | Best: {highScore}
              </p>
              <button
                onClick={startGame}
                className="mt-3 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameContainer>
  );
};

export default React.memo(PatternMatchingGame);
