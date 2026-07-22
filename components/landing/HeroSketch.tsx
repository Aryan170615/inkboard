"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

const STEPS: Array<
  | { type: "rect"; x: number; y: number; w: number; h: number; stroke: string; fill: string }
  | { type: "ellipse"; x: number; y: number; w: number; h: number; stroke: string; fill: string }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string }
  | { type: "curve"; points: [number, number][]; stroke: string }
> = [
  { type: "rect", x: 36, y: 38, w: 168, h: 108, stroke: "#7C5CFC", fill: "#7C5CFC2A" },
  { type: "ellipse", x: 300, y: 50, w: 110, h: 88, stroke: "#2DD4BF", fill: "#2DD4BF2A" },
  { type: "line", x1: 206, y1: 92, x2: 296, y2: 94, stroke: "#FF6B6B" },
  {
    type: "curve",
    points: [
      [60, 220],
      [92, 252],
      [124, 222],
      [156, 254],
      [188, 224],
      [220, 250],
    ],
    stroke: "#F4C97A",
  },
  { type: "rect", x: 250, y: 200, w: 130, h: 76, stroke: "#6FCF97", fill: "#6FCF972A" },
];

export default function HeroSketch() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = 420;
    const h = 320;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const rc = rough.canvas(canvas);

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        if (cancelled) return;
        const opts = { roughness: 1.7, strokeWidth: 2.2, seed: i + 11 };
        if (step.type === "rect") {
          rc.rectangle(step.x, step.y, step.w, step.h, {
            ...opts,
            stroke: step.stroke,
            fill: step.fill,
            fillStyle: "hachure",
          });
        } else if (step.type === "ellipse") {
          rc.ellipse(step.x + step.w / 2, step.y + step.h / 2, step.w, step.h, {
            ...opts,
            stroke: step.stroke,
            fill: step.fill,
            fillStyle: "hachure",
          });
        } else if (step.type === "line") {
          rc.line(step.x1, step.y1, step.x2, step.y2, { ...opts, stroke: step.stroke });
        } else if (step.type === "curve") {
          rc.curve(step.points, { ...opts, stroke: step.stroke });
        }
      }, 280 * i);
      timers.push(t);
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative">
      <canvas ref={ref} style={{ width: 420, height: 320 }} />
      <span className="float absolute -left-6 top-6 rounded-md bg-coral px-2 py-1 text-xs font-medium text-ink-bg shadow-lg">
        maya
      </span>
      <span
        className="float absolute -right-4 bottom-16 rounded-md bg-teal px-2 py-1 text-xs font-medium text-ink-bg shadow-lg"
        style={{ animationDelay: "1.2s" }}
      >
        theo
      </span>
    </div>
  );
}
