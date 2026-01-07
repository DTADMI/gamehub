"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createPipesState, evaluatePipes, setTileRotation, toggleValve } from "@games/shared/pointclick/puzzles/pipes";
import { useState } from "react";
import HomeostasisMeter from "@/components/sysdisc/HomeostasisMeter";
import { t } from "@/lib/i18n";
const BreathPuzzle = ({ onSolved }) => {
    const [state, setState] = useState(() => createPipesState(3, 1, [
        { type: "straight", rotation: 0, source: true },
        { type: "valve", rotation: 0, open: false },
        { type: "straight", rotation: 0, sink: true },
    ]));
    const rotate = (x, y) => {
        const nextRotation = ((state.grid[y * state.width + x].rotation + 90) % 360);
        const next = evaluatePipes(setTileRotation(state, x, y, nextRotation));
        setState(next);
        if (next.solved) {
            onSolved();
        }
    };
    const toggle = (x, y) => {
        const next = evaluatePipes(toggleValve(state, x, y, !state.grid[y * state.width + x].open));
        setState(next);
        if (next.solved) {
            onSolved();
        }
    };
    return (_jsxs("div", { className: "bg-blue-50 p-4 rounded-lg mb-4", children: [_jsx("p", { className: "text-sm mb-2 text-blue-800 font-medium", children: "Oxygen Flow Simulation" }), _jsxs("div", { className: "flex gap-4 justify-center items-center", children: [_jsxs("button", { className: "w-16 h-16 border-2 border-blue-300 rounded bg-white flex items-center justify-center", onClick: () => rotate(0, 0), children: [state.grid[0].rotation * 90, "\u00B0"] }), _jsx("button", { className: `w-16 h-16 border-2 border-blue-300 rounded flex items-center justify-center ${state.grid[1].open ? 'bg-blue-200' : 'bg-white'}`, onClick: () => toggle(1, 0), children: state.grid[1].open ? 'OPEN' : 'CLOSED' }), _jsxs("button", { className: "w-16 h-16 border-2 border-blue-300 rounded bg-white flex items-center justify-center", onClick: () => rotate(2, 0), children: [state.grid[2].rotation * 90, "\u00B0"] })] }), state.solved && _jsx("p", { className: "text-center text-green-600 mt-2 font-bold", children: "Oxygen Flow Restored!" })] }));
};
const scenes = [
    {
        id: "SD_INTRO",
        title: t("sysdisc.intro.title"),
        render: ({ go, setFlag }) => (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.intro.p1") }), _jsx("p", { className: "mb-4 opacity-80", children: t("sysdisc.intro.p2") }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => {
                                setFlag("intro.seen", true);
                                go("B1");
                            }, children: t("sysdisc.intro.cta") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("intro.seen", true);
                                go("B1");
                            }, children: t("sysdisc.intro.skip") })] })] })),
    },
    {
        id: "B1",
        title: t("sysdisc.b1.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const gentle = Boolean(flags["gentle"]);
            const s1 = Boolean(flags["b1.kitchen"]);
            const s2 = Boolean(flags["b1.compost"]);
            const s3 = Boolean(flags["b1.soil"]);
            const s4 = Boolean(flags["b1.herbs"]);
            const canCompost = s1;
            const canSoil = s1 && s2;
            const canHerbs = s1 && s2 && s3;
            const done = s1 && s2 && s3 && s4;
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.b1.prompt") }), gentle && _jsx("p", { className: "text-sm opacity-80 mb-2", children: t("sysdisc.b1.hint") }), _jsxs("div", { role: "group", "aria-label": "Loop steps", className: "flex flex-wrap gap-2", children: [_jsx("button", { className: `min-h-[44px] px-3 py-2 rounded border ${s1 ? "bg-amber-100" : "bg-background"}`, "aria-pressed": s1, onClick: () => setFlag("b1.kitchen", true), children: t("sysdisc.b1.steps.kitchen") }), _jsx("button", { disabled: !canCompost, className: `min-h-[44px] px-3 py-2 rounded border ${s2 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`, "aria-pressed": s2, onClick: () => setFlag("b1.compost", true), children: t("sysdisc.b1.steps.compost") }), _jsx("button", { disabled: !canSoil, className: `min-h-[44px] px-3 py-2 rounded border ${s3 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`, "aria-pressed": s3, onClick: () => setFlag("b1.soil", true), children: t("sysdisc.b1.steps.soil") }), _jsx("button", { disabled: !canHerbs, className: `min-h-[44px] px-3 py-2 rounded border ${s4 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`, "aria-pressed": s4, onClick: () => setFlag("b1.herbs", true), children: t("sysdisc.b1.steps.herbs") })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50", disabled: !done, onClick: () => {
                                setFlag("b1.route", "loop-ok");
                                go("B2");
                            }, children: t("sysdisc.b1.continue") }) })] }));
        },
    },
    {
        id: "B2",
        title: t("sysdisc.b2.title"),
        render: ({ go, setFlag }) => (_jsxs("div", { children: [_jsx("p", { children: t("sysdisc.b2.prompt") }), _jsxs("div", { className: "grid gap-2 sm:grid-cols-2", role: "group", "aria-label": "Route plan", children: [_jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("b2.plan", "bus-first");
                                go("B3");
                            }, children: t("sysdisc.b2.busFirst") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("b2.plan", "bike-first");
                                go("B3");
                            }, children: t("sysdisc.b2.bikeFirst") })] })] })),
    },
    {
        id: "B3",
        title: t("sysdisc.b3.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const hint = Boolean(flags["b3.hints"]);
            const a = Boolean(flags["b3.banana"]);
            const b = Boolean(flags["b3.bottle"]);
            const c = Boolean(flags["b3.paper"]);
            const solved = a && b && c;
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.b3.prompt") }), _jsx("div", { className: "mb-2", children: _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", "aria-pressed": hint, onClick: () => setFlag("b3.hints", !hint), children: hint ? t("sysdisc.b3.hintsOn") : t("sysdisc.b3.hintsOff") }) }), hint && _jsx("p", { className: "text-sm opacity-80", children: t("sysdisc.b3.hintDetail") }), _jsxs("div", { role: "group", "aria-label": "Sort items", className: "flex gap-2 items-center", children: [_jsx("button", { className: `min-h-[44px] px-3 py-2 rounded border ${a ? "bg-amber-100" : "bg-background"}`, "aria-pressed": a, onClick: () => setFlag("b3.banana", !a), children: t("sysdisc.b3.items.banana") }), _jsx("button", { className: `min-h-[44px] px-3 py-2 rounded border ${b ? "bg-amber-100" : "bg-background"}`, "aria-pressed": b, onClick: () => setFlag("b3.bottle", !b), children: t("sysdisc.b3.items.bottle") }), _jsx("button", { className: `min-h-[44px] px-3 py-2 rounded border ${c ? "bg-amber-100" : "bg-background"}`, "aria-pressed": c, onClick: () => setFlag("b3.paper", !c), children: t("sysdisc.b3.items.paper") })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50", disabled: !solved, onClick: () => {
                                setFlag("b3.result", hint ? "sorted" : "sorted-nohints");
                                go("WRAP");
                            }, children: t("sysdisc.b3.reveal") }) })] }));
        },
    },
    {
        id: "WRAP",
        title: t("sysdisc.wrap.title"),
        render: ({ state, setFlag, go }) => {
            const flags = state.ctx.flags;
            if (!flags["ep.badgeApplied"]) {
                setFlag("ep.badgeSystemsScout", true);
                setFlag("ep.badgeApplied", true);
                setFlag("saveVersion", 1);
            }
            return (_jsxs("div", { children: [_jsx("p", { children: t("sysdisc.wrap.done") }), _jsx("div", { className: "my-2", children: _jsx("img", { src: "/assets/sysdisc/badge_systems_scout.svg", alt: "Systems Scout badge", className: "h-12 w-12" }) }), _jsxs("ul", { className: "list-disc ml-6", children: [_jsxs("li", { children: [t("sysdisc.wrap.b1"), ": ", String(flags["b1.route"])] }), _jsxs("li", { children: [t("sysdisc.wrap.b2"), ": ", String(flags["b2.plan"])] }), _jsxs("li", { children: [t("sysdisc.wrap.b3"), ": ", String(flags["b3.result"])] }), _jsxs("li", { children: ["Badge: ", String(flags["ep.badgeSystemsScout"])] })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-secondary text-secondary-foreground", onClick: () => go("SD_OUTRO"), children: "View outro" }) })] }));
        },
    },
    {
        id: "SD_OUTRO",
        title: t("sysdisc.outro.title"),
        render: ({ state, setFlag, go }) => {
            const flags = state.ctx.flags;
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.outro.p1") }), _jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "font-medium", children: [t("sysdisc.outro.recap"), ":"] }), _jsxs("ul", { className: "list-disc ml-6", children: [_jsxs("li", { children: ["B1: ", String(flags["b1.route"])] }), _jsxs("li", { children: ["B2: ", String(flags["b2.plan"])] }), _jsxs("li", { children: ["B3: ", String(flags["b3.result"])] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("outro.seen", true);
                                    go("B1");
                                }, children: t("sysdisc.outro.replay") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("outro.seen", true);
                                    const cur = String(flags["b2.plan"] ?? "bus-first");
                                    setFlag("b2.plan", cur === "bus-first" ? "bike-first" : "bus-first");
                                    go("B2");
                                }, children: t("sysdisc.outro.altPlan") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("outro.seen", true);
                                    setFlag("b3.hints", !flags["b3.hints"]);
                                }, children: t("sysdisc.outro.toggleHints") })] })] }));
        },
    },
    // --- Body Systems (BOD) scaffolds: Breath sub-pack ---
    {
        id: "SD_BOD_BREATH_INTRO",
        title: t("sysdisc.bod.breath.intro.title"),
        render: ({ go, setFlag }) => (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.breath.intro.p1") }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => {
                                setFlag("bod.breath.intro.seen", true);
                                go("BB1");
                            }, children: t("sysdisc.bod.breath.intro.cta") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("bod.breath.intro.seen", true);
                                go("BB1");
                            }, children: t("sysdisc.bod.breath.intro.skip") })] })] })),
    },
    {
        id: "BB1",
        title: t("sysdisc.bod.breath.bb1.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const solved = Boolean(flags["bod.breath.puzzleSolved"]);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.breath.bb1.prompt") }), _jsx(BreathPuzzle, { onSolved: () => setFlag("bod.breath.puzzleSolved", true) }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", role: "group", "aria-label": "Balance nudges", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50", disabled: !solved, onClick: () => go("BB2"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BB2",
        title: t("sysdisc.bod.breath.bb2.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.breath.bb2.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", role: "group", "aria-label": "Balance nudges", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BB3"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BB3",
        title: t("sysdisc.bod.breath.bb3.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.breath.bb3.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", role: "group", "aria-label": "Balance nudges", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BOD_BREATH_WRAP"), children: t("sysdisc.bod.common.reveal") }) })] }));
        },
    },
    {
        id: "BOD_BREATH_WRAP",
        title: t("sysdisc.bod.breath.outro.title"),
        render: ({ state, setFlag, go }) => {
            const flags = state.ctx.flags;
            if (!flags["bod.badges.careAlly"]) {
                setFlag("bod.badges.careAlly", true);
                setFlag("bod.badges.breath", true);
            }
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.breath.outro.p1") }), _jsx("div", { className: "mb-2", children: _jsx(HomeostasisMeter, { value: Number(flags["bod.meter"] ?? 60) }) }), _jsxs("ul", { className: "list-disc ml-6 mb-3", children: [_jsxs("li", { children: ["Care Ally badge: ", String(flags["bod.badges.careAlly"])] }), _jsxs("li", { children: ["Breath badge: ", String(flags["bod.badges.breath"])] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("bod.breath.outro.seen", true);
                                    go("BB1");
                                }, children: t("sysdisc.bod.common.replay") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => go("WRAP"), children: t("sysdisc.bod.common.home") })] })] }));
        },
    },
    // --- Body Systems (BOD) scaffolds: Fuel sub-pack ---
    {
        id: "SD_BOD_FUEL_INTRO",
        title: t("sysdisc.bod.fuel.intro.title"),
        render: ({ go, setFlag }) => (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.fuel.intro.p1") }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => {
                                setFlag("bod.fuel.intro.seen", true);
                                go("BF1");
                            }, children: t("sysdisc.bod.fuel.intro.cta") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("bod.fuel.intro.seen", true);
                                go("BF1");
                            }, children: t("sysdisc.bod.fuel.intro.skip") })] })] })),
    },
    {
        id: "BF1",
        title: t("sysdisc.bod.fuel.bf1.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.fuel.bf1.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BF2"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BF2",
        title: t("sysdisc.bod.fuel.bf2.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.fuel.bf2.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BF3"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BF3",
        title: t("sysdisc.bod.fuel.bf3.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.fuel.bf3.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BOD_FUEL_WRAP"), children: t("sysdisc.bod.common.reveal") }) })] }));
        },
    },
    {
        id: "BOD_FUEL_WRAP",
        title: t("sysdisc.bod.fuel.outro.title"),
        render: ({ state, setFlag, go }) => {
            const flags = state.ctx.flags;
            if (!flags["bod.badges.careAlly"]) {
                setFlag("bod.badges.careAlly", true);
            }
            if (!flags["bod.badges.fuel"]) {
                setFlag("bod.badges.fuel", true);
            }
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.fuel.outro.p1") }), _jsx("div", { className: "mb-2", children: _jsx(HomeostasisMeter, { value: Number(flags["bod.meter"] ?? 60) }) }), _jsxs("ul", { className: "list-disc ml-6 mb-3", children: [_jsxs("li", { children: ["Care Ally badge: ", String(flags["bod.badges.careAlly"])] }), _jsxs("li", { children: ["Fuel badge: ", String(flags["bod.badges.fuel"])] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("bod.fuel.outro.seen", true);
                                    go("BF1");
                                }, children: t("sysdisc.bod.common.replay") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => go("WRAP"), children: t("sysdisc.bod.common.home") })] })] }));
        },
    },
    // --- Move sub-pack ---
    {
        id: "SD_BOD_MOVE_INTRO",
        title: t("sysdisc.bod.move.intro.title"),
        render: ({ go, setFlag }) => (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.move.intro.p1") }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => {
                                setFlag("bod.move.intro.seen", true);
                                go("BM1");
                            }, children: t("sysdisc.bod.move.intro.cta") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("bod.move.intro.seen", true);
                                go("BM1");
                            }, children: t("sysdisc.bod.move.intro.skip") })] })] })),
    },
    {
        id: "BM1",
        title: t("sysdisc.bod.move.bm1.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.move.bm1.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BM2"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BM2",
        title: t("sysdisc.bod.move.bm2.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.move.bm2.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BM3"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BM3",
        title: t("sysdisc.bod.move.bm3.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.move.bm3.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BOD_MOVE_WRAP"), children: t("sysdisc.bod.common.reveal") }) })] }));
        },
    },
    {
        id: "BOD_MOVE_WRAP",
        title: t("sysdisc.bod.move.outro.title"),
        render: ({ state, setFlag, go }) => {
            const flags = state.ctx.flags;
            if (!flags["bod.badges.careAlly"]) {
                setFlag("bod.badges.careAlly", true);
            }
            if (!flags["bod.badges.move"]) {
                setFlag("bod.badges.move", true);
            }
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.move.outro.p1") }), _jsx("div", { className: "mb-2", children: _jsx(HomeostasisMeter, { value: Number(flags["bod.meter"] ?? 60) }) }), _jsxs("ul", { className: "list-disc ml-6 mb-3", children: [_jsxs("li", { children: ["Care Ally badge: ", String(flags["bod.badges.careAlly"])] }), _jsxs("li", { children: ["Move badge: ", String(flags["bod.badges.move"])] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("bod.move.outro.seen", true);
                                    go("BM1");
                                }, children: t("sysdisc.bod.common.replay") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => go("WRAP"), children: t("sysdisc.bod.common.home") })] })] }));
        },
    },
    // --- Signal sub-pack ---
    {
        id: "SD_BOD_SIGNAL_INTRO",
        title: t("sysdisc.bod.signal.intro.title"),
        render: ({ go, setFlag }) => (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.signal.intro.p1") }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => {
                                setFlag("bod.signal.intro.seen", true);
                                go("BSD1");
                            }, children: t("sysdisc.bod.signal.intro.cta") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("bod.signal.intro.seen", true);
                                go("BSD1");
                            }, children: t("sysdisc.bod.signal.intro.skip") })] })] })),
    },
    {
        id: "BSD1",
        title: t("sysdisc.bod.signal.bsd1.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.signal.bsd1.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BSD2"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BSD2",
        title: t("sysdisc.bod.signal.bsd2.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.signal.bsd2.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BSD3"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BSD3",
        title: t("sysdisc.bod.signal.bsd3.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.signal.bsd3.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BOD_SIGNAL_WRAP"), children: t("sysdisc.bod.common.reveal") }) })] }));
        },
    },
    {
        id: "BOD_SIGNAL_WRAP",
        title: t("sysdisc.bod.signal.outro.title"),
        render: ({ state, setFlag, go }) => {
            const flags = state.ctx.flags;
            if (!flags["bod.badges.careAlly"]) {
                setFlag("bod.badges.careAlly", true);
            }
            if (!flags["bod.badges.signal"]) {
                setFlag("bod.badges.signal", true);
            }
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.signal.outro.p1") }), _jsx("div", { className: "mb-2", children: _jsx(HomeostasisMeter, { value: Number(flags["bod.meter"] ?? 60) }) }), _jsxs("ul", { className: "list-disc ml-6 mb-3", children: [_jsxs("li", { children: ["Care Ally badge: ", String(flags["bod.badges.careAlly"])] }), _jsxs("li", { children: ["Signal & Defend badge: ", String(flags["bod.badges.signal"])] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("bod.signal.outro.seen", true);
                                    go("BSD1");
                                }, children: t("sysdisc.bod.common.replay") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => go("WRAP"), children: t("sysdisc.bod.common.home") })] })] }));
        },
    },
    // --- Grow sub-pack ---
    {
        id: "SD_BOD_GROW_INTRO",
        title: t("sysdisc.bod.grow.intro.title"),
        render: ({ go, setFlag }) => (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.grow.intro.p1") }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => {
                                setFlag("bod.grow.intro.seen", true);
                                go("BG1");
                            }, children: t("sysdisc.bod.grow.intro.cta") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                setFlag("bod.grow.intro.seen", true);
                                go("BG1");
                            }, children: t("sysdisc.bod.grow.intro.skip") })] })] })),
    },
    {
        id: "BG1",
        title: t("sysdisc.bod.grow.bg1.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.grow.bg1.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BG2"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BG2",
        title: t("sysdisc.bod.grow.bg2.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.grow.bg2.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BG3"), children: t("sysdisc.bod.common.continue") }) })] }));
        },
    },
    {
        id: "BG3",
        title: t("sysdisc.bod.grow.bg3.title"),
        render: ({ go, setFlag, state }) => {
            const flags = state.ctx.flags;
            const meter = Number(flags["bod.meter"] ?? 60);
            const clamp = (v) => Math.max(0, Math.min(100, v));
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.grow.bg3.prompt") }), _jsx(HomeostasisMeter, { value: meter }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter + 2)), children: "Nudge +" }), _jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", onClick: () => setFlag("bod.meter", clamp(meter - 2)), children: "Nudge -" })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { className: "min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground", onClick: () => go("BOD_GROW_WRAP"), children: t("sysdisc.bod.common.reveal") }) })] }));
        },
    },
    {
        id: "BOD_GROW_WRAP",
        title: t("sysdisc.bod.grow.outro.title"),
        render: ({ state, setFlag, go }) => {
            const flags = state.ctx.flags;
            if (!flags["bod.badges.careAlly"]) {
                setFlag("bod.badges.careAlly", true);
            }
            if (!flags["bod.badges.grow"]) {
                setFlag("bod.badges.grow", true);
            }
            return (_jsxs("div", { children: [_jsx("p", { className: "mb-2", children: t("sysdisc.bod.grow.outro.p1") }), _jsx("div", { className: "mb-2", children: _jsx(HomeostasisMeter, { value: Number(flags["bod.meter"] ?? 60) }) }), _jsxs("ul", { className: "list-disc ml-6 mb-3", children: [_jsxs("li", { children: ["Care Ally badge: ", String(flags["bod.badges.careAlly"])] }), _jsxs("li", { children: ["Grow badge: ", String(flags["bod.badges.grow"])] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => {
                                    setFlag("bod.grow.outro.seen", true);
                                    go("BG1");
                                }, children: t("sysdisc.bod.common.replay") }), _jsx("button", { className: "min-h-[44px] px-3 py-2 rounded border", onClick: () => go("WRAP"), children: t("sysdisc.bod.common.home") })] })] }));
        },
    },
];
export function SystemsDiscoveryGame() {
    // Extend initial save model with BOD defaults; existing saves remain compatible
    // Support deep-links from catalog: /games/systems-discovery?pack=<sub>
    let initialScene = "SD_INTRO";
    if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const pack = params.get("pack");
        switch (pack) {
            case "breath":
                initialScene = "SD_BOD_BREATH_INTRO";
                break;
            case "fuel":
                initialScene = "SD_BOD_FUEL_INTRO";
                break;
            case "move":
                initialScene = "SD_BOD_MOVE_INTRO";
                break;
            case "signal":
                initialScene = "SD_BOD_SIGNAL_INTRO";
                break;
            case "grow":
                initialScene = "SD_BOD_GROW_INTRO";
                break;
        }
    }
    const initial = {
        scene: initialScene,
        flags: {
            "bod.meter": 60,
            "bod.toggles.deeper": false,
        },
        inventory: [],
    };
    return (_jsx(SceneController, { scenes: scenes, initial: initial, saveKey: "sysdisc:save:v1" }));
}
export default SystemsDiscoveryGame;
