// Server-owned inputs: never serialize this collection into public responses.
export const fixtures = [
  { price: 1500, quantity: 3, discount: 10, expected: 4050 },
  { price: 1200, quantity: 2, discount: 0, expected: 2400 },
  { price: 800, quantity: 4, discount: 25, expected: 2400 },
  { price: 500, quantity: 2, discount: 100, expected: 0 },
  { price: 99.5, quantity: 2, discount: 12.5, expected: 174.125 }
] as const;
