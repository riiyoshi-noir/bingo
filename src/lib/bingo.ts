// BINGO card generation and validation utilities

export type BingoCard = number[][];

// Generate a random BINGO card (5x5)
// B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
export function generateCard(seed: string): BingoCard {
  const rng = seededRandom(seed);
  const ranges = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
  ];

  const card: number[][] = [];
  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col];
    const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const selected: number[] = [];
    for (let row = 0; row < 5; row++) {
      const idx = Math.floor(rng() * pool.length);
      selected.push(pool[idx]);
      pool.splice(idx, 1);
    }
    card.push(selected);
  }

  // Transpose so card[row][col]
  const transposed: number[][] = [];
  for (let row = 0; row < 5; row++) {
    transposed.push([]);
    for (let col = 0; col < 5; col++) {
      transposed[row].push(card[col][row]);
    }
  }
  // Free space
  transposed[2][2] = 0;
  return transposed;
}

// Check if a card has BINGO given called numbers
export function checkBingo(card: BingoCard, calledNumbers: number[]): boolean {
  const called = new Set(calledNumbers);
  const isMarked = (row: number, col: number) =>
    card[row][col] === 0 || called.has(card[row][col]);

  // Check rows
  for (let row = 0; row < 5; row++) {
    if ([0, 1, 2, 3, 4].every((col) => isMarked(row, col))) return true;
  }
  // Check columns
  for (let col = 0; col < 5; col++) {
    if ([0, 1, 2, 3, 4].every((row) => isMarked(row, col))) return true;
  }
  // Diagonals
  if ([0, 1, 2, 3, 4].every((i) => isMarked(i, i))) return true;
  if ([0, 1, 2, 3, 4].every((i) => isMarked(i, 4 - i))) return true;

  return false;
}

// Simple seeded PRNG (mulberry32)
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
