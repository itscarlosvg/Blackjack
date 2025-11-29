// src/components/Chips.jsx
import React, { useState } from "react";

export default function Chips({ balance, onBet }) {
  const [bet, setBet] = useState(0);

  const handleChange = (e) => {
    const value = Number(e.target.value);
    if (value <= balance) setBet(value);
  };

  const handleBet = () => {
    if (bet > 0 && bet <= balance) {
      onBet(bet);
      setBet(0); // reset después de apostar
    }
  };

  return (
    <div className="chips">
      <p>Balance: ${balance}</p>
      <div className="bet-controls">
        <input
          type="number"
          value={bet}
          onChange={handleChange}
          min="1"
          max={balance}
          placeholder="Enter bet"
        />
        <button onClick={handleBet}>Place Bet</button>
      </div>
    </div>
  );
}
