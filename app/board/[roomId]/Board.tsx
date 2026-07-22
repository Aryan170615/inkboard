"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Sparkles,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import Toolbar from "@/components/Toolbar";
import PropertiesPanel from "@/components/PropertiesPanel";
import TopBar from "@/components/TopBar";
import Cursors from "@/components/Cursors";
import ChatPanel from "@/components/ChatPanel";
import AIDrawPanel from "@/components/AiDrawPanel";
import BgPicker, { BG_OPTIONS, type BgOption } from "@/components/BgPicker";
import { createRoughCanvas, drawShape, measureText } from "@/lib/rough-draw";
import { newId, isPointNearShape, boundsOf } from "@/lib/utils";
import type { Shape, ShapeStyle, ToolType } from "@/lib/types";
import {
  useMutation,
  useStorage,
  useUpdateMyPresence,
} from "@/lib/liveblocks.config";

type ExtendedToolType = ToolType | "hand";

const DEFAULT_STYLE: ShapeStyle = {
  stroke: "#F2F0FF",
  fill: "#7C5CFC33",
  fillStyle: "hachure",
  strokeWidth: 2,
  roughness: 1.4,
  opacity: 1,
  fontSize: 24,
};

const KEY_TO_TOOL: Record<string, ExtendedToolType> = {
  v: "select",
  h: "hand",
  r: "rectangle",
  c: "ellipse",
  l: "line",
  a: "arrow",
  p: "draw",
  t: "text",
  e: "eraser",
};

export default function Board({ roomId }: { roomId: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roughRef = useRef<ReturnType<typeof createRoughCanvas> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [tool, setTool] = useState<ExtendedToolType>("select");
  const [style, setStyle] = useState<ShapeStyle>(DEFAULT_STYLE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // ── Camera (Infinite Canvas Pan & Zoom) State ─────────────────────────────
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Text editing kept entirely local until commit — prevents Liveblocks
  // re-renders from immediately blurring the textarea
  const [editingShape, setEditingShape] = useState<Shape | null>(null);
  const [editingText, setEditingText] = useState("");

  const [bg, setBg] = useState<BgOption>(() => {
    if (typeof window === "undefined") return BG_OPTIONS[0];
    const saved = localStorage.getItem("inkboard:bg");
    return BG_OPTIONS.find((o) => o.id === saved) ?? BG_OPTIONS[0];
  });

  const activeIdRef = useRef<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; origin: Shape } | null>(null);
  const pointsRef = useRef<[number, number][]>([]);
  const draftBoxRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const bgRef = useRef(bg);
  useEffect(() => { bgRef.current = bg; }, [bg]);

  // ── Liveblocks ─────────────────────────────────────────────────────────────
  const shapesMap = useStorage((root: any) => root.shapes);
  const shapes: Shape[] = shapesMap ? Array.from(shapesMap.values()) : [];
  const updateMyPresence = useUpdateMyPresence();

  const addShape = useMutation(({ storage }, shape: Shape) => {
    storage.get("shapes").set(shape.id, shape);
  }, []);
  const patchShape = useMutation(({ storage }, id: string, patch: Partial<Shape>) => {
    const map = storage.get("shapes");
    const cur = map.get(id);
    if (cur) map.set(id, { ...cur, ...patch });
  }, []);
  const removeShape = useMutation(({ storage }, id: string) => {
    storage.get("shapes").delete(id);
  }, []);
  const clearAll = useMutation(({ storage }) => {
    const map = storage.get("shapes");
    Array.from(map.keys()).forEach((k) => map.delete(k));
  }, []);

  function handleAIDraw(rawShapes: Omit<Shape, "id">[]) {
    rawShapes.forEach((s) =>
      addShape({ ...s, id: newId(), seed: s.seed ?? Math.floor(Math.random() * 2 ** 31) } as Shape)
    );
  }

  function handleBgChange(opt: BgOption) {
    setBg(opt);
    localStorage.setItem("inkboard:bg", opt.id);
  }

  // ── Coordinates Helper (Screen to World) ─────────────────────────
  const toWorld = useCallback((e: React.PointerEvent | React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return {
      x: (screenX - panRef.current.x) / zoomRef.current,
      y: (screenY - panRef.current.y) / zoomRef.current,
    };
  }, []);

  // ── Wheel Event: Pan & Zoom Handler ──────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zooming relative to pointer location
        const zoomSensitivity = 0.0015;
        const delta = -e.deltaY * zoomSensitivity;
        const currentZoom = zoomRef.current;
        const newZoom = Math.min(Math.max(0.1, currentZoom * (1 + delta)), 5);

        const rect = wrapper!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newPanX = mouseX - (mouseX - panRef.current.x) * (newZoom / currentZoom);
        const newPanY = mouseY - (mouseY - panRef.current.y) * (newZoom / currentZoom);

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        // Panning
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    }

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", onWheel);
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    roughRef.current = createRoughCanvas(canvas);
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  // ── Redraw ────────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const rc = roughRef.current;
    if (!canvas || !rc) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Reset transform to draw background
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bgRef.current.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Camera Matrix Transformation (Zoom + Pan)
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, pan.x * dpr, pan.y * dpr);

    for (const shape of shapes) {
      if (editingShape && shape.id === editingShape.id) continue;
      drawShape(rc, ctx, shape);
      if (shape.id === selectedId) {
        const b = boundsOf(shape);
        ctx.save();
        ctx.strokeStyle = "#A78BFA";
        ctx.lineWidth = 1 / zoom; // Keep outline width crisp regardless of zoom level
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.strokeRect(b.x - 6, b.y - 6, b.width + 12, b.height + 12);
        ctx.restore();
      }
    }
  }, [shapes, selectedId, editingShape, zoom, pan]);

  useEffect(() => { redraw(); }, [redraw]);
  useEffect(() => { redraw(); }, [bg, redraw]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editingShape) {
      setTimeout(() => textareaRef.current?.focus(), 20);
    }
  }, [editingShape]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function hitTest(x: number, y: number): Shape | null {
    for (let i = shapes.length - 1; i >= 0; i--)
      if (isPointNearShape(x, y, shapes[i])) return shapes[i];
    return null;
  }

  // ── Text ──────────────────────────────────────────────────────────────────
  function startNewText(x: number, y: number) {
    setEditingShape({
      id: newId(), type: "text", x, y,
      width: 10, height: style.fontSize * 1.25, text: "",
      stroke: style.stroke, fill: "transparent", fillStyle: "none",
      strokeWidth: style.strokeWidth, roughness: style.roughness,
      opacity: style.opacity, fontSize: style.fontSize,
      seed: Math.floor(Math.random() * 2 ** 31),
    });
    setEditingText("");
  }

  function startEditExisting(shape: Shape) {
    removeShape(shape.id);
    setEditingShape({ ...shape });
    setEditingText(shape.text ?? "");
  }

  function commitText() {
    if (!editingShape) return;
    const text = editingText.trim();
    if (text) {
      const canvas = canvasRef.current;
      let width = 160, height = editingShape.fontSize * 1.25;
      if (canvas) {
        const ctx = canvas.getContext("2d")!;
        const m = measureText(ctx, text, editingShape.fontSize);
        width = m.width;
        height = m.height;
      }
      addShape({ ...editingShape, text, width, height });
      setSelectedId(editingShape.id);
    }
    setEditingShape(null);
    setEditingText("");
    setTool("select");
  }

  function cancelText() {
    setEditingShape(null);
    setEditingText("");
    setTool("select");
  }

  // ── Pointer events ────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    if (editingShape) {
      commitText();
      return;
    }

    // Check for canvas pan trigger: Middle click (button === 1), Spacebar down, or Hand tool
    if (e.button === 1 || spacePressed || tool === "hand") {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toWorld(e);

    if (tool === "select") {
      const hit = hitTest(x, y);
      if (hit) {
        setSelectedId(hit.id);
        dragRef.current = { id: hit.id, offsetX: x - hit.x, offsetY: y - hit.y, origin: { ...hit } };
      } else {
        setSelectedId(null);
      }
      return;
    }
    if (tool === "eraser") {
      const hit = hitTest(x, y);
      if (hit) removeShape(hit.id);
      return;
    }
    if (tool === "text") {
      startNewText(x, y);
      return;
    }

    const id = newId();
    const base: Shape = {
      id, type: tool as Shape["type"], x, y, width: 0, height: 0,
      stroke: style.stroke, fill: style.fill, fillStyle: style.fillStyle,
      strokeWidth: style.strokeWidth, roughness: style.roughness,
      opacity: style.opacity, fontSize: style.fontSize,
      seed: Math.floor(Math.random() * 2 ** 31),
    };
    if (tool === "draw") {
      pointsRef.current = [[x, y]];
      base.points = [[x, y]];
    } else {
      draftBoxRef.current = { x, y, width: 0, height: 0 };
    }
    activeIdRef.current = id;
    addShape(base);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
      return;
    }

    const { x, y } = toWorld(e);
    updateMyPresence({ cursor: { x, y } });

    if (dragRef.current) {
      const { id, offsetX, offsetY, origin } = dragRef.current;
      const nx = x - offsetX, ny = y - offsetY;
      if (origin.type === "draw" && origin.points) {
        const dx = nx - origin.x, dy = ny - origin.y;
        patchShape(id, { x: nx, y: ny, points: origin.points.map(([px, py]) => [px + dx, py + dy]) });
      } else {
        patchShape(id, { x: nx, y: ny });
      }
      return;
    }

    const id = activeIdRef.current;
    if (!id) return;
    if (tool === "draw") {
      pointsRef.current = [...pointsRef.current, [x, y]];
      patchShape(id, { points: pointsRef.current });
      return;
    }
    const origin = draftBoxRef.current;
    if (!origin) return;
    const width = x - origin.x, height = y - origin.y;
    draftBoxRef.current = { ...origin, width, height };
    patchShape(id, { width, height });
  }

  function onPointerUp() {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
      return;
    }

    if (dragRef.current) { dragRef.current = null; return; }
    const id = activeIdRef.current;
    activeIdRef.current = null;
    if (!id) return;

    if (tool === "draw") {
      if (pointsRef.current.length > 1) {
        const xs = pointsRef.current.map((p) => p[0]);
        const ys = pointsRef.current.map((p) => p[1]);
        patchShape(id, {
          x: Math.min(...xs), y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        });
      }
      pointsRef.current = [];
      return;
    }

    const box = draftBoxRef.current;
    draftBoxRef.current = null;
    if (box && Math.abs(box.width) < 4 && Math.abs(box.height) < 4) {
      removeShape(id);
      return;
    }
    setSelectedId(id);
    setTool("select");
  }

  function onDoubleClick(e: React.MouseEvent) {
    const { x, y } = toWorld(e);
    const hit = hitTest(x, y);
    if (hit?.type === "text") startEditExisting(hit);
  }

  // ── Keyboard Shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

      if (e.code === "Space" && !e.repeat) {
        setSpacePressed(true);
        return;
      }

      if (e.key === "Escape") {
        if (editingShape) cancelText();
        else setSelectedId(null);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !editingShape) {
        removeShape(selectedId);
        setSelectedId(null);
        return;
      }
      const mapped = KEY_TO_TOOL[e.key.toLowerCase()];
      if (mapped) setTool(mapped);
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        setSpacePressed(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [selectedId, editingShape, removeShape]);

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `inkboard-${roomId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const isLightBg = ["#F5F0E8", "#FFFFFF"].includes(bg.bg);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <TopBar roomId={roomId} onExport={handleExport} onClear={clearAll} />
      <Toolbar tool={tool as ToolType} onChange={(t) => { cancelText(); setTool(t); }} />
      <PropertiesPanel tool={tool as ToolType} style={style} onChange={(p) => setStyle((s) => ({ ...s, ...p }))} />

      {/* Floating Zoom & Canvas Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 rounded-xl border border-ink-line bg-ink-surface/90 p-1.5 backdrop-blur-md shadow-lg text-ink-muted">
        <button
          onClick={() => setTool((t) => (t === "hand" ? "select" : "hand"))}
          title="Hand / Pan Tool (H or Hold Space)"
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            tool === "hand"
              ? "bg-violet text-white"
              : "hover:bg-ink-line/50 hover:text-ink-text"
          }`}
        >
          <Hand size={16} />
        </button>

        <div className="h-4 w-[1px] bg-ink-line mx-0.5" />

        <button
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
          title="Zoom Out"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-ink-line/50 hover:text-ink-text"
        >
          <ZoomOut size={16} />
        </button>

        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          title="Reset Zoom & Centered View (100%)"
          className="flex h-8 items-center justify-center px-2 text-center text-xs font-mono font-medium rounded-lg transition-colors hover:bg-ink-line/50 hover:text-ink-text"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
          title="Zoom In"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-ink-line/50 hover:text-ink-text"
        >
          <ZoomIn size={16} />
        </button>

        <div className="h-4 w-[1px] bg-ink-line mx-0.5" />

        <button
          onClick={() => setPan({ x: 0, y: 0 })}
          title="Recenter Canvas Origin"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-ink-line/50 hover:text-ink-text"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Floating Background Picker (Positioned above Zoom Controls) */}
      <div className="absolute bottom-20 left-6 z-20">
        <BgPicker current={bg.bg} onChange={handleBgChange} />
      </div>

      {/* AI Draw & Chat Buttons (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        <button
          onClick={() => { setShowAI((v) => !v); setShowChat(false); }}
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-lg transition-colors border ${
            showAI ? "bg-violet text-white border-violet" : "bg-ink-surface border-ink-line text-ink-muted hover:text-ink-text"
          }`}
        >
          <Sparkles size={14} /> AI Draw
        </button>
        <button
          onClick={() => { setShowChat((v) => !v); setShowAI(false); }}
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-lg transition-colors border ${
            showChat ? "bg-violet text-white border-violet" : "bg-ink-surface border-ink-line text-ink-muted hover:text-ink-text"
          }`}
        >
          <MessageCircle size={14} /> Chat
        </button>
      </div>

      {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
      {showAI && <AIDrawPanel onDraw={handleAIDraw} onClose={() => setShowAI(false)} />}

      <div
        ref={wrapperRef}
        className="absolute inset-0"
        style={{
          backgroundColor: bg.bg,
          backgroundImage: `radial-gradient(circle, ${bg.dot} 1px, transparent 1px)`,
          backgroundSize: `${22 * zoom}px ${22 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor:
            tool === "hand" || spacePressed
              ? isPanning
                ? "grabbing"
                : "grab"
              : tool === "select"
              ? "default"
              : tool === "eraser"
              ? "cell"
              : tool === "text"
              ? "text"
              : "crosshair",
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => updateMyPresence({ cursor: null })}
          onDoubleClick={onDoubleClick}
        />
        
        {/* World Space Transformed Cursors Layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <Cursors />
        </div>

        {/* Text Area Overlay in screen space matching world coordinates */}
        {editingShape && (
          <textarea
            ref={textareaRef}
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Escape") { e.preventDefault(); cancelText(); }
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitText(); }
            }}
            placeholder="Type here…"
            className="absolute resize-none bg-transparent outline-none"
            style={{
              left: editingShape.x * zoom + pan.x,
              top: (editingShape.y - 2) * zoom + pan.y,
              minWidth: 160 * zoom,
              minHeight: editingShape.fontSize * 1.4 * zoom,
              fontSize: editingShape.fontSize * zoom,
              fontFamily: "Caveat, cursive",
              fontWeight: 600,
              lineHeight: 1.25,
              color: isLightBg ? "#111827" : editingShape.stroke,
              caretColor: "#A78BFA",
              borderBottom: `${2 * zoom}px dashed #A78BFA`,
              paddingBottom: 2 * zoom,
            }}
          />
        )}
      </div>
    </div>
  );
}