import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { GameState } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { hostName } = await req.json();
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const hostId = uuidv4();

  const game: GameState = {
    roomId,
    hostId,
    players: [
      {
        id: hostId,
        name: hostName || "ホスト",
        cardSeed: `${roomId}-${hostId}`,
      },
    ],
    calledNumbers: [],
    status: "waiting",
    winner: null,
    lastUpdated: Date.now(),
  };

  await redis.set(`room:${roomId}`, JSON.stringify(game), { ex: 7200 }); // 2h TTL

  return NextResponse.json({ roomId, playerId: hostId });
}
