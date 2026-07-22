import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Shape } from "./types";

export function createRoughCanvas(canvas: HTMLCanvasElement): RoughCanvas {
  return rough.canvas(canvas);
}

function roughOptions(shape: Shape) {
  return {
    seed: shape.seed,
    roughness: shape.roughness,
    strokeWidth: shape.strokeWidth,
    stroke: shape.stroke,
    fill: shape.fillStyle === "none" ? undefined : shape.fill,
    fillStyle: shape.fillStyle === "none" ? undefined : shape.fillStyle,
    fillWeight: Math.max(1, shape.strokeWidth / 2),
    hachureGap: 5 + shape.strokeWidth,
    curveFitting: 0.95,
  };
}

function drawArrowHead(rc: RoughCanvas, x1: number, y1: number, x2: number, y2: number, shape: Shape) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 12 + shape.strokeWidth * 2;
  const spread = 0.5;
  const opts = roughOptions(shape);
  rc.line(x2, y2, x2 - headLength * Math.cos(angle - spread), y2 - headLength * Math.sin(angle - spread), opts);
  rc.line(x2, y2, x2 - headLength * Math.cos(angle + spread), y2 - headLength * Math.sin(angle + spread), opts);
}

export function drawShape(rc: RoughCanvas, ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.save();
  ctx.globalAlpha = shape.opacity;
  const opts = roughOptions(shape);

  switch (shape.type) {
    case "rectangle": {
      const x = shape.width < 0 ? shape.x + shape.width : shape.x;
      const y = shape.height < 0 ? shape.y + shape.height : shape.y;
      rc.rectangle(x, y, Math.abs(shape.width), Math.abs(shape.height), opts);
      break;
    }
    case "ellipse": {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      rc.ellipse(cx, cy, Math.abs(shape.width), Math.abs(shape.height), opts);
      break;
    }
    case "line":
      rc.line(shape.x, shape.y, shape.x + shape.width, shape.y + shape.height, opts);
      break;
    case "arrow": {
      const x2 = shape.x + shape.width;
      const y2 = shape.y + shape.height;
      rc.line(shape.x, shape.y, x2, y2, opts);
      drawArrowHead(rc, shape.x, shape.y, x2, y2, shape);
      break;
    }
    case "draw":
      if (shape.points && shape.points.length > 1)
        rc.curve(shape.points, { ...opts, fill: undefined, fillStyle: undefined });
      break;
    case "text": {
      // ✅ FIX: use the actual font name, not a CSS variable.
      // Canvas 2D cannot resolve CSS custom properties like var(--font-caveat).
      const fontFamily = "Caveat, cursive";
      ctx.font = `600 ${shape.fontSize}px ${fontFamily}`;
      ctx.fillStyle = shape.stroke;
      ctx.textBaseline = "top";
      const lines = (shape.text ?? "").split("\n");
      lines.forEach((line, i) =>
        ctx.fillText(line, shape.x, shape.y + i * shape.fontSize * 1.25)
      );
      break;
    }
  }
  ctx.restore();
}

export function measureText(ctx: CanvasRenderingContext2D, text: string, fontSize: number) {
  ctx.font = `600 ${fontSize}px Caveat, cursive`;
  const lines = text.split("\n");
  const width = Math.max(...lines.map((l) => ctx.measureText(l || " ").width), 10);
  const height = lines.length * fontSize * 1.25;
  return { width, height };
}