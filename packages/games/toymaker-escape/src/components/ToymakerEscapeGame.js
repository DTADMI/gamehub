"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DialogueBox, GameContainer, InventoryBar, versionedLoad, versionedSave } from "@games/shared";
import { detectLang, effects, ensureCtx, nextScene, } from "@games/shared/pointclick/engine";
import { createGearsState, evaluateGears, setGearsTeeth as setGearTeeth, } from "@games/shared/pointclick/puzzles/gears";
import { clearKeypad, createKeypadState, pressKey, submitKeypad, } from "@games/shared/pointclick/puzzles/keypad";
import { createPipesState, evaluatePipes, setTileRotation, toggleValve } from "@games/shared/pointclick/puzzles/pipes";
import { createSequenceState, pressSeq as pressSequenceKey } from "@games/shared/pointclick/puzzles/sequence";
import { createWiresState, hasWiresCrossing, setWiresConnection } from "@games/shared/pointclick/puzzles/wires";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { E1CabinetCanvas } from "./E1CabinetCanvas";
const SAVE_KEY = "tme:save:v1";
export const ToymakerEscapeGame = () => {
    const lang = useMemo(() => detectLang(), []);
    const scenes = useMemo(() => ({
        INTRO: {
            id: "INTRO",
            title: {
                en: "Toymaker Escape — Intro",
                fr: "Toymaker Escape — Intro",
            },
            body: {
                en: "A late evening at the atelier. Something is amiss...",
                fr: "Un soir tard dans l'atelier. Quelque chose cloche...",
            },
            choices: [
                { id: "begin", text: { en: "Begin", fr: "Commencer" }, target: "E1_GEAR" },
            ],
        },
        E1_GEAR: {
            id: "E1_GEAR",
            title: { en: "Episode 1 — Gears", fr: "Épisode 1 — Engrenages" },
            body: {
                en: "Align the gears to open the panel (MVP placeholder puzzle).",
                fr: "Alignez les engrenages pour ouvrir le panneau (puzzle MVP).",
            },
            choices: [
                {
                    id: "solve",
                    text: { en: "Turn gears", fr: "Tourner les engrenages" },
                    target: "E1_WRAP",
                    effect: (ctx) => ({ ...ctx, gearSolved: true }),
                },
            ],
        },
        E1_WRAP: {
            id: "E1_WRAP",
            title: { en: "Wrap — Episode 1", fr: "Conclusion — Épisode 1" },
            body: {
                en: "You found the hidden compartment. Medal earned: Gear Whisperer.",
                fr: "Vous avez trouvé le compartiment secret. Médaille: Chuchoteur d'engrenages.",
            },
            choices: [
                { id: "restart", text: { en: "Restart", fr: "Recommencer" }, target: "INTRO", effect: () => ({}) },
            ],
        },
    }), []);
    // Load v1 save (frontend-only). Fallback to minimal defaults.
    const initialSave = (() => {
        try {
            const payload = versionedLoad(SAVE_KEY);
            return payload?.data ?? null;
        }
        catch {
            return null;
        }
    })();
    const [sceneId, setSceneId] = useState(() => initialSave?.sceneId || "INTRO");
    const [ctx, setCtx] = useState(() => ensureCtx({
        inventory: initialSave?.inventory ?? [],
        flags: initialSave?.flags ?? {},
    }));
    // Wires mini state (simple 2×2 example for stub UI)
    const [wires, setWires] = useState(() => createWiresState(["A1", "A2"], ["B1", "B2"], {
        red: [{ from: "A1", to: "B2" }],
        blue: [{ from: "A2", to: "B1" }],
    }));
    // Pipes mini state — small 3×1 with a valve in middle
    const initialTiles = [
        { type: "straight", rotation: 0, source: true },
        { type: "valve", rotation: 0, open: false },
        { type: "straight", rotation: 0, sink: true },
    ];
    const [pipes, setPipes] = useState(() => createPipesState(3, 1, initialTiles));
    const [keypad, setKeypad] = useState(() => createKeypadState());
    // Simple gears mini: input → idler → output, with a target ratio of 1/3
    const [gears, setGears] = useState(() => createGearsState([
        { id: "in", teeth: 20 },
        { id: "idle", teeth: 30 },
        { id: "out", teeth: 60 },
    ], [
        { a: "in", b: "idle" },
        { a: "idle", b: "out" },
    ], "in", "out", 1 / 3));
    const [sorter, setSorter] = useState(() => createSequenceState(["red", "blue", "green"], { lives: 5 }));
    // Persist with a small idempotency guard to reduce redundant writes
    const lastSavedRef = useRef(null);
    useEffect(() => {
        const data = {
            sceneId,
            flags: ctx.flags || {},
            inventory: ctx.inventory || [],
        };
        const payload = JSON.stringify({ v: 1, data });
        if (lastSavedRef.current !== payload) {
            versionedSave(SAVE_KEY, 1, data);
            lastSavedRef.current = payload;
        }
    }, [sceneId, ctx]);
    // Auto-award a simple medal for E1 once a gate is solved and the latch is revealed.
    useEffect(() => {
        const flags = ctx.flags || {};
        const gateSolved = !!(flags["gears.solved"] || flags["wires.solved"] || flags["pipes.solved"]);
        const latch = !!flags["latch.revealed"];
        const existing = flags?.medals?.e1;
        if (!gateSolved || !latch || existing) {
            return;
        }
        const hintsUsed = [flags?.["seen.posterOrder"], flags?.["seen.ratioPlate"]].filter(Boolean).length;
        const level = hintsUsed === 0 ? "gold" : hintsUsed === 1 ? "silver" : "bronze";
        setCtx((c) => effects.setFlag(`medals.e1`, level)(ensureCtx(c)));
    }, [ctx]);
    const scene = scenes[sceneId];
    return (_jsx(GameContainer, { title: scene?.title[lang] || "Toymaker Escape", description: scene?.body?.[lang], lockTouch: false, showParticleControls: false, children: _jsxs("div", { role: "application", "aria-label": "Toymaker Escape", className: "p-4", children: [_jsx("h2", { className: "text-2xl font-bold mb-2", "aria-live": "polite", children: scene?.title?.[lang] ?? t('tme.e1.title') }), scene?.body ? (_jsx("p", { className: "mb-4 text-muted-foreground", children: scene.body[lang] })) : (_jsx("p", { className: "mb-4 text-muted-foreground", children: t('tme.e1.body') })), sceneId === "E1_GEAR" && (_jsxs("div", { className: "mb-4 rounded-md border p-3", children: [_jsx("p", { className: "mb-2 text-sm", children: t('tme.e1.keypad.hint') }), _jsxs("div", { className: "grid grid-cols-3 gap-2 max-w-xs", children: [["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => (_jsx("button", { className: "min-h-11 px-4 py-2 rounded bg-muted hover:bg-muted/80", onClick: () => setKeypad((s) => pressKey(s, d, { code: "2413" })), children: d }, d))), _jsx("button", { className: "col-span-2 min-h-11 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700", onClick: () => setKeypad((s) => clearKeypad(s)), children: t('tme.e1.keypad.clear') }), _jsx("button", { className: "min-h-11 px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => {
                                        setKeypad((s) => {
                                            const next = submitKeypad(s, { code: "2413" });
                                            if (next.solved) {
                                                const updated = effects.addItem("gear-key")(ctx);
                                                setCtx(effects.setFlag("keypad.solved", true)(ensureCtx(updated)));
                                            }
                                            return next;
                                        });
                                    }, children: t('tme.e1.keypad.submit') })] }), _jsxs("div", { className: "mt-2 text-sm", children: [t('tme.e1.keypad.input'), " ", _jsx("b", { children: keypad.input }), " ", keypad.solved &&
                                    _jsx("span", { className: "text-green-600", children: t('tme.e1.keypad.unlocked') })] }), _jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "mb-2 text-sm", children: t('tme.e1.gears.instruction') }), _jsxs("div", { className: "flex flex-col gap-2 max-w-md", children: [["in", "idle", "out"].map((id) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-16 text-sm uppercase text-muted-foreground", children: id }), _jsx("button", { className: "px-3 py-2 rounded bg-gray-200 dark:bg-gray-700", "aria-label": `- teeth ${id}`, onClick: () => setGears((s) => setGearTeeth(s, id, Math.max(10, (s.gears.find((g) => g.id === id)?.teeth || 10) - 10))), children: "\u221210" }), _jsx("span", { className: "min-w-10 text-center", children: gears.gears.find((g) => g.id === id)?.teeth }), _jsx("button", { className: "px-3 py-2 rounded bg-gray-200 dark:bg-gray-700", "aria-label": `+ teeth ${id}`, onClick: () => setGears((s) => setGearTeeth(s, id, Math.min(120, (s.gears.find((g) => g.id === id)?.teeth || 10) + 10))), children: "+10" })] }, id))), _jsxs("div", { className: "text-sm", children: [lang === "fr" ? "Résultat:" : "Result:", " ", _jsx("b", { children: evaluateGears(gears).solved ? (lang === "fr" ? "Correct" : "Correct") : (lang === "fr" ? "Incorrect" : "Incorrect") })] }), evaluateGears(gears).solved && (_jsx("button", { className: "self-start mt-1 px-4 py-2 rounded bg-emerald-600 text-white", onClick: () => {
                                                // Mark mini solved and allow wrap progression
                                                setCtx((c) => effects.setFlag("gears.solved", true)(ensureCtx(c)));
                                            }, children: lang === "fr" ? "Valider l'engrenage" : "Confirm gears" }))] })] })] })), sceneId === "E1_GEAR" && (_jsxs("div", { className: "mb-4 rounded-md border p-3", children: [_jsx("h3", { className: "font-semibold mb-2", children: t('tme.e1.panel.title') }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [_jsx("button", { className: "px-3 py-2 rounded bg-muted", onClick: () => setCtx(c => effects.setFlag("seen.posterOrder", true)(ensureCtx(c))), children: lang === 'fr' ? 'Regarder l’affiche (ordre des jouets)' : 'Examine poster (toys order)' }), _jsx("button", { className: "px-3 py-2 rounded bg-muted", onClick: () => setCtx(c => effects.setFlag("seen.ratioPlate", true)(ensureCtx(c))), children: lang === 'fr' ? 'Observer la plaque 3:1' : 'Inspect 3:1 plate' })] }), _jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-sm mb-2", children: t('tme.e1.panel.wiresHint') }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("select", { "aria-label": "Left terminal", onChange: (e) => (e.currentTarget.dataset.v = e.target.value), "data-v": "A1", "data-testid": "wires-left", children: wires.terminalsLeft.map(id => _jsx("option", { value: id, children: id }, id)) }), _jsx("span", { children: "\u2192" }), _jsx("select", { "aria-label": "Right terminal", onChange: (e) => (e.currentTarget.dataset.v = e.target.value), "data-v": "B1", "data-testid": "wires-right", children: wires.terminalsRight.map(id => _jsx("option", { value: id, children: id }, id)) }), _jsx("select", { "aria-label": "Color", defaultValue: "red", "data-testid": "wires-color", children: Object.keys(wires.goal).map(c => _jsx("option", { value: c, children: c }, c)) }), _jsx("button", { className: "px-3 py-2 rounded bg-muted", onClick: (e) => {
                                                const leftSel = e.currentTarget.parentElement?.querySelector('[data-testid="wires-left"]');
                                                const rightSel = e.currentTarget.parentElement?.querySelector('[data-testid="wires-right"]');
                                                const colorSel = e.currentTarget.parentElement?.querySelector('[data-testid="wires-color"]');
                                                const next = setWiresConnection(wires, (leftSel?.value) || 'A1', (rightSel?.value) || 'B1', (colorSel?.value) || 'red');
                                                setWires(next);
                                                if (next.solved) {
                                                    setCtx(c => effects.setFlag("wires.solved", true)(ensureCtx(c)));
                                                }
                                            }, children: lang === 'fr' ? 'Connecter' : 'Connect' })] }), hasWiresCrossing(wires) && (_jsx("div", { className: "text-amber-600 text-sm", role: "status", children: t('tme.e1.panel.wiresAvoid') })), wires.solved && _jsx("div", { className: "text-emerald-600 text-sm", role: "status", children: t('tme.e1.panel.wiresSolved') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm mb-2", children: t('tme.e1.panel.pipesHint') }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("button", { className: "px-3 py-2 rounded bg-muted", onClick: () => {
                                                setPipes(s => {
                                                    const nextRotation = (((s.grid[0]?.rotation || 0) + 90) % 360);
                                                    return evaluatePipes(setTileRotation(s, 0, 0, nextRotation));
                                                });
                                            }, children: t('tme.e1.panel.rotate00') }), _jsx("button", { className: "px-3 py-2 rounded bg-muted", onClick: () => {
                                                setPipes(s => {
                                                    const nextRotation = (((s.grid[2]?.rotation || 0) + 90) % 360);
                                                    return evaluatePipes(setTileRotation(s, 2, 0, nextRotation));
                                                });
                                            }, children: t('tme.e1.panel.rotate20') }), _jsx("button", { className: "px-3 py-2 rounded bg-muted", onClick: () => setPipes(s => evaluatePipes(toggleValve(s, 1, 0, true))), children: t('tme.e1.panel.openValve') })] }), _jsx("div", { className: "text-sm", role: "status", children: pipes.solved ? t('tme.e1.panel.pipesSolved') : t('tme.e1.panel.pipesNotSolved') }), pipes.errors && pipes.errors.length > 0 && (_jsx("ul", { className: "text-amber-600 text-sm mt-1 list-disc pl-5", children: pipes.errors.map((e, i) => _jsx("li", { children: e }, i)) })), pipes.solved && (_jsx("button", { className: "mt-2 px-3 py-2 rounded bg-emerald-600 text-white", onClick: () => setCtx(c => effects.setFlag("pipes.solved", true)(ensureCtx(c))), children: lang === 'fr' ? 'Valider les tuyaux' : 'Confirm pipes' }))] }), _jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "text-sm mb-2", children: t('tme.playroom.colors.hint') }), _jsx("div", { className: "flex gap-2", children: ["red", "blue", "green"].map(color => (_jsx("button", { className: "w-16 h-16 rounded border flex items-center justify-center capitalize", style: { backgroundColor: color, color: color === 'green' ? 'black' : 'white' }, onClick: () => {
                                            const next = pressSequenceKey(sorter, color);
                                            setSorter(next);
                                            if (next.solved) {
                                                setCtx(c => effects.setFlag("sorter.solved", true)(ensureCtx(c)));
                                            }
                                        }, children: color }, color))) }), _jsxs("div", { className: "mt-2 text-sm", children: ["Progress: ", sorter.input.length, " / ", sorter.goal.length, ctx.flags["sorter.solved"] && _jsx("span", { className: "text-green-500 ml-2", children: "Solved!" })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "text-sm mb-2", children: t('tme.e1.latch.hint') }), _jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [_jsx(E1CabinetCanvas, { onLatchReveal: () => setCtx(c => effects.setFlag("latch.revealed", true)(ensureCtx(c))) }), _jsx("div", { className: "text-sm text-muted-foreground", children: lang === 'fr' ? 'Astuce: appui long puis glisser sur la rayure.' : 'Tip: long‑press then drag over the scuff.' })] }), _jsx(ScuffLatch, { onRevealed: () => setCtx(c => effects.setFlag("latch.revealed", true)(ensureCtx(c))), onSeen: () => setCtx(c => effects.setFlag("seen.scuff", true)(ensureCtx(c))) }), (ctx.flags?.["latch.revealed"]) && (_jsx("div", { className: "mt-2 text-emerald-600", role: "status", children: t('tme.e1.latch.revealed') })), (ctx.flags?.medals?.e1) && (_jsx("div", { className: "mt-1 text-sm", role: "status", "data-testid": "medal-line", children: `${t('tme.e1.medal.label')} ${t('tme.e1.medal.' + ctx.flags.medals.e1)}` }))] })] })), _jsx(DialogueBox, { scene: scene, lang: lang, onChoose: (choiceId) => {
                        const res = nextScene(sceneId, scenes, choiceId, ctx);
                        setSceneId(res.sceneId);
                        setCtx(res.ctx);
                        if (res.sceneId === "E1_WRAP") {
                            // award a simple medal flag when reaching wrap (placeholder)
                            setCtx((c) => effects.setFlag("medal:gear", true)(ensureCtx(c)));
                        }
                    } }), _jsx(InventoryBar, { items: ctx.inventory, onUse: () => {
                    } })] }) }));
};
export default ToymakerEscapeGame;
// --- Internal helper: scuff latch interaction (long-press then drag) ---
function ScuffLatch({ onRevealed, onSeen }) {
    const [longPressed, setLongPressed] = React.useState(false);
    const timeoutRef = React.useRef(null);
    const onPointerDown = () => {
        onSeen();
        setLongPressed(false);
        timeoutRef.current = window.setTimeout(() => {
            setLongPressed(true);
        }, 800); // match long-press duration from InputManager default
    };
    const onPointerUp = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = null;
        setLongPressed(false);
    };
    const onPointerMove = () => {
        // Consider this a drag following a successful long-press
        if (longPressed) {
            onRevealed();
        }
    };
    return (_jsx("div", { role: "button", "aria-label": "Scuffed area", tabIndex: 0, onPointerDown: onPointerDown, onPointerUp: onPointerUp, onPointerMove: onPointerMove, onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onRevealed();
            }
        }, className: "w-24 h-10 rounded border border-dashed border-muted-foreground/60 bg-muted/50 select-none flex items-center justify-center", "data-testid": "scuff-area", children: _jsx("span", { className: "text-xs text-muted-foreground", children: "// scuff" }) }));
}
