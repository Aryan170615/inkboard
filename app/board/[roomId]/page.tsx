import Room from "./Room";
import Board from "./Board";

export default function BoardPage({ params }: { params: { roomId: string } }) {
  return (
    <Room roomId={params.roomId}>
      <main className="h-screen w-screen bg-ink-bg">
        <Board roomId={params.roomId} />
      </main>
    </Room>
  );
}
