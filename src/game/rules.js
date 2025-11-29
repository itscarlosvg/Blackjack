// src/game/rules.js

export const cardValue = (card) => {
  const value = card.value;
  
  if (["J", "Q", "K"].includes(value)) return 10;
  if (value === "A") return 11;
  
  // Manejar valores "02", "03", etc.
  if (value.startsWith("0")) {
    return parseInt(value.charAt(1), 10); // Toma el segundo carácter
  }
  
  return parseInt(value, 10);
};

export const calculateHand = (hand) => {
  let total = 0;
  let aces = 0;

  hand.forEach((c) => {
    const val = cardValue(c);
    total += val;
    if (c.value === "A") aces += 1;
  });

  // Ajustar Ases si hay bust
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
};

export const isBlackjack = (hand) => calculateHand(hand) === 21 && hand.length === 2;
export const isBust = (hand) => calculateHand(hand) > 21;
