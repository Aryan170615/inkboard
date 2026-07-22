"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Link2, Check, Sparkles, Trash2 } from "lucide-react";
import { useOthers, useSelf } from "@/lib/liveblocks.config";

export default function TopBar({
  roomId,
  onExport,
  onClear,
}: {
  roomId: string;
  onExport: () => void;
  onClear: () => void;
}) {
  const others = useOthers();
  const self = useSelf();
  const [copied, setCopied] = useState(false);

  const onlineCount = others.length + 1;

  async function handleInvite() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-ink-line bg-ink-surface/90 px-3 py-2 shadow-xl shadow-black/40 backdrop-blur">
      <Link href="/" className="flex items-center gap-1.5 pr-2 text-sm font-display font-semibold text-ink-text">
        <Sparkles size={15} className="text-violet-glow" />
        Inkboard
      </Link>
      <div className="h-5 w-px bg-ink-line" />
      <span className="rounded-lg bg-ink-surface2 px-2.5 py-1 text-xs font-medium text-ink-muted">
        {roomId}
      </span>
      <div className="flex items-center -space-x-2">
        {self && (
          <Avatar name={`${self.presence.name} (you)`} color={self.presence.color} title={`${self.presence.name} (you)`} />
        )}
        {others.slice(0, 4).map((o) => (
          <Avatar key={o.connectionId} name={o.presence.name} color={o.presence.color} title={o.presence.name} />
        ))}
      </div>
      <span className="hidden text-xs text-ink-muted sm:inline">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-teal" />
        {onlineCount} online
      </span>
      <div className="h-5 w-px bg-ink-line" />
      <button
        onClick={handleInvite}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-ink-surface2 hover:text-ink-text"
      >
        {copied ? <Check size={14} className="text-teal" /> : <Link2 size={14} />}
        {copied ? "Copied" : "Invite"}
      </button>
      <button
        onClick={() => {
          if (window.confirm("Clear the whole board? This can't be undone.")) onClear();
        }}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-ink-surface2 hover:text-coral"
      >
        <Trash2 size={14} />
      </button>
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 rounded-lg bg-violet px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-dim"
      >
        <Download size={14} />
        Export
      </button>
    </div>
  );
}

function Avatar({ name, color, title }: { name: string; color: string; title: string }) {
  return (
    <div
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink-surface text-[11px] font-semibold uppercase text-ink-bg"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 1)}
    </div>
  );
}
