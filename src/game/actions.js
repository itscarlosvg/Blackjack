import { calculateHand } from "./rules";
// src/game/actions.js

/**
 * Hit - Agregar una carta a la mano
 */
export const hit = (hand, deck) => {
  if (deck.length === 0) {
    throw new Error("No hay cartas en el deck");
  }
  const card = deck[deck.length - 1]; // Toma la última carta
  return {
    newHand: [...hand, card],
    newDeck: deck.slice(0, -1) // Remueve la carta usada
  };
};

/**
 * Stand - No hace cambios, solo pasa turno
 */
export const stand = () => {
  return { action: "stand" }; // Solo marca la acción
};

/**
 * Double - Agrega una carta y finaliza la mano
 */
export const double = (hand, deck) => {
  if (deck.length === 0) {
    throw new Error("No hay cartas en el deck");
  }
  if (hand.length !== 2) {
    throw new Error("Solo puedes doblar con 2 cartas");
  }
  
  const handValue = calculateHand(hand);
  const allowedValues = [9, 10, 11];
  
  if (!allowedValues.includes(handValue)) {
    throw new Error(`Solo puedes doblar con 9, 10 u 11 puntos (tienes ${handValue})`);
  }
  
  const card = deck[deck.length - 1];
  return {
    newHand: [...hand, card],
    newDeck: deck.slice(0, -1),
    action: "double"
  };
};

/**
 * Split - Divide la mano en dos manos
 */
export const split = (hand, deck) => {
  if (hand.length !== 2) {
    throw new Error("Split requiere exactamente 2 cartas");
  }
  if (hand[0].value !== hand[1].value) {
    throw new Error("Split requiere cartas del mismo valor");
  }
  if (deck.length < 2) {
    throw new Error("No hay suficientes cartas para split");
  }

  // Tomar dos cartas del deck
  const newDeck = deck.slice(0, -2);
  const card1 = deck[deck.length - 2];
  const card2 = deck[deck.length - 1];

  const hand1 = [hand[0], card1];
  const hand2 = [hand[1], card2];

  return {
    hands: [hand1, hand2],
    newDeck: newDeck,
    action: "split"
  };
};

/**
 * Surrender - Marca la mano como rendida
 */
export const surrender = (hand) => {
  return {
    hand: hand, // Mantiene las cartas para mostrar
    action: "surrender"
  };
};

/**
 * Insurance - Calcula apuesta de seguro
 */
export const insurance = (currentBet) => {
  if (currentBet <= 0) {
    throw new Error("Apuesta debe ser mayor a 0");
  }
  return {
    insuranceBet: currentBet / 2,
    action: "insurance"
  };
};