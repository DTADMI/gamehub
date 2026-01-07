export function detectLang() {
    if (typeof navigator !== "undefined") {
        const n = navigator.language.toLowerCase();
        if (n.startsWith("fr")) {
            return "fr";
        }
    }
    if (typeof document !== "undefined") {
        const dl = document.documentElement.lang?.toLowerCase();
        if (dl?.startsWith("fr")) {
            return "fr";
        }
    }
    return "en";
}
export function nextScene(currentSceneId, scenes, choiceId, ctx = {}) {
    const scene = scenes[currentSceneId];
    const safeCtx = ensureCtx(ctx);
    if (!scene) {
        return { sceneId: currentSceneId, ctx: safeCtx };
    }
    const choice = scene.choices.find((c) => c.id === choiceId);
    if (!choice) {
        return { sceneId: currentSceneId, ctx: safeCtx };
    }
    if (choice.guard && !choice.guard(safeCtx)) {
        return { sceneId: currentSceneId, ctx: safeCtx };
    }
    const nextCtx = choice.effect ? ensureCtx(choice.effect(safeCtx)) : safeCtx;
    return { sceneId: choice.target, ctx: nextCtx };
}
export function save(key, state) {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    }
    catch {
        // Failed to save
    }
}
export function load(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.sceneId === "string") {
            // Defensive normalize of ctx shape
            const norm = {
                sceneId: parsed.sceneId,
                ctx: ensureCtx(parsed.ctx || {}),
                v: parsed.v ?? 1,
            };
            return norm;
        }
    }
    catch {
        // Failed to load
    }
    return null;
}
// --- Helpers: context & effects API ---
export function ensureCtx(ctx) {
    return {
        flags: ctx?.flags ?? {},
        inventory: ctx?.inventory ?? [],
        vars: ctx?.vars ?? {},
    };
}
export const effects = {
    setFlag: (key, value = true) => (ctx) => ({
        ...ctx,
        flags: { ...ctx.flags, [key]: value },
    }),
    addItem: (id) => (ctx) => ctx.inventory.includes(id)
        ? ctx
        : { ...ctx, inventory: [...ctx.inventory, id] },
    removeItem: (id) => (ctx) => ({
        ...ctx,
        inventory: ctx.inventory.filter((x) => x !== id),
    }),
    setVar: (key, value) => (ctx) => ({
        ...ctx,
        vars: { ...ctx.vars, [key]: value },
    }),
};
export const guards = {
    hasFlag: (key, value = true) => (ctx) => (ctx.flags?.[key] ?? false) === value,
    hasItem: (id) => (ctx) => ctx.inventory?.includes(id) ?? false,
    varEquals: (key, value) => (ctx) => ctx.vars?.[key] === value,
};
export function migrate(raw, _migrator) {
    try {
        if (!raw) {
            return null;
        }
        if (raw.v === 1) {
            return {
                sceneId: String(raw.sceneId || "intro"),
                ctx: ensureCtx(raw.ctx || {}),
                v: 1,
            };
        }
        return _migrator ? _migrator(raw) : null;
    }
    catch {
        return null;
    }
}
