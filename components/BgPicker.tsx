"use client";

import { useState } from "react";
import { Palette } from "lucide-react";

export type BgOption = {
  id: string;
  label: string;
  bg: string;
  dot: string;
};

export const BG_OPTIONS: BgOption[] = [
  { id: "midnight",  label: "Midnight",  bg: "#0F0E17", dot: "#2C2840" },
  { id: "obsidian",  label: "Obsidian",  bg: "#0D1117", dot: "#21262D" },
  { id: "navy",      label: "Navy",      bg: "#0A1628", dot: "#162035" },
  { id: "forest",    label: "Forest",    bg: "#0A1A0E", dot: "#142B1A" },
  { id: "ember",     label: "Ember",     bg: "#1A0C08", dot: "#2C1810" },
  { id: "dusk",      label: "Dusk",      bg: "#1A1028", dot: "#2A1A3A" },
  { id: "charcoal",  label: "Charcoal",  bg: "#1C1C1C", dot: "#2E2E2E" },
  { id: "paper",     label: "Paper",     bg: "#F5F0E8", dot: "#D8D0C0" },
  { id: "white",     label: "White",     bg: "#FFFFFF", dot: "#E0E0E0" },
  { id: "blueprint", label: "Blueprint", bg: "#0A2140", dot: "#0D2D58" },
];

export default function BgPicker({
  current,
  onChange,
}: {
  current: string;
  onChange: (opt: BgOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-6 left-20 z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Background color"
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-lg transition-colors border ${
          open
            ? "bg-violet text-white border-violet"
            : "bg-ink-surface border-ink-line text-ink-muted hover:text-ink-text"
        }`}
      >
        <Palette size={14} />
        Background
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 w-52 rounded-2xl border border-ink-line bg-ink-surface/95 p-3 shadow-2xl shadow-black/50 backdrop-blur">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Board background
          </p>
          <div className="grid grid-cols-5 gap-2">
            {BG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                title={opt.label}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`group relative h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                  current === opt.bg ? "border-violet scale-110" : "border-ink-line"
                }`}
                style={{ backgroundColor: opt.bg }}
              >
                <span
                  className="absolute inset-0 rounded-[inherit] opacity-60"
                  style={{
                    backgroundImage: `radial-gradient(circle, ${opt.dot} 1px, transparent 1px)`,
                    backgroundSize: "6px 6px",
                  }}
                />
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-muted">
            {BG_OPTIONS.find((o) => o.bg === current)?.label ?? "Custom"}
          </p>
        </div>
      )}
    </div>
  );
}