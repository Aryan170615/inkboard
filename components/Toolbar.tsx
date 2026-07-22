"use client";

import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Pencil,
  Type,
  Eraser,
} from "lucide-react";
import type { ToolType } from "@/lib/types";

const TOOLS: { type: ToolType; icon: typeof Square; label: string; key: string }[] = [
  { type: "select", icon: MousePointer2, label: "Select", key: "V" },
  { type: "rectangle", icon: Square, label: "Rectangle", key: "R" },
  { type: "ellipse", icon: Circle, label: "Ellipse", key: "C" },
  { type: "line", icon: Minus, label: "Line", key: "L" },
  { type: "arrow", icon: ArrowUpRight, label: "Arrow", key: "A" },
  { type: "draw", icon: Pencil, label: "Draw", key: "P" },
  { type: "text", icon: Type, label: "Text", key: "T" },
  { type: "eraser", icon: Eraser, label: "Eraser", key: "E" },
];

export default function Toolbar({
  tool,
  onChange,
}: {
  tool: ToolType;
  onChange: (t: ToolType) => void;
}) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 rounded-2xl border border-ink-line bg-ink-surface/90 p-2 shadow-xl shadow-black/40 backdrop-blur">
      {TOOLS.map(({ type, icon: Icon, label, key }) => {
        const active = tool === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            title={`${label} (${key})`}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              active
                ? "bg-violet text-white"
                : "text-ink-muted hover:bg-ink-surface2 hover:text-ink-text"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink-surface2 px-2 py-1 text-xs text-ink-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {label} <span className="text-ink-muted">{key}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
