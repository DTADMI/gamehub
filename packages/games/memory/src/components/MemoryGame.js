"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// games/memory/src/components/MemoryGame.tsx
import { GameContainer, soundManager } from "@games/shared";
import { useCallback, useEffect, useMemo, useRef, useState, } from "react";
const THEMES = {
    emojis: {
        name: "Emojis",
        assets: [
            "🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🍍", "🥝", "🍑", "🥥", "🍋", "🫐", "🍊", "🥕", "🌽", "🍆"
        ],
        type: "text"
    },
    animals: {
        name: "Animals",
        assets: [
            "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"
        ],
        type: "text"
    },
    space: {
        name: "Space",
        assets: [
            "🚀", "🛸", "🪐", "🌟", "🌑", "🌞", "☄️", "🌌", "🛰️", "👩‍🚀", "👨‍🚀", "👽", "👾", "🔭", "📡", "🌍"
        ],
        type: "text"
    }
};
const MAX_PAIRS = 12; // supports up to hard mode
const CARD_VALUES = Array.from({ length: MAX_PAIRS }, (_, i) => i + 1);
export const MemoryGame = () => {
    const [theme, setTheme] = useState("emojis");
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // Track cards visually hidden after match, then removed from layout after animation
    const [hiddenIds, setHiddenIds] = useState(() => new Set());
    const [removedIds, setRemovedIds] = useState(() => new Set());
    // Throttle rapid sound effects on low-end devices
    const lastPlayRef = useRef({});
    const playSound = useCallback((name, minIntervalMs = 60) => {
        try {
            const now = Date.now();
            const last = lastPlayRef.current[name] || 0;
            if (now - last < minIntervalMs) {
                return;
            }
            lastPlayRef.current[name] = now;
            soundManager.playSound(name);
        }
        catch {
            // no-op
        }
    }, []);
    const [difficulty, setDifficulty] = useState("medium");
    const [autoCompleteLastPair, setAutoCompleteLastPair] = useState(true);
    // Initialize game
    const initializeGame = useCallback(() => {
        // Load sounds
        soundManager.preloadSound("cardFlip", "/sounds/card-flip.mp3");
        soundManager.preloadSound("match", "/sounds/match.mp3");
        soundManager.preloadSound("win", "/sounds/win.mp3");
        soundManager.preloadSound("background", "/sounds/memory-bg.mp3", true);
        // Calculate number of pairs based on difficulty
        const pairs = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12;
        const values = CARD_VALUES.slice(0, pairs);
        const cardValues = [...values, ...values]; // Duplicate for pairs
        const shuffled = cardValues
            .sort(() => Math.random() - 0.5)
            .map((value, index) => ({
            id: index,
            value,
            isFlipped: false,
            isMatched: false,
        }));
        setCards(shuffled);
        setFlippedIndices([]);
        setMoves(0);
        setGameOver(false);
        setHiddenIds(new Set());
    }, [difficulty]);
    const startGame = useCallback(() => {
        setIsPaused(false);
        setGameStarted(true);
        initializeGame();
        soundManager.playMusic("background");
    }, [initializeGame]);
    // Check for matches
    useEffect(() => {
        if (flippedIndices.length === 2) {
            setIsProcessing(true);
            const [firstIndex, secondIndex] = flippedIndices;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];
            if (firstCard.value === secondCard.value) {
                // Match found
                setCards((prevCards) => prevCards.map((card, idx) => idx === firstIndex || idx === secondIndex
                    ? { ...card, isMatched: true }
                    : card));
                playSound("match", 80);
                // After a brief spin animation, visually hide matched cards then remove from layout
                const idsToHide = [firstCard.id, secondCard.id];
                setTimeout(() => {
                    setHiddenIds((prev) => {
                        const next = new Set(prev);
                        idsToHide.forEach((id) => next.add(id));
                        return next;
                    });
                    // After fade completes, remove from layout
                    setTimeout(() => {
                        setRemovedIds((prev) => {
                            const next = new Set(prev);
                            idsToHide.forEach((id) => next.add(id));
                            return next;
                        });
                    }, 250);
                }, 500);
            }
            else {
                // No match, flip back after delay
                setTimeout(() => {
                    setCards((prevCards) => prevCards.map((card, idx) => idx === firstIndex || idx === secondIndex
                        ? { ...card, isFlipped: false }
                        : card));
                }, 1000);
            }
            setMoves((prev) => prev + 1);
            setFlippedIndices([]);
            setTimeout(() => setIsProcessing(false), 1000);
        }
    }, [flippedIndices, cards, playSound]);
    // Check for game over
    useEffect(() => {
        if (cards.length > 0 && cards.every((card) => card.isMatched)) {
            setGameOver(true);
            playSound("win", 200);
            soundManager.stopMusic();
            // Dispatch gameover event for the page to handle (stats/leaderboard)
            window.dispatchEvent(new CustomEvent("memory:gameover", {
                detail: { score: moves }
            }));
        }
    }, [cards, moves, playSound]);
    // Auto-complete UX: when only two unmatched cards remain, auto-flip them and count as one move
    useEffect(() => {
        if (!autoCompleteLastPair || gameOver || isProcessing) {
            return;
        }
        if (cards.length === 0) {
            return;
        }
        const unmatched = cards
            .map((c, i) => (c.isMatched ? -1 : i))
            .filter((i) => i >= 0);
        if (unmatched.length === 2 && flippedIndices.length === 0) {
            // Flip both, then let the existing match effect handle marking + move increment
            setIsProcessing(true);
            playSound("cardFlip", 60);
            setCards((prev) => prev.map((c, i) => i === unmatched[0] || i === unmatched[1]
                ? { ...c, isFlipped: true }
                : c));
            setTimeout(() => {
                setFlippedIndices([unmatched[0], unmatched[1]]);
                // The match effect will set isProcessing true and clear it; we can clear our guard shortly after
                setTimeout(() => setIsProcessing(false), 50);
            }, 200);
        }
    }, [
        autoCompleteLastPair,
        cards,
        flippedIndices.length,
        gameOver,
        isProcessing,
        playSound,
    ]);
    // Handle card click
    const handleCardClick = (index) => {
        if (!gameStarted ||
            isPaused ||
            isProcessing ||
            gameOver ||
            flippedIndices.includes(index) ||
            cards[index].isMatched ||
            flippedIndices.length >= 2) {
            return;
        }
        playSound("cardFlip", 60);
        setCards((prev) => prev.map((card, idx) => idx === index ? { ...card, isFlipped: true } : card));
        setFlippedIndices((prev) => [...prev, index]);
    };
    // Initialize game on mount and when difficulty changes
    useEffect(() => {
        initializeGame();
        return () => {
            soundManager.stopMusic();
        };
    }, [initializeGame]);
    // Calculate score and pairs in play
    const score = cards.filter((card) => card.isMatched).length / 2;
    const pairsInPlay = useMemo(() => cards.length / 2 ||
        (difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12), [cards.length, difficulty]);
    const getAssetForValue = (value) => {
        const assets = THEMES[theme].assets;
        return assets[(value - 1) % assets.length];
    };
    const getA11yLabel = (value) => {
        const asset = getAssetForValue(value);
        return `Card with ${asset}`;
    };
    return (_jsx(GameContainer, { title: "Memory Card Game", description: `Match all the pairs in as few moves as possible! Matches: ${score} / ${pairsInPlay}`, lockTouch: false, backgroundImage: "/images/bg-pastel-pattern.jpg", showParticleControls: false, children: _jsxs("div", { className: "p-4 overflow-hidden", children: [_jsxs("div", { className: "mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center", children: [_jsxs("div", { children: [_jsx("label", { className: "mr-2 text-gray-700 dark:text-gray-300", children: "Theme:" }), _jsx("select", { value: theme, onChange: (e) => setTheme(e.target.value), className: "rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", disabled: gameStarted && !gameOver, children: Object.entries(THEMES).map(([key, t]) => (_jsx("option", { value: key, children: t.name }, key))) })] }), _jsxs("div", { children: [_jsx("label", { className: "mr-2 text-gray-700 dark:text-gray-300", children: "Difficulty:" }), _jsxs("select", { value: difficulty, onChange: (e) => setDifficulty(e.target.value), className: "px-3 py-1 border rounded-md", disabled: moves > 0 && gameStarted && !gameOver, children: [_jsx("option", { value: "easy", children: "Easy (6 pairs)" }), _jsx("option", { value: "medium", children: "Medium (8 pairs)" }), _jsx("option", { value: "hard", children: "Hard (12 pairs)" })] })] }), _jsxs("label", { className: "inline-flex items-center gap-2 select-none", children: [_jsx("input", { type: "checkbox", className: "h-4 w-4", checked: autoCompleteLastPair, onChange: (e) => setAutoCompleteLastPair(e.target.checked) }), _jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Auto-complete last pair (counts 1 move)" })] }), _jsx("div", { className: "flex items-center gap-2", children: !gameStarted || gameOver ? (_jsx("button", { onClick: startGame, className: "px-4 py-2 rounded-md min-h-11 bg-blue-600 text-white hover:bg-blue-700", children: gameOver ? "Play Again" : "Start" })) : (_jsx("button", { onClick: () => {
                                    setIsPaused((p) => {
                                        const next = !p;
                                        if (next) {
                                            soundManager.stopMusic();
                                        }
                                        else {
                                            soundManager.playMusic("background");
                                        }
                                        return next;
                                    });
                                }, className: "px-4 py-2 rounded-md min-h-11 bg-gray-600 text-white hover:bg-gray-700", children: isPaused ? "Resume" : "Pause" })) })] }), _jsxs("div", { className: `relative grid gap-4 sm:gap-5 ${difficulty === "easy"
                        ? "grid-cols-3"
                        : difficulty === "medium"
                            ? "grid-cols-4"
                            : "grid-cols-6"}`, children: [(!gameStarted || isPaused) && !gameOver && (_jsx("button", { "aria-label": !gameStarted ? "Tap to start" : "Tap to resume", className: "absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-white text-base sm:text-lg font-semibold select-none rounded-xl", onClick: () => {
                                if (!gameStarted) {
                                    startGame();
                                }
                                else {
                                    setIsPaused(false);
                                    soundManager.playMusic("background");
                                }
                            }, children: !gameStarted ? "Tap to start" : "Paused — Tap to resume" })), cards.map((card, index) => removedIds.has(card.id) ? (
                        // Render an inert placeholder to preserve grid layout/flow
                        _jsx("div", { "data-testid": "memory-card-placeholder", className: "aspect-square rounded-xl opacity-0 pointer-events-none", "aria-hidden": true, role: "presentation" }, `ph-${card.id}`)) : (_jsxs("div", { "data-testid": "memory-card", onClick: () => handleCardClick(index), role: "button", tabIndex: card.isMatched || hiddenIds.has(card.id) ? -1 : 0, "aria-label": card.isFlipped ? getA11yLabel(card.value) : "Hidden card", onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && handleCardClick(index), className: `
                aspect-square rounded-xl cursor-pointer transition-transform duration-200
                [transform-style:preserve-3d] relative shadow-md hover:shadow-lg
                ${card.isMatched ? "animate-spin transition-opacity duration-500" : ""}
                ${hiddenIds.has(card.id) ? "opacity-0 pointer-events-none" : ""}
              `, style: {
                                transform: card.isFlipped || card.isMatched
                                    ? "rotateY(180deg)"
                                    : "rotateY(0)",
                                // Shorten spin duration
                                animationDuration: card.isMatched ? "500ms" : undefined,
                                transition: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : undefined
                            }, "aria-hidden": card.isMatched || undefined, children: [_jsx("div", { className: "absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold [backface-visibility:hidden]", children: "\u2728" }), _jsx("div", { className: "absolute inset-0 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-4xl [transform:rotateY(180deg)] [backface-visibility:hidden]", children: _jsx("span", { "aria-hidden": true, children: getAssetForValue(card.value) }) })] }, card.id)))] }), _jsxs("div", { className: "mt-6 text-center", children: [_jsxs("p", { className: "text-lg text-gray-700 dark:text-gray-300", children: ["Moves: ", moves, " | Matches: ", score, " / ", pairsInPlay] }), gameOver && (_jsxs("div", { className: "mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg", children: [_jsxs("h3", { className: "text-xl font-bold text-green-800 dark:text-green-200", children: ["Congratulations! You won in ", moves, " moves!"] }), _jsx("button", { onClick: startGame, className: "mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: "Play Again" })] }))] })] }) }));
};
export default MemoryGame;
