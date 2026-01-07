"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DialogueBox({ scene, lang, onChoose, }) {
    const title = typeof scene.title === "string" ? scene.title : scene.title[lang];
    const body = typeof scene.body === "string" ? scene.body : scene.body?.[lang] ?? "";
    return (_jsxs("section", { role: "dialog", "aria-labelledby": "dlg-title", className: "rounded-lg border bg-card text-card-foreground p-4 shadow-sm", children: [_jsx("h2", { id: "dlg-title", className: "text-xl font-semibold mb-2", children: title }), body && _jsx("p", { className: "mb-3 text-sm opacity-90", children: body }), _jsx("div", { className: "flex flex-col gap-2 mt-2", children: scene.choices.map((c) => (_jsx("button", { className: "min-h-11 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm text-left", onClick: () => onChoose(c.id), children: c.text[lang] ?? c.text.en }, c.id))) })] }));
}
export default DialogueBox;
