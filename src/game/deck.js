// src/game/deck.js

// Palos y valores según tus assets
const suits = ["clubs", "diamonds", "hearts", "spades"];
const values = ["02","03","04","05","06","07","08","09","10","J","Q","K","A"];

// Generar baraja completa
export const generateDeck = () => {
  const deck = suits.flatMap(suit =>
    values.map(value => ({
      suit,
      value,
      // Ruta al asset según tu estructura
      asset: `/src/assets/cards/${suit}/card_${suit}_${value}.png`
    }))
  );

  // Opcional: barajar la baraja
  return shuffle(deck);
};

// Función simple para barajar
const shuffle = (array) => {
  const deck = [...array];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};
