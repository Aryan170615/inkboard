"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { nanoid } from "nanoid";
import { useBroadcastEvent, useEventListener, useSelf } from "@/lib/liveblocks.config";
import type { RoomEvent } from "@/lib/liveblocks.config";

type Message = {
  id: string;
  name: string;
  color: string;
  text: string;
  ts: number;
  isMine: boolean;
};

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const self = useSelf();
  const broadcast = useBroadcastEvent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Listen for incoming chat events from other users
  useEventListener(({ event, connectionId }) => {
    if (event.type !== "CHAT") return;
    const isMine = self ? connectionId === -1 : false; // -1 = own echo (won't happen here)
    setMessages((prev) => [
      ...prev,
      { id: event.id, name: event.name, color: event.color, text: event.text, ts: event.ts, isMine: false },
    ]);
  });

  function send() {
    const text = input.trim();
    if (!text || !self) return;
    const msg: RoomEvent = {
      type: "CHAT",
      id: nanoid(8),
      name: self.presence.name,
      color: self.presence.color,
      text,
      ts: Date.now(),
    };
    // Add to local state immediately (broadcast doesn't echo back to sender)
    setMessages((prev) => [...prev, { ...msg, isMine: true }]);
    broadcast(msg);
    setInput("");
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="absolute right-4 top-20 z-30 flex h-[420px] w-72 flex-col rounded-2xl border border-ink-line bg-ink-surface/95 shadow-2xl shadow-black/50 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-line px-4 py-3">
        <p className="text-sm font-semibold font-display text-ink-text">Chat</p>
        <button onClick={onClose} className="text-ink-muted transition-colors hover:text-ink-text">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-xs text-ink-muted">
            No messages yet. Say something!
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.isMine ? "items-end" : "items-start"}`}>
            {!m.isMine && (
              <span className="mb-1 text-[11px] font-medium" style={{ color: m.color }}>
                {m.name}
              </span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                m.isMine
                  ? "rounded-tr-sm bg-violet text-white"
                  : "rounded-tl-sm bg-ink-surface2 text-ink-text"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-ink-line px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Message…"
          className="flex-1 rounded-xl bg-ink-surface2 px-3 py-2 text-sm text-ink-text placeholder-ink-muted outline-none focus:ring-1 focus:ring-violet"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet text-white transition-opacity disabled:opacity-40 hover:bg-violet-dim"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}