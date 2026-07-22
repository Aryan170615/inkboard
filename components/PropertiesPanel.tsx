"use client";

import type { FillStyle, ShapeStyle, ToolType } from "@/lib/types";

const STROKE_COLORS = ["#F2F0FF", "#FF6B6B", "#6FCF97", "#5B8DEF", "#F4C97A", "#C792EA", "#2DD4BF"];
const FILL_COLORS = ["transparent", "#FF6B6B33", "#6FCF9733", "#5B8DEF33", "#F4C97A33", "#C792EA33"];
const FILL_STYLES: { value: FillStyle; label: string }[] = [
  { value: "none", label: "None" },
  { value: "hachure", label: "Hachure" },
  { value: "cross-hatch", label: "Cross" },
  { value: "dots", label: "Dots" },
  { value: "solid", label: "Solid" },
];

function Swatch({
  color,
  active,
  onClick,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={color}
      className={`h-7 w-7 rounded-lg border-2 transition-transform ${
        active ? "scale-105 border-violet" : "border-ink-line hover:border-ink-muted"
      }`}
      style={{
        background:
          color === "transparent"
            ? "repeating-conic-gradient(#2C2840 0% 25%, #171522 0% 50%) 0 0/8px 8px"
            : color,
      }}
    />
  );
}

export default function PropertiesPanel({
  tool,
  style,
  onChange,
}: {
  tool: ToolType;
  style: ShapeStyle;
  onChange: (next: Partial<ShapeStyle>) => void;
}) {
  const showFill = tool !== "text" && tool !== "draw" && tool !== "line" && tool !== "arrow";
  const showFontSize = tool === "text";

  return (
    <div className="absolute right-4 top-20 z-20 w-60 rounded-2xl border border-ink-line bg-ink-surface/90 p-4 shadow-xl shadow-black/40 backdrop-blur">
      <Section label="Stroke">
        <div className="flex flex-wrap gap-2">
          {STROKE_COLORS.map((c) => (
            <Swatch key={c} color={c} active={style.stroke === c} onClick={() => onChange({ stroke: c })} />
          ))}
        </div>
      </Section>

      {showFill && (
        <>
          <Section label="Fill">
            <div className="flex flex-wrap gap-2">
              {FILL_COLORS.map((c) => (
                <Swatch key={c} color={c} active={style.fill === c} onClick={() => onChange({ fill: c })} />
              ))}
            </div>
          </Section>

          <Section label="Fill style">
            <div className="grid grid-cols-3 gap-1.5">
              {FILL_STYLES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => onChange({ fillStyle: f.value })}
                  className={`rounded-lg px-2 py-1.5 text-xs transition-colors ${
                    style.fillStyle === f.value
                      ? "bg-violet text-white"
                      : "bg-ink-surface2 text-ink-muted hover:text-ink-text"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Section>
        </>
      )}

      <Slider
        label="Stroke width"
        value={style.strokeWidth}
        min={1}
        max={10}
        step={0.5}
        onChange={(v) => onChange({ strokeWidth: v })}
        unit="px"
      />
      <Slider
        label="Roughness"
        value={style.roughness}
        min={0}
        max={3}
        step={0.1}
        onChange={(v) => onChange({ roughness: v })}
      />
      <Slider
        label="Opacity"
        value={Math.round(style.opacity * 100)}
        min={10}
        max={100}
        step={5}
        onChange={(v) => onChange({ opacity: v / 100 })}
        unit="%"
      />
      {showFontSize && (
        <Slider
          label="Font size"
          value={style.fontSize}
          min={14}
          max={48}
          step={1}
          onChange={(v) => onChange({ fontSize: v })}
          unit="px"
        />
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="text-[11px] font-medium text-violet-glow">
          {value}
          {unit}
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-line accent-violet"
      />
    </div>
  );
}
