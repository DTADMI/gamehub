"use client";

import dynamic from "next/dynamic";

const TetrisGame = dynamic(() => import("@games/tetris").then((m) => m.TetrisGame), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function TetrisPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <TetrisGame />
    </main>
  );
}
