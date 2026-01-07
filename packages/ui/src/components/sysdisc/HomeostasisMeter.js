"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function HomeostasisMeter({ value, ariaLabel, size = "md", }) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    const height = size === "sm" ? 10 : size === "lg" ? 20 : 14;
    return (_jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { role: "meter", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": clamped, "aria-label": ariaLabel || "Homeostasis meter", className: "relative w-full rounded overflow-hidden border", style: { height }, children: [_jsx("div", { "aria-hidden": true, className: "absolute inset-0", style: {
                            background: "linear-gradient(90deg, transparent 45%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.25) 65%, transparent 65%)",
                        } }), _jsx("div", { "aria-hidden": true, className: "h-full bg-primary/70", style: { width: `${clamped}%` } })] }), _jsxs("div", { className: "flex justify-between mt-1 text-[11px] text-muted-foreground", children: [_jsx("span", { children: "0" }), _jsx("span", { children: "45" }), _jsx("span", { children: "65" }), _jsx("span", { children: "100" })] }), _jsx("div", { className: "sr-only", "aria-live": "polite", children: clamped < 45 ? "Low" : clamped > 65 ? "High" : "Steady" })] }));
}
export default HomeostasisMeter;
