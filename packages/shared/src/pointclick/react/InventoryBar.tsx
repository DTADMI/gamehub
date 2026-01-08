"use client";
import React from "react";

export function InventoryBar({
  items,
  onUse,
  ariaLabel = "Inventory",
}: {
  items: string[];
  onUse?: (id: string) => void;
  ariaLabel?: string;
}) {
  if (!items?.length) {
    return null;
  }
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className="bg-card text-card-foreground mt-3 flex flex-wrap gap-2 rounded-md border p-2"
    >
      {items.map((id) => (
        <button
          key={id}
          type="button"
          className="bg-muted hover:bg-muted/80 min-h-11 rounded px-3 py-2 text-sm"
          onClick={() => onUse?.(id)}
        >
          {id}
        </button>
      ))}
    </div>
  );
}

export default InventoryBar;
