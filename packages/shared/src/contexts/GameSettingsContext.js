"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// libs/shared/src/contexts/GameSettingsContext.tsx
import { createContext, useContext, useEffect, useMemo, useState, } from "react";
const GameSettingsContext = createContext(null);
const STORAGE_KEY = "gamehub:settings";
function loadInitial() {
    if (typeof window === "undefined") {
        return {
            enableParticles: false,
            particleEffect: "sparks",
            mode: "classic",
            isAuthenticated: false,
            isSubscriber: false,
        };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return {
                enableParticles: false,
                particleEffect: "sparks",
                mode: "classic",
                isAuthenticated: false,
                isSubscriber: false,
            };
        }
        const parsed = JSON.parse(raw);
        return {
            enableParticles: !!parsed.enableParticles,
            particleEffect: parsed.particleEffect === "puff" ? "puff" : "sparks",
            mode: parsed.mode === "hard" || parsed.mode === "chaos"
                ? parsed.mode
                : "classic",
            isAuthenticated: !!parsed.isAuthenticated,
            isSubscriber: !!parsed.isSubscriber,
        };
    }
    catch {
        return {
            enableParticles: false,
            particleEffect: "sparks",
            mode: "classic",
            isAuthenticated: false,
            isSubscriber: false,
        };
    }
}
export function GameSettingsProvider({ children, }) {
    // Ensure localStorage exists in test environments
    if (typeof window !== "undefined" &&
        typeof window.localStorage === "undefined") {
        try {
            const store = {};
            window.localStorage = {
                getItem: (k) => (k in store ? store[k] : null),
                setItem: (k, v) => {
                    store[k] = String(v);
                },
                removeItem: (k) => {
                    delete store[k];
                },
                clear: () => {
                    for (const key of Object.keys(store)) {
                        delete store[key];
                    }
                },
                key: (i) => Object.keys(store)[i] ?? null,
                get length() {
                    return Object.keys(store).length;
                },
            };
        }
        catch {
            // ignore
        }
    }
    const initial = loadInitial();
    const [enableParticles, setEnableParticles] = useState(initial.enableParticles);
    const [particleEffect, setParticleEffect] = useState(initial.particleEffect);
    const [mode, setMode] = useState(initial.mode);
    const [isAuthenticated, setIsAuthenticated] = useState(initial.isAuthenticated);
    const [isSubscriber, setIsSubscriber] = useState(initial.isSubscriber);
    useEffect(() => {
        const payload = {
            enableParticles,
            particleEffect,
            mode,
            isAuthenticated,
            isSubscriber,
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }
        catch {
            // ignore
        }
        try {
            // Notify any non-context consumers (e.g., games that can’t access the provider directly)
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("gamehub:settings", { detail: payload }));
            }
        }
        catch {
            // ignore
        }
    }, [enableParticles, particleEffect, mode, isAuthenticated, isSubscriber]);
    const setAuthState = (auth, sub) => {
        setIsAuthenticated(!!auth);
        setIsSubscriber(!!sub);
    };
    const value = useMemo(() => ({
        enableParticles,
        setEnableParticles,
        particleEffect,
        setParticleEffect,
        mode,
        setMode,
        isAuthenticated,
        isSubscriber,
        setAuthState,
    }), [enableParticles, particleEffect, mode, isAuthenticated, isSubscriber]);
    return (_jsx(GameSettingsContext.Provider, { value: value, children: children }));
}
export function useGameSettings() {
    const ctx = useContext(GameSettingsContext);
    if (!ctx) {
        return {
            enableParticles: false,
            setEnableParticles: () => {
            },
            particleEffect: "sparks",
            setParticleEffect: () => {
            },
            mode: "classic",
            setMode: () => {
            },
            isAuthenticated: false,
            isSubscriber: false,
            setAuthState: () => {
            },
        };
    }
    return ctx;
}
