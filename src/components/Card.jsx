export default function Card({ card, faceUp = true, className = "" }) {
  const cardSrc = faceUp
    ? `/assets/cards/${card.suit}/card_${card.suit}_${card.value}.png`
    : `/assets/cards/card_back.png`;

  return (
    <img
      src={cardSrc}
      alt={card.value + " of " + card.suit}
      className={`
        transition-all duration-300 ease-out
        object-cover   // Mantiene proporción
        bg-transparent   // Sin fondo
        
        /* Tamaños escalados para móvil */
        w-16 h-[86px]     // Móvil pequeño
        sm:w-20 sm:h-[113px] // Móvil grande
        md:w-24 md:h-[136px] // Tablet
        lg:w-22 lg:h-[111px] // Desktop pequeño
        xl:w-26 xl:h-[132px] // Desktop grande
        
        mx-1 sm:mx-1.5 md:mx-2
        hover:-translate-y-1 hover:shadow-2xl
        
        ${className}
      `}
      onError={(e) => (e.target.src = "/src/assets/cards/card_back.png")}
    />
  );
}