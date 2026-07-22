"use client";

import { createClient, LiveMap } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { Shape } from "./types";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ?? "",
});

export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
};

export type Storage = {
  shapes: LiveMap<string, any>;
};

// Broadcast events are ephemeral (not stored) — perfect for chat messages
export type RoomEvent = {
  type: "CHAT";
  id: string;
  name: string;
  color: string;
  text: string;
  ts: number;
};

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useStorage,
  useMutation,
  useSelf,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage, never, RoomEvent>(client);