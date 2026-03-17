import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { GameState } from "@/lib/types";

export async function POST(req: Request) {
  const { roomId, playerId } = await req.json();
  const key = `room:${roomId.toUpperCase()}`;
  const raw = await redis.get<string>(key);
  if (!raw) {
    return NextResponse.json({ error: "ルームが見つかりません" }, { status: 404 });
  }

  const game: GameState = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (game.hostId !== playerId) {
    return NextResponse.json({ error: "ホストのみ番号を引けます" }, { status: 403 });
  }

  if (game.status !== "playing") {
    return NextResponse.json({ error: "ゲームが進行中ではありません" }, { status: 400 });
  }

  // Draw a number not yet called
  const called = new Set(game.calledNumbers);
  const remaining = Array.from({ length: 75 }, (_, i) => i + 1).filter(
    (n) => !called.has(n)
  );

  if (remaining.length === 0) {
    return NextResponse.json({ error: "すべての番号が出ました" }, { status: 400 });
  }

  const drawn = remaining[Math.floor(Math.random() * remaining.length)];
  game.calledNumbers.push(drawn);
  game.lastUpdated = Date.now();

  await redis.set(key, JSON.stringify(game), { ex: 7200 });

  return NextResponse.json({ drawn, calledNumbers: game.calledNumbers });
}
