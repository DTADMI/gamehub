"use client";
import { jsx as _jsx } from "react/jsx-runtime";
export function InventoryBar({ items, onUse, ariaLabel = "Inventory", }) {
    if (!items?.length) {
        return null;
    }
    return (_jsx("div", { role: "toolbar", "aria-label": ariaLabel, className: "mt-3 flex flex-wrap gap-2 p-2 rounded-md bg-card text-card-foreground border", children: items.map((id) => (_jsx("button", { type: "button", className: "min-h-11 px-3 py-2 rounded bg-muted hover:bg-muted/80 text-sm", onClick: () => onUse?.(id), children: id }, id))) }));
}
export default InventoryBar;
