"use client";

import { useState } from "react";
import GameRoom from "@/components/GameRoom";

export default function Home() {
  const [screen, setScreen] = useState<"menu" | "game">("menu");
  const [roomId, setRoomId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name || "ホスト" }),
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      setScreen("game");
    } catch {
      setError("ルームの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      setError("ルームコードを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: joinCode.toUpperCase(),
          playerName: name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      setScreen("game");
    } catch {
      setError("ルームへの参加に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (screen === "game") {
    return <GameRoom roomId={roomId} playerId={playerId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-indigo-700">BINGO</h1>
          <p className="text-gray-500">みんなで遊ぼう！</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              あなたの名前
            </label>
            <input
              type="text"
              placeholder="例: たろう"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg text-center text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>

          <div className="bg-indigo-50 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-indigo-700 text-center">新しくゲームを始める</h2>
            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full px-4 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
            >
              ルームを作成する
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">または</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-green-700 text-center">既存のルームに参加する</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例: ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-lg text-center font-mono tracking-widest uppercase text-gray-900 bg-white placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans"
              />
              <button
                onClick={joinRoom}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg"
              >
                参加
              </button>
            </div>
            <p className="text-xs text-green-600 text-center">ホストから共有されたコードを入力</p>
          </div>
        </div>

        {error && (
          <div className="text-center text-red-500 bg-red-50 rounded-xl py-3 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
