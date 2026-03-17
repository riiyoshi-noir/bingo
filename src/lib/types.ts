export interface Player {
  id: string;
  name: string;
  cardSeed: string;
}

export interface GameState {
  roomId: string;
  hostId: string;
  players: Player[];
  calledNumbers: number[];
  status: "waiting" | "playing" | "finished";
  winner: string | null;
  lastUpdated: number;
}
