// src/components/Controls.jsx
import React from "react";

const BlackjackButton = ({
  onClick,
  disabled,
  action,
  icon,
  children,
  fullWidth,
}) => {
  const getButtonStyle = () => {
    const baseStyles = `
      relative group font-bold text-white
      border-2 overflow-hidden transition-all duration-200
      transform hover:scale-105 active:scale-95
      shadow-lg hover:shadow-xl
      min-h-[50px] flex items-center justify-center
      rounded-lg
      ${
        disabled
          ? "bg-gray-500 cursor-not-allowed opacity-40 border-gray-400"
          : ""
      }
      ${fullWidth ? "col-span-2" : ""}
      
      /* Tamaños responsive */
      px-2 py-3
      sm:px-3 sm:py-3
      md:px-2 md:py-2
      
      /* Texto responsive */
      text-xs
      sm:text-sm
      md:text-xs
    `;

    if (disabled) return baseStyles;

    const actionStyles = {
      hit: `
        bg-gradient-to-br from-green-600 to-emerald-700 
        hover:from-green-700 hover:to-emerald-800
        border-green-400 hover:border-green-300
      `,
      stand: `
        bg-gradient-to-br from-red-600 to-rose-700 
        hover:from-red-700 hover:to-rose-800
        border-red-400 hover:border-red-300
      `,
      double: `
        bg-gradient-to-br from-yellow-600 to-amber-700 
        hover:from-yellow-700 hover:to-amber-800
        border-yellow-400 hover:border-yellow-300
      `,
      split: `
        bg-gradient-to-br from-purple-600 to-violet-700 
        hover:from-purple-700 hover:to-violet-800
        border-purple-400 hover:border-purple-300
      `,
      surrender: `
        bg-gradient-to-br from-gray-600 to-slate-700 
        hover:from-gray-700 hover:to-slate-800
        border-gray-400 hover:border-gray-300
      `,
      insurance: `
        bg-gradient-to-br from-blue-600 to-indigo-700 
        hover:from-blue-700 hover:to-indigo-800
        border-blue-400 hover:border-blue-300
      `,
    };

    return baseStyles + " " + (actionStyles[action] || actionStyles.hit);
  };

  return (
    <button onClick={onClick} disabled={disabled} className={getButtonStyle()}>
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
      )}

      {!disabled && (
        <div className="absolute inset-1 rounded-md border border-white/20 group-hover:border-white/40 transition-all duration-300" />
      )}

      <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full">
        <span className="text-base sm:text-lg md:text-base filter drop-shadow-lg">
          {icon}
        </span>
        <span className="font-semibold tracking-wide drop-shadow-md text-center whitespace-nowrap">
          {children}
        </span>
      </div>

      {/* Tooltip para botones deshabilitados */}
      {disabled && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {action === "insurance" && "Dealer must show Ace"}
          {action === "split" && "Need matching cards"}
          {action === "double" && "Only with 9, 10, or 11 points"}
        </div>
      )}

      <div className="absolute inset-0 bg-white/0 group-active:bg-white/10 rounded-lg transition-colors duration-150" />
    </button>
  );
};

export default function Controls(props) {
  return (
    <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 sm:p-4 border-2 border-yellow-500/30 shadow-xl mb-3 sm:mb-4 mx-1">
      {/* Grid uniforme - 3 columnas en móvil, 6 en desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        {/* Primera fila - 3 botones principales */}

        <BlackjackButton
          onClick={props.onDouble}
          disabled={!props.canDouble}
          action="double"
        >
          DOUBLE
        </BlackjackButton>
        <BlackjackButton
          onClick={props.onSplit}
          disabled={!props.canSplit}
          action="split"
        >
          SPLIT
        </BlackjackButton>
        <BlackjackButton
          onClick={props.onHit}
          disabled={!props.canHit}
          action="hit"
        >
          HIT
        </BlackjackButton>

        <BlackjackButton onClick={props.onStand} action="stand" >
          STAND
        </BlackjackButton>
        {/* Segunda fila - 3 botones secundarios */}

        <BlackjackButton
          onClick={props.onInsurance}
          disabled={!props.canInsurance}
          action="insurance"
        >
          INSURANCE
        </BlackjackButton>
        <BlackjackButton
          onClick={props.onSurrender}
          disabled={!props.canSurrender}
          action="surrender"
        >
          SURRENDER
        </BlackjackButton>
      </div>
    </div>
  );
}
