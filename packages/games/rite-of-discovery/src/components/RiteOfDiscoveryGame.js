"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DialogueBox, GameContainer, InventoryBar } from "@games/shared";
import { loadWithMigrations, SAVE_KEYS, versionedSave } from "@games/shared/pointclick/core/Persistence";
import { detectLang, effects, ensureCtx, nextScene } from "@games/shared/pointclick/engine";
import { clearKeypad, createKeypadState, pressKey, submitKeypad } from "@games/shared/pointclick/puzzles/keypad";
import { createWiresState, setWiresConnection } from "@games/shared/pointclick/puzzles/wires";
import { useEffect, useMemo, useState } from "react";
import { t } from "@/lib/i18n";
const SAVE_KEY = SAVE_KEYS.rod;
export const RiteOfDiscoveryGame = () => {
    const lang = useMemo(() => detectLang(), []);
    const [keypad, setKeypad] = useState(() => createKeypadState());
    const [wires, setWires] = useState(() => createWiresState(["L1", "L2"], ["R1", "R2"], {
        red: [{ from: "L1", to: "R2" }],
        blue: [{ from: "L2", to: "R1" }]
    }));
    const scenes = useMemo(() => ({
        INTRO: {
            id: "INTRO",
            title: { en: t("rod.intro.title"), fr: t("rod.intro.title") },
            body: {
                en: t("rod.intro.p1"),
                fr: t("rod.intro.p1"),
            },
            choices: [
                { id: "start", text: { en: t("rod.intro.cta"), fr: t("rod.intro.cta") }, target: "HALLWAY" },
            ],
        },
        HALLWAY: {
            id: "HALLWAY",
            title: { en: t("rod.hallway.title"), fr: t("rod.hallway.title") },
            body: {
                en: t("rod.hallway.body"),
                fr: t("rod.hallway.body"),
            },
            choices: [
                {
                    id: "back",
                    text: { en: t("rod.hallway.goBack"), fr: t("rod.hallway.goBack") },
                    target: "INTRO"
                }
            ],
        },
        KEYPAD_ZOOM: {
            id: "KEYPAD_ZOOM",
            title: { en: t("rod.keypad.title"), fr: t("rod.keypad.title") },
            body: {
                en: t("rod.keypad.body"),
                fr: t("rod.keypad.body"),
            },
            choices: [
                { id: "exit", text: { en: t("rod.keypad.back"), fr: t("rod.keypad.back") }, target: "HALLWAY" }
            ]
        },
        WIRES_PANEL: {
            id: "WIRES_PANEL",
            title: { en: t("rod.wires.title"), fr: t("rod.wires.title") },
            body: {
                en: t("rod.wires.body"),
                fr: t("rod.wires.body"),
            },
            choices: [
                { id: "exit", text: { en: t("rod.wires.back"), fr: t("rod.wires.back") }, target: "HALLWAY" }
            ]
        },
        INNER_CHAMBER: {
            id: "INNER_CHAMBER",
            title: { en: t("rod.chamber.title"), fr: t("rod.chamber.title") },
            body: {
                en: t("rod.chamber.body"),
                fr: t("rod.chamber.body"),
            },
            choices: [
                {
                    id: "restart",
                    text: { en: t("rod.chamber.restart"), fr: t("rod.chamber.restart") },
                    target: "INTRO",
                    effect: () => ({})
                }
            ]
        }
    }), []);
    const [sceneId, setSceneId] = useState(() => loadWithMigrations(SAVE_KEY, 1)?.sceneId || "INTRO");
    const [ctx, setCtx] = useState(() => ensureCtx(loadWithMigrations(SAVE_KEY, 1)?.ctx || {}));
    useEffect(() => {
        versionedSave(SAVE_KEY, 1, { sceneId, ctx });
    }, [sceneId, ctx]);
    const scene = scenes[sceneId];
    return (_jsx(GameContainer, { title: scene?.title[lang] || "Rite of Discovery", description: scene?.body?.[lang], children: _jsxs("div", { className: "p-4 max-w-2xl mx-auto", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: scene?.title[lang] }), _jsx("p", { className: "mb-6", children: scene?.body?.[lang] ?? "" }), sceneId === "HALLWAY" && (_jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsx("button", { className: "p-8 border rounded-lg hover:bg-muted text-center", onClick: () => setSceneId("KEYPAD_ZOOM"), children: lang === "fr" ? "Examiner le pavé" : "Examine Keypad" }), _jsx("button", { className: "p-8 border rounded-lg hover:bg-muted text-center", onClick: () => setSceneId("WIRES_PANEL"), children: lang === "fr" ? "Ouvrir le panneau" : "Open Panel" })] })), sceneId === "KEYPAD_ZOOM" && (_jsxs("div", { className: "bg-muted p-6 rounded-lg mb-6", children: [_jsxs("div", { className: "grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-4", children: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (_jsx("button", { className: "min-h-11 h-12 w-12 border rounded bg-background hover:bg-accent", onClick: () => setKeypad(s => pressKey(s, n.toString(), { code: "1234" })), children: n }, n))), _jsx("button", { className: "col-span-2 h-12 border rounded bg-background hover:bg-accent", onClick: () => setKeypad(s => clearKeypad(s)), children: t("rod.keypad.clear") }), _jsx("button", { className: "h-12 border rounded bg-primary text-primary-foreground", onClick: () => {
                                        const next = submitKeypad(keypad, { code: "1234" });
                                        setKeypad(next);
                                        if (next.solved) {
                                            setCtx(c => effects.setFlag("door.keypadSolved", true)(ensureCtx(c)));
                                        }
                                    }, children: t("rod.keypad.submit") })] }), _jsxs("div", { className: "text-center font-mono text-xl tracking-widest h-8", children: [t("rod.keypad.input"), " ", keypad.input.padEnd(4, '_')] }), ctx.flags["door.keypadSolved"] && (_jsx("p", { className: "text-green-500 text-center mt-2 font-bold", children: t("rod.keypad.unlocked") }))] })), sceneId === "WIRES_PANEL" && (_jsxs("div", { className: "bg-muted p-6 rounded-lg mb-6", children: [_jsx("div", { className: "flex flex-col gap-4", children: ["red", "blue"].map(color => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "w-16 capitalize", children: [color, ":"] }), _jsxs("select", { className: "p-1 rounded border min-h-11", onChange: (e) => {
                                            const [l, r] = e.target.value.split("-");
                                            setWires(s => {
                                                const next = setWiresConnection(s, l, r, color);
                                                if (next.solved) {
                                                    setCtx(c => effects.setFlag("door.wiresSolved", true)(ensureCtx(c)));
                                                }
                                                return next;
                                            });
                                        }, children: [_jsx("option", { value: "", children: lang === 'fr' ? 'Sélectionner...' : 'Select connection...' }), _jsx("option", { value: "L1-R1", children: "L1 to R1" }), _jsx("option", { value: "L1-R2", children: "L1 to R2" }), _jsx("option", { value: "L2-R1", children: "L2 to R1" }), _jsx("option", { value: "L2-R2", children: "L2 to R2" })] })] }, color))) }), ctx.flags["door.wiresSolved"] && (_jsx("p", { className: "text-green-500 text-center mt-4 font-bold", children: t("rod.wires.solved") }))] })), sceneId === "HALLWAY" && ctx.flags["door.keypadSolved"] && ctx.flags["door.wiresSolved"] && (_jsx("button", { className: "w-full p-4 bg-primary text-primary-foreground rounded-lg mb-6 animate-pulse", onClick: () => setSceneId("INNER_CHAMBER"), children: lang === "fr" ? "Entrer dans la chambre" : "Enter Chamber" })), _jsx(DialogueBox, { scene: scene, lang: lang, onChoose: (choiceId) => {
                        const res = nextScene(sceneId, scenes, choiceId, ctx);
                        setSceneId(res.sceneId);
                        setCtx(res.ctx);
                    } }), _jsx(InventoryBar, { items: ctx.inventory, onUse: (item) => console.log("Using", item) })] }) }));
};
export default RiteOfDiscoveryGame;
