"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { newRoomId } from "@/lib/utils";

export default function StartBoardButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/board/${newRoomId()}`)}
      className={`group inline-flex items-center gap-2 rounded-xl bg-violet px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-dim ${className}`}
    >
      Start a board
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
