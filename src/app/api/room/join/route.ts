import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { GameState } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { roomId, playerName } = await req.json();
  const key = `room:${roomId.toUpperCase()}`;
  const raw = await redis.get<string>(key);
  if (!raw) {
    return NextResponse.json({ error: "ルームが見つかりません" }, { status: 404 });
  }

  const game: GameState = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (game.players.length >= 10) {
    return NextResponse.json({ error: "ルームが満員です" }, { status: 400 });
  }

  if (game.status !== "waiting") {
    return NextResponse.json({ error: "ゲームは既に開始しています" }, { status: 400 });
  }

  const playerId = uuidv4();
  game.players.push({
    id: playerId,
    name: playerName || `プレイヤー${game.players.length + 1}`,
    cardSeed: `${roomId}-${playerId}`,
  });
  game.lastUpdated = Date.now();

  await redis.set(key, JSON.stringify(game), { ex: 7200 });

  return NextResponse.json({ roomId: game.roomId, playerId });
}
