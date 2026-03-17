import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { GameState } from "@/lib/types";
import { generateCard, checkBingo } from "@/lib/bingo";

export async function POST(req: Request) {
  const { roomId, playerId } = await req.json();
  const key = `room:${roomId.toUpperCase()}`;
  const raw = await redis.get<string>(key);
  if (!raw) {
    return NextResponse.json({ error: "ルームが見つかりません" }, { status: 404 });
  }

  const game: GameState = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (game.status !== "playing") {
    return NextResponse.json({ error: "ゲームが進行中ではありません" }, { status: 400 });
  }

  const player = game.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json({ error: "プレイヤーが見つかりません" }, { status: 404 });
  }

  const card = generateCard(player.cardSeed);
  const isBingo = checkBingo(card, game.calledNumbers);

  if (!isBingo) {
    return NextResponse.json({ valid: false, message: "まだBINGOではありません！" });
  }

  game.status = "finished";
  game.winner = player.name;
  game.lastUpdated = Date.now();
  await redis.set(key, JSON.stringify(game), { ex: 7200 });

  return NextResponse.json({ valid: true, winner: player.name });
}
