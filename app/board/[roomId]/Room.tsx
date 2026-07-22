"use client";

import { ReactNode, useMemo } from "react";
import { LiveMap } from "@liveblocks/client";
import { RoomProvider } from "@/lib/liveblocks.config";
import { getOrCreateGuestIdentity } from "@/lib/utils";

export default function Room({ roomId, children }: { roomId: string; children: ReactNode }) {
  const identity = useMemo(() => getOrCreateGuestIdentity(), []);

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null, name: identity.name, color: identity.color }}
      initialStorage={{ shapes: new LiveMap() }}
    >
      {children}
    </RoomProvider>
  );
}
