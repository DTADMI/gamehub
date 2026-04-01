"use client";
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { ensureCtx, Lang, SaveState, Scene } from "../engine";

export type SceneId = string;

type Action =
  | { type: "GO"; next: SceneId }
  | { type: "SET_FLAG"; key: string; value: any }
  | { type: "ADD_ITEM"; id: string }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "LOAD"; payload: SaveState };

function reducer(state: SaveState, action: Action): SaveState {
  switch (action.type) {
    case "GO":
      return { ...state, sceneId: action.next };
    case "SET_FLAG":
      return {
        ...state,
        ctx: { ...state.ctx, flags: { ...state.ctx.flags, [action.key]: action.value } },
      };
    case "ADD_ITEM": {
      if (state.ctx.inventory.includes(action.id)) {
        return state;
      }
      return {
        ...state,
        ctx: { ...state.ctx, inventory: [...state.ctx.inventory, action.id] },
      };
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        ctx: {
          ...state.ctx,
          inventory: state.ctx.inventory.filter((i) => i !== action.id),
        },
      };
    }
    case "LOAD":
      return action.payload;
    default:
      return state;
  }
}

export function useSaveService(key: string, initial: SaveState) {
  const [state, dispatch] = useReducer(reducer, initial);
  const saveRef = useRef(key);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(saveRef.current);
      if (raw) {
        const parsed = JSON.parse(raw) as SaveState;
        if (!parsed.v) {
          parsed.v = 1;
        }
        dispatch({ type: "LOAD", payload: parsed });
      }
    } catch {
      // Failed to load
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(saveRef.current, JSON.stringify(state));
    } catch {
      // Failed to save
    }
  }, [state]);

  return { state, dispatch } as const;
}

export function SceneController({
  scenes,
  initial,
  saveKey,
  lang = "en",
}: {
  scenes: Scene[];
  initial: { scene: string; flags: Record<string, any>; inventory: string[] };
  saveKey: string;
  lang?: Lang;
}) {
  const map = useMemo(() => new Map(scenes.map((s) => [s.id, s])), [scenes]);
  const initialState: SaveState = {
    sceneId: initial.scene,
    ctx: ensureCtx({
      flags: initial.flags,
      inventory: initial.inventory,
    }),
    v: 1,
  };
  const { state, dispatch } = useSaveService(saveKey, initialState);

  const go = useCallback((next: SceneId) => dispatch({ type: "GO", next }), [dispatch]);
  const setFlag = useCallback(
    (k: string, v: any) => dispatch({ type: "SET_FLAG", key: k, value: v }),
    [dispatch],
  );
  const _addItem = useCallback((id: string) => dispatch({ type: "ADD_ITEM", id }), [dispatch]);
  const _removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", id }), [dispatch]);

  const scene = map.get(state.sceneId);

  if (!scene) {
    return <div className="p-8">Unknown scene: {state.sceneId}</div>;
  }

  const gentle = Boolean(state.ctx.flags["gentle"]);
  const volume = Number(state.ctx.flags["volume"] ?? 100);
  const title = typeof scene.title === "string" ? scene.title : scene.title[lang];

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm select-none">
          <input
            aria-label="Gentle Mode"
            type="checkbox"
            checked={gentle}
            onChange={(e) => setFlag("gentle", e.target.checked)}
            className="h-5 w-5"
          />
          <span>Gentle Mode</span>
        </label>
      </div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="text-sm opacity-80">{/* reserved for breadcrumbs */}</div>
        <label className="inline-flex items-center gap-2 text-sm">
          <span>Volume</span>
          <select
            aria-label="Volume"
            className="rounded border px-2 py-1"
            value={volume}
            onChange={(e) => setFlag("volume", Number(e.target.value))}
          >
            <option value={0}>Mute</option>
            <option value={50}>50%</option>
            <option value={100}>100%</option>
          </select>
        </label>
      </div>
      {/* Inventory placeholder (global) */}
      <div className="mb-3" aria-label="Inventory" role="region">
        <div className="mb-1 text-sm font-medium">Inventory ({state.ctx.inventory.length})</div>
        <div className="flex flex-wrap gap-2">
          {state.ctx.inventory.length === 0 ? (
            <span className="text-sm opacity-70">Empty</span>
          ) : (
            state.ctx.inventory.map((item) => (
              <button
                key={item}
                className="min-h-[32px] rounded border px-2 py-1 text-sm"
                aria-label={`Inventory item ${item}`}
                onClick={() => {}}
              >
                {item}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="space-y-4">{scene.render?.({ go, setFlag, state })}</div>
    </div>
  );
}
