import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { GameState } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { roomId, playerId } = await req.json();
  const key = `room:${roomId.toUpperCase()}`;
  const raw = await redis.get<string>(key);
  if (!raw) {
    return NextResponse.json({ error: "ルームが見つかりません" }, { status: 404 });
  }

  const game: GameState = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (game.hostId !== playerId) {
    return NextResponse.json({ error: "ホストのみリセットできます" }, { status: 403 });
  }

  // Reset game but keep players with new card seeds
  game.calledNumbers = [];
  game.status = "waiting";
  game.winner = null;
  game.lastUpdated = Date.now();
  game.players = game.players.map((p) => ({
    ...p,
    cardSeed: `${roomId}-${p.id}-${uuidv4().slice(0, 8)}`,
  }));

  await redis.set(key, JSON.stringify(game), { ex: 7200 });

  return NextResponse.json({ success: true });
}
