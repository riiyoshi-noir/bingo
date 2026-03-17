"use client";

function getLabel(num: number): string {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "N";
  if (num <= 60) return "G";
  return "O";
}

interface Props {
  calledNumbers: number[];
}

export default function CalledNumbers({ calledNumbers }: Props) {
  const latest = calledNumbers[calledNumbers.length - 1];

  return (
    <div className="space-y-3">
      {latest && (
        <div className="text-center">
          <div className="text-sm text-gray-500">最新の番号</div>
          <div className="text-5xl font-bold text-indigo-600 animate-bounce">
            {getLabel(latest)}-{latest}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-md mx-auto">
        {calledNumbers
          .slice()
          .reverse()
          .slice(latest ? 1 : 0)
          .map((num, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center w-10 h-10 text-xs font-medium bg-gray-100 rounded-full text-gray-700"
            >
              {num}
            </span>
          ))}
      </div>
      <div className="text-center text-sm text-gray-400">
        {calledNumbers.length} / 75 個出ました
      </div>
    </div>
  );
}
