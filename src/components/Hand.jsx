// src/components/Hand.jsx
import React from "react";
import Card from "./Card";

export default function Hand({ 
  cards, 
  faceUp = true, 
  isDealer = false, 
  points = null,
  isActive = false,
  className = "" 
}) {
  const getCardFaceUp = (index) => {
    if (Array.isArray(faceUp)) {
      return faceUp[index] !== false;
    }
    
    if (isDealer && !isActive && index === 0) {
      return true;
    }
    
    if (isDealer && !isActive && index > 0) {
      return false;
    }
    
    return faceUp;
  };

  // Tamaños responsive para cartas
  const getCardPosition = (index, totalCards) => {
  const baseRotation = isDealer ? 0 : 0;
  
  if (isDealer) {
    return {
      rotation: baseRotation,
      xOffset: (index - (totalCards - 1) / 2) * 18, // Reducido de 25 a 18
      yOffset: 0,
      zIndex: index
    };
  }
  
  return {
    rotation: baseRotation + (index - (totalCards - 1) / 2) * 2,
    xOffset: (index - (totalCards - 1) / 2) * 20, // Reducido de 28 a 20
    yOffset: Math.abs(index - (totalCards - 1) / 2) * 1,
    zIndex: index
  };
};

  return (
    <div className={`text-center ${className}`}>
      {/* Puntos más compactos en móvil */}
      {points !== null && (
        <div className="mb-2 sm:mb-3 md:mb-4">
          <span className="
            bg-black/90 text-white font-bold
            px-3 py-1           /* Móvil: más compacto */
            sm:px-4 sm:py-2     /* Tablet */
            md:px-4 md:py-2     /* Desktop */
            rounded-full 
            text-xs             /* Móvil: texto más pequeño */
            sm:text-sm          /* Tablet */
            md:text-base        /* Desktop */
            border border-yellow-500/50
            shadow-lg
          ">
            {points} {isDealer ? 'Dealer' : 'Points'}
            {points === 21 && cards.length === 2 && (
              <span className="text-yellow-400 ml-1 sm:ml-2">BLACKJACK!</span>
            )}
          </span>
        </div>
      )}

      {/* Contenedor más compacto en móvil */}
      <div className={`
        relative flex justify-center items-center 
        min-h-20     /* Móvil: menos altura */
        xs:min-h-22  /* Móvil grande */
        sm:min-h-28  /* Tablet */
        md:min-h-32  /* Desktop */
        mx-auto
        ${isDealer ? 'mb-2 sm:mb-4' : ''}
      `}>
        {cards.map((card, index) => {
          if (!card) return null;
          
          const position = getCardPosition(index, cards.length);
          
          return (
            <div 
              key={index}
              className={`
                absolute transition-all duration-500 ease-out
                transform-gpu
                hover:-translate-y-1 sm:hover:-translate-y-2
              `}
              style={{
                transform: `
                  translateX(${position.xOffset}px)
                  translateY(${position.yOffset}px)
                  rotate(${position.rotation}deg)
                `,
                zIndex: position.zIndex,
                transitionDelay: `${index * 100}ms`
              }}
            >
              <Card 
                card={card} 
                faceUp={getCardFaceUp(index)}
                className="transition-all duration-300 shadow-lg sm:shadow-xl"
              />
            </div>
          );
        })}
      </div>

      {/* Indicadores más compactos */}
      {isActive && (
        <div className="mt-2 sm:mt-3 md:mt-4">
          <span className="
            bg-gradient-to-r from-blue-600 to-cyan-600 
            text-white font-bold
            px-2 py-1         /* Móvil: más compacto */
            sm:px-3 sm:py-1   /* Tablet */
            rounded 
            text-xs           /* Móvil: texto más pequeño */
            border border-blue-400/50
            shadow-md
            animate-pulse
          ">
            ACTIVE
          </span>
        </div>
      )}

      {points !== null && points > 21 && (
        <div className="mt-1 sm:mt-2 md:mt-3">
          <span className="
            bg-gradient-to-r from-red-600 to-rose-600 
            text-white font-bold
            px-2 py-1       /* Móvil: más compacto */
            rounded text-xs /* Móvil: texto más pequeño */
            border border-red-400/50
            animate-bounce
          ">
            BUST!
          </span>
        </div>
      )}
    </div>
  );
}