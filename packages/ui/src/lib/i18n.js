// Minimal i18n utility for client components (EN/FR, per-title namespaces)
// NOTE: Keep lightweight — no heavy runtime libs.
import rod_en from "../i18n/rite-of-discovery/en.json";
import rod_fr from "../i18n/rite-of-discovery/fr.json";
import sys_en from "../i18n/systems-discovery/en.json";
import sys_fr from "../i18n/systems-discovery/fr.json";
import tme_en from "../i18n/toymaker-escape/en.json";
import tme_fr from "../i18n/toymaker-escape/fr.json";
function merge(...objs) {
    return objs.reduce((acc, o) => {
        Object.keys(o || {}).forEach((k) => {
            const v = o[k];
            if (v && typeof v === "object" && !Array.isArray(v)) {
                acc[k] = merge(acc[k] || {}, v);
            }
            else {
                acc[k] = v;
            }
        });
        return acc;
    }, {});
}
const dictionaries = {
    en: merge({}, tme_en, rod_en, sys_en),
    fr: merge({}, tme_fr, rod_fr, sys_fr),
};
let currentLocale = "en";
export function detectLang() {
    if (typeof window === "undefined") {
        return currentLocale;
    }
    const stored = window.localStorage.getItem("lang");
    if (stored === "en" || stored === "fr") {
        return stored;
    }
    const nav = (navigator?.language || "en").toLowerCase();
    if (nav.startsWith("fr")) {
        return "fr";
    }
    return "en";
}
export function setLocale(locale) {
    currentLocale = locale;
    if (typeof window !== "undefined") {
        window.localStorage.setItem("lang", locale);
    }
}
export function getLocale() {
    return currentLocale;
}
export function initI18n(initial) {
    currentLocale = initial ?? detectLang();
}
export function t(path) {
    const dict = dictionaries[currentLocale];
    const parts = path.split(".");
    let node = dict;
    for (const p of parts) {
        if (node && typeof node === "object" && p in node) {
            node = node[p];
        }
        else {
            return path; // fallback to key
        }
    }
    return typeof node === "string" ? node : path;
}
export const i18n = {
    t,
    setLocale,
    detectLang,
    getLocale,
    initI18n,
};
