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
    return NextResponse.json({ error: "ホストのみ開始できます" }, { status: 403 });
  }

  if (game.status !== "waiting") {
    return NextResponse.json({ error: "既に開始しています" }, { status: 400 });
  }

  game.status = "playing";
  game.lastUpdated = Date.now();
  await redis.set(key, JSON.stringify(game), { ex: 7200 });

  return NextResponse.json({ success: true });
}
