"use client";

import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";

export interface PresenceBadgeProps {
  status?: "online" | "offline" | "away";
  className?: string;
}

export function PresenceBadge({ status = "offline", className }: PresenceBadgeProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-yellow-500",
  };

  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <span className={cn("h-2 w-2 rounded-full", statusColors[status])} />
      {status}
    </Badge>
  );
}

export default PresenceBadge;
