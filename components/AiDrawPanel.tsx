"use client";

import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import type { Shape } from "@/lib/types";

const EXAMPLES = [
  "draw a house",
  "draw a landscape",
  "draw a flowchart",
  "draw a simple robot",
];

export default function AIDrawPanel({
  onDraw,
  onClose,
}: {
  onDraw: (shapes: Omit<Shape, "id">[]) => void;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  async function handleGenerate(text = prompt) {
    const trimmed = text.trim();

    if (!trimmed || loading) return;

    setLoading(true);
    setError(false);
    setLastPrompt(trimmed);

    try {
      const res = await fetch("/api/ai-draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmed,
        }),
      });

      if (!res.ok) {
        console.error("Request failed:", res.status);
        throw new Error();
      }

      const data = await res.json();

      if (!Array.isArray(data.shapes)) {
        throw new Error();
      }

      onDraw(data.shapes);

      setPrompt("");
    } catch (err) {
      console.error(err);

      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute right-4 top-20 z-30 flex w-80 flex-col rounded-2xl border border-ink-line bg-ink-surface/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-ink-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles
            size={15}
            className="text-violet-glow"
          />
          <p className="text-sm font-semibold font-display text-ink-text">
            AI Draw
          </p>
        </div>

        <button onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        <p className="mb-3 text-xs text-ink-muted">
          Describe what to draw and the AI will place
          shapes on the board for everyone to see.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-ink-line bg-ink-surface2 px-3 py-1 text-xs"
            >
              {ex}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          className="w-full resize-none rounded-xl bg-ink-surface2 p-3 outline-none"
        />

        {error && (
          <p className="mt-2 text-xs text-coral">
            Please try again after a few seconds.
          </p>
        )}

        <button
          onClick={() => handleGenerate()}
          disabled={!prompt.trim() || loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet py-2.5 text-white disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />
              Drawing...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generate
            </>
          )}
        </button>

        {lastPrompt &&
          !loading &&
          !error && (
            <p className="mt-2 text-center text-xs text-teal">
              ✓ Drew "{lastPrompt}"
            </p>
          )}
      </div>
    </div>
  );
}