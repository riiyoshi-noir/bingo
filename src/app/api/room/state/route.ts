import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { GameState } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  if (!roomId) {
    return NextResponse.json({ error: "roomId is required" }, { status: 400 });
  }

  const raw = await redis.get<string>(`room:${roomId.toUpperCase()}`);
  if (!raw) {
    return NextResponse.json({ error: "ルームが見つかりません" }, { status: 404 });
  }

  const game: GameState = typeof raw === "string" ? JSON.parse(raw) : raw;
  return NextResponse.json(game);
}
