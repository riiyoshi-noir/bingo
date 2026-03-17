"use client";

import { useState, useEffect, useCallback } from "react";
import { generateCard } from "@/lib/bingo";
import { GameState } from "@/lib/types";
import BingoCard from "./BingoCard";
import CalledNumbers from "./CalledNumbers";

interface Props {
  roomId: string;
  playerId: string;
  onLeave: () => void;
}

export default function GameRoom({ roomId, playerId, onLeave }: Props) {
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/state?roomId=${roomId}`);
      if (res.ok) {
        setGame(await res.json());
      }
    } catch {
      // ignore polling errors
    }
  }, [roomId]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const isHost = game?.hostId === playerId;
  const currentPlayer = game?.players.find((p) => p.id === playerId);
  const card = currentPlayer ? generateCard(currentPlayer.cardSeed) : null;

  const handleDraw = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/room/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error);
      }
      await fetchState();
    } finally {
      setLoading(false);
    }
  };

  const handleBingo = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/room/bingo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId }),
      });
      const data = await res.json();
      if (data.valid) {
        setMessage("🎉 BINGO!! おめでとうございます！");
      } else {
        setMessage(data.message || data.error);
      }
      await fetchState();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setMessage("");
    const res = await fetch("/api/room/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, playerId }),
    });
    if (res.ok) {
      setMessage("ゲームをリセットしました");
      await fetchState();
    }
  };

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500 text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 relative">
        <button
          onClick={onLeave}
          className="absolute left-0 top-0 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          退出
        </button>
        <h1 className="text-3xl font-bold text-indigo-700">BINGO</h1>
        <div className="flex items-center justify-center gap-3">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-mono font-bold">
            部屋: {game.roomId}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {game.players.length}人参加中
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              game.status === "waiting"
                ? "bg-yellow-100 text-yellow-700"
                : game.status === "playing"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {game.status === "waiting"
              ? "待機中"
              : game.status === "playing"
              ? "進行中"
              : "終了"}
          </span>
        </div>
      </div>

      {/* Winner Banner */}
      {game.winner && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-4 rounded-xl text-xl font-bold shadow-lg">
          🎉 {game.winner} さんがBINGO！ 🎉
        </div>
      )}

      {/* Players */}
      <div className="flex flex-wrap gap-2 justify-center">
        {game.players.map((p) => (
          <span
            key={p.id}
            className={`px-3 py-1 rounded-full text-sm ${
              p.id === playerId
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            } ${p.id === game.hostId ? "ring-2 ring-yellow-400" : ""}`}
          >
            {p.name}
            {p.id === game.hostId ? " 👑" : ""}
          </span>
        ))}
      </div>

      {/* Called Numbers */}
      {game.calledNumbers.length > 0 && (
        <CalledNumbers calledNumbers={game.calledNumbers} />
      )}

      {/* Card */}
      {card && (
        <div className="flex justify-center">
          <BingoCard card={card} calledNumbers={game.calledNumbers} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {isHost && game.status !== "finished" && (
          <button
            onClick={handleDraw}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {game.status === "waiting" ? "ゲーム開始 & 番号を引く" : "番号を引く"}
          </button>
        )}
        {game.status === "playing" && (
          <button
            onClick={handleBingo}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            BINGO!
          </button>
        )}
        {isHost && game.status === "finished" && (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-all shadow-lg"
          >
            もう一回遊ぶ
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="text-center text-lg font-medium text-indigo-700 bg-indigo-50 rounded-xl py-3">
          {message}
        </div>
      )}

      {/* Waiting message for non-host */}
      {!isHost && game.status === "waiting" && (
        <div className="text-center text-gray-500">
          ホストがゲームを開始するのを待っています...
        </div>
      )}
    </div>
  );
}
