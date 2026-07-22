"use client";

import { useOthers } from "@/lib/liveblocks.config";

export default function Cursors() {
  const others = useOthers();

  return (
    <>
      {others.map((o) => {
        if (!o.presence.cursor) return null;
        return (
          <div
            key={o.connectionId}
            className="pointer-events-none absolute z-30 transition-transform duration-75"
            style={{ transform: `translate(${o.presence.cursor.x}px, ${o.presence.cursor.y}px)` }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 2L8 17L10.5 10.5L17 8L2 2Z"
                fill={o.presence.color}
                stroke="#0F0E17"
                strokeWidth="1"
              />
            </svg>
            <span
              className="ml-4 -mt-1 inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium text-ink-bg shadow-md"
              style={{ backgroundColor: o.presence.color }}
            >
              {o.presence.name}
            </span>
          </div>
        );
      })}
    </>
  );
}
