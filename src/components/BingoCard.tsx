"use client";

import { BingoCard as BingoCardType } from "@/lib/bingo";

interface Props {
  card: BingoCardType;
  calledNumbers: number[];
}

export default function BingoCard({ card, calledNumbers }: Props) {
  const called = new Set(calledNumbers);

  return (
    <div className="inline-block">
      <div className="grid grid-cols-5 gap-1">
        {card.map((row, ri) =>
          row.map((num, ci) => {
            const isFree = ri === 2 && ci === 2;
            const isMarked = isFree || called.has(num);
            return (
              <div
                key={`${ri}-${ci}`}
                className={`w-14 h-14 flex items-center justify-center text-lg font-semibold rounded-lg border-2 transition-all ${
                  isMarked
                    ? "bg-yellow-400 border-yellow-500 text-yellow-900 scale-95"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                {isFree ? "★" : num}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
