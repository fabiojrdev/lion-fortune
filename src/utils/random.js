// src/utils/random.js

export function getRandomSymbol(symbols) {
  const index = Math.floor(Math.random() * symbols.length);
  return symbols[index];
}
