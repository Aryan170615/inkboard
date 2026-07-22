import { nanoid } from "nanoid";
import type { Shape } from "./types";

export function newId(): string {
  return nanoid(10);
}

export function newRoomId(): string {
  // short, easy to read aloud / paste in a chat — e.g. "warm-otter-42"
  const adjectives = ["warm", "quiet", "swift", "bold", "calm", "bright", "sly", "kind"];
  const animals = ["otter", "heron", "fox", "wren", "lynx", "moth", "crane", "newt"];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const b = animals[Math.floor(Math.random() * animals.length)];
  const n = Math.floor(Math.random() * 90 + 10);
  return `${a}-${b}-${n}`;
}

const GUEST_COLORS = ["#FF6B6B", "#7C5CFC", "#2DD4BF", "#F4C97A", "#FF8FB1", "#6FCF97"];
const GUEST_FIRST = ["maya", "theo", "nora", "kai", "ravi", "luca", "zoe", "finn", "ana", "sam"];

export function getOrCreateGuestIdentity(): { name: string; color: string } {
  if (typeof window === "undefined") return { name: "guest", color: GUEST_COLORS[0] };
  const key = "inkboard:guest";
  const existing = window.localStorage.getItem(key);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fall through and regenerate
    }
  }
  const name = GUEST_FIRST[Math.floor(Math.random() * GUEST_FIRST.length)];
  const color = GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)];
  const identity = { name, color };
  window.localStorage.setItem(key, JSON.stringify(identity));
  return identity;
}

export function boundsOf(shape: Shape): { x: number; y: number; width: number; height: number } {
  if (shape.type === "draw" && shape.points && shape.points.length > 0) {
    const xs = shape.points.map((p) => p[0]);
    const ys = shape.points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  const x = shape.width < 0 ? shape.x + shape.width : shape.x;
  const y = shape.height < 0 ? shape.y + shape.height : shape.y;
  return { x, y, width: Math.abs(shape.width), height: Math.abs(shape.height) };
}

export function isPointInShape(px: number, py: number, shape: Shape, padding = 6): boolean {
  const b = boundsOf(shape);
  return (
    px >= b.x - padding &&
    px <= b.x + b.width + padding &&
    py >= b.y - padding &&
    py <= b.y + b.height + padding
  );
}

export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D || 1;
  let t = dot / lenSq;
  t = Math.max(0, Math.min(1, t));
  const xx = x1 + t * C;
  const yy = y1 + t * D;
  return Math.hypot(px - xx, py - yy);
}

export function isPointNearShape(px: number, py: number, shape: Shape, threshold = 10): boolean {
  if (shape.type === "rectangle" || shape.type === "ellipse" || shape.type === "text") {
    return isPointInShape(px, py, shape, threshold / 2);
  }
  if (shape.type === "line" || shape.type === "arrow") {
    return distanceToSegment(px, py, shape.x, shape.y, shape.x + shape.width, shape.y + shape.height) <= threshold;
  }
  if (shape.type === "draw" && shape.points) {
    for (let i = 0; i < shape.points.length - 1; i++) {
      const [x1, y1] = shape.points[i];
      const [x2, y2] = shape.points[i + 1];
      if (distanceToSegment(px, py, x1, y1, x2, y2) <= threshold) return true;
    }
    return false;
  }
  return false;
}
