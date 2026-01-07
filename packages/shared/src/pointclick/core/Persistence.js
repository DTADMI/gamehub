// Versioned localStorage helpers for per-title saves
export function versionedSave(key, v, data) {
    const payload = { v, data };
    try {
        localStorage.setItem(key, JSON.stringify(payload));
        return true;
    }
    catch (e) {
        console.error("[Persistence] save failed", e);
        return false;
    }
}
export function versionedLoad(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (typeof parsed?.v !== "number" || !("data" in parsed)) {
            return null;
        }
        return parsed;
    }
    catch (e) {
        console.warn("[Persistence] load parse failed; clearing key", key, e);
        try {
            localStorage.removeItem(key);
        }
        catch {
            // Failed to load save
        }
        return null;
    }
}
// Apply migrations to reach target version; returns data at target version or null
export function loadWithMigrations(key, targetVersion, migrations = {}) {
    const payload = versionedLoad(key);
    if (!payload) {
        return null;
    }
    let { v, data } = payload;
    if (v === targetVersion) {
        return data;
    }
    // Forward-only migrations: apply step by step up to target
    while (v < targetVersion) {
        const migrate = migrations[v];
        if (!migrate) {
            console.warn("[Persistence] missing migration for version", v, "->", v + 1);
            break;
        }
        data = migrate(data);
        v += 1;
    }
    if (v !== targetVersion) {
        return null;
    }
    // Persist upgraded data
    versionedSave(key, targetVersion, data);
    return data;
}
export const SAVE_KEYS = {
    rod: "rod:save:v1",
    tme: "tme:save:v1",
    sysdisc: "sysdisc:save:v1",
    settings: "gh:settings:v1",
};
export const DEFAULT_SETTINGS = {
    language: "en",
    reducedMotion: false,
    volume: 0.8,
};
export function saveSettings(settings) {
    return versionedSave(SAVE_KEYS.settings, 1, settings);
}
export function loadSettings() {
    const data = loadWithMigrations(SAVE_KEYS.settings, 1, {
        // v0 -> v1 example stub
        0: (old) => ({ ...DEFAULT_SETTINGS, ...old }),
    });
    return data || DEFAULT_SETTINGS;
}
