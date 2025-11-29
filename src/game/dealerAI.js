// src/game/dealerAI.js
import { calculateHand, isBust } from "./rules";

export const dealerPlay = (dealerHand, deck) => {
  let hand = [...dealerHand];

  while (calculateHand(hand) < 17) {
    hand.push(deck.pop());
  }

  return hand;
};

export const dealerTurnOver = (hand) => isBust(hand) || calculateHand(hand) >= 17;
