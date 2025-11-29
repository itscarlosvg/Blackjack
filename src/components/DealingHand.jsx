// src/components/DealingHand.jsx
import React from "react";
import Card from "./Card";

export default function DealingHand({
  cards,
  dealtCards,
  target,
  isDealer = false,
  handIndex = 0,
}) {
  const isCardDealt = (cardIndex) => {
    return dealtCards.some(
      (deal) =>
        deal.target === target &&
        deal.index === cardIndex &&
        (target !== "player" || deal.handIndex === handIndex)
    );
  };

  const getCardFaceUp = (cardIndex) => {
    const deal = dealtCards.find(
      (d) =>
        d.target === target &&
        d.index === cardIndex &&
        (target !== "player" || d.handIndex === handIndex)
    );
    return deal ? deal.faceUp !== false : false;
  };

  return (
    <div className="text-center">
      <div
        className={`
  relative flex justify-center items-center 
  min-h-18     /* Móvil: menos altura */
  xs:min-h-20  /* Móvil grande */
  sm:min-h-24  /* Tablet */
  md:min-h-28  /* Desktop */
  mx-auto
  ${isDealer ? "mb-2 sm:mb-3" : ""}
`}
      >
        {cards.map((card, index) => {
          const dealt = isCardDealt(index);
          const faceUp = getCardFaceUp(index);

          if (!dealt) {
            return (
              <div
                key={index}
                className="w-14 h-20 sm:w-16 sm:h-24 md:w-18 md:h-28 lg:w-20 lg:h-30 mx-1 sm:mx-1.5 opacity-0"
              />
            );
          }

          return (
            <div
              key={index}
              className={`
                transition-all duration-300 ease-out
                transform-gpu mx-1 sm:mx-1.5
              `}
              style={{
                transform: `rotate(${(index - (cards.length - 1) / 2) * 2}deg)`,
                zIndex: index,
                transitionDelay: `${index * 150}ms`,
              }}
            >
              <Card
                card={card}
                faceUp={faceUp}
                animation={dealt ? "deal" : "none"}
                delay={index * 150}
                className="shadow-2xl"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
