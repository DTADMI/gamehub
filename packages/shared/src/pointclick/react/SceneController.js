"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { ensureCtx } from "../engine";
function reducer(state, action) {
    switch (action.type) {
        case "GO":
            return { ...state, sceneId: action.next };
        case "SET_FLAG":
            return {
                ...state,
                ctx: { ...state.ctx, flags: { ...state.ctx.flags, [action.key]: action.value } }
            };
        case "ADD_ITEM": {
            if (state.ctx.inventory.includes(action.id)) {
                return state;
            }
            return {
                ...state,
                ctx: { ...state.ctx, inventory: [...state.ctx.inventory, action.id] }
            };
        }
        case "REMOVE_ITEM": {
            return {
                ...state,
                ctx: {
                    ...state.ctx,
                    inventory: state.ctx.inventory.filter(i => i !== action.id)
                }
            };
        }
        case "LOAD":
            return action.payload;
        default:
            return state;
    }
}
export function useSaveService(key, initial) {
    const [state, dispatch] = useReducer(reducer, initial);
    const saveRef = useRef(key);
    useEffect(() => {
        try {
            const raw = localStorage.getItem(saveRef.current);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (!parsed.v) {
                    parsed.v = 1;
                }
                dispatch({ type: "LOAD", payload: parsed });
            }
        }
        catch {
            // Failed to load
        }
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem(saveRef.current, JSON.stringify(state));
        }
        catch {
            // Failed to save
        }
    }, [state]);
    return { state, dispatch };
}
export function SceneController({ scenes, initial, saveKey, lang = "en" }) {
    const map = useMemo(() => new Map(scenes.map(s => [s.id, s])), [scenes]);
    const initialState = {
        sceneId: initial.scene,
        ctx: ensureCtx({
            flags: initial.flags,
            inventory: initial.inventory,
        }),
        v: 1
    };
    const { state, dispatch } = useSaveService(saveKey, initialState);
    const go = useCallback((next) => dispatch({ type: "GO", next }), [dispatch]);
    const setFlag = useCallback((k, v) => dispatch({ type: "SET_FLAG", key: k, value: v }), [dispatch]);
    const addItem = useCallback((id) => dispatch({ type: "ADD_ITEM", id }), [dispatch]);
    const removeItem = useCallback((id) => dispatch({ type: "REMOVE_ITEM", id }), [dispatch]);
    const scene = map.get(state.sceneId);
    if (!scene) {
        return _jsxs("div", { className: "p-8", children: ["Unknown scene: ", state.sceneId] });
    }
    const gentle = Boolean(state.ctx.flags["gentle"]);
    const volume = Number(state.ctx.flags["volume"] ?? 100);
    const title = typeof scene.title === "string" ? scene.title : scene.title[lang];
    return (_jsxs("div", { className: "mx-auto max-w-3xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-3", children: [_jsx("h1", { className: "text-2xl font-semibold", children: title }), _jsxs("label", { className: "inline-flex items-center gap-2 text-sm cursor-pointer select-none", children: [_jsx("input", { "aria-label": "Gentle Mode", type: "checkbox", checked: gentle, onChange: (e) => setFlag("gentle", e.target.checked), className: "h-5 w-5" }), _jsx("span", { children: "Gentle Mode" })] })] }), _jsxs("div", { className: "flex items-center justify-between gap-4 mb-3", children: [_jsx("div", { className: "text-sm opacity-80" }), _jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [_jsx("span", { children: "Volume" }), _jsxs("select", { "aria-label": "Volume", className: "border rounded px-2 py-1", value: volume, onChange: (e) => setFlag("volume", Number(e.target.value)), children: [_jsx("option", { value: 0, children: "Mute" }), _jsx("option", { value: 50, children: "50%" }), _jsx("option", { value: 100, children: "100%" })] })] })] }), _jsxs("div", { className: "mb-3", "aria-label": "Inventory", role: "region", children: [_jsxs("div", { className: "text-sm font-medium mb-1", children: ["Inventory (", state.ctx.inventory.length, ")"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: state.ctx.inventory.length === 0 ? (_jsx("span", { className: "text-sm opacity-70", children: "Empty" })) : (state.ctx.inventory.map(item => (_jsx("button", { className: "min-h-[32px] px-2 py-1 rounded border text-sm", "aria-label": `Inventory item ${item}`, onClick: () => { }, children: item }, item)))) })] }), _jsx("div", { className: "space-y-4", children: scene.render?.({ go, setFlag, state }) })] }));
}
