// src/components/Table.jsx
import React, { useState, useEffect, useRef } from "react";
import Hand from "./Hand";
import Controls from "./Controls";
import { generateDeck } from "../game/deck";
import {
  hit,
  stand,
  double,
  surrender,
  split,
  insurance,
} from "../game/actions";
import { dealerPlay } from "../game/dealerAI";
import { calculateHand, isBust, isBlackjack } from "../game/rules";
import DealingHand from "./DealingHand";
import flipCardSound from "../assets/sounds/flipcard.mp3";

export default function Table() {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [turn, setTurn] = useState("ready");
  const [message, setMessage] = useState("");
  const [insuranceBet, setInsuranceBet] = useState(0);
  const [playerBet, setPlayerBet] = useState(10);
  const [bets, setBets] = useState([10]);
  const [surrenderedHands, setSurrenderedHands] = useState([]);
  const [dealingPhase, setDealingPhase] = useState(false);
  const [dealtCards, setDealtCards] = useState([]); // Para controlar qué cartas se han repartido
  const [dealerFaceUp, setDealerFaceUp] = useState([false, false]); // Controlar cartas boca arriba del dealer
  const [balance, setBalance] = useState(250); // Balance inicial de $250
  const [baseBet, setBaseBet] = useState(10);

  const audioRef = useRef(null);

  // Cargar el sonido cuando el componente se monta
  useEffect(() => {
    audioRef.current = new Audio(flipCardSound);
    audioRef.current.volume = 0.3; // Ajustar volumen si es necesario
  }, []);

  const playCardSound = () => {
    if (audioRef.current) {
      // Reiniciar el audio si ya se estaba reproduciendo
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log("Error reproduciendo sonido:", error);
      });
    }
  };

  const startGame = () => {
    const newDeck = generateDeck();
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHands([playerCards]);
    setCurrentHandIndex(0);
    setDealerHand(dealerCards);
    setTurn("dealing");
    setMessage("");
    setInsuranceBet(0);
    setBets([baseBet]);
    setSurrenderedHands([]);
    setDealingPhase(true);
    setDealtCards([]);
    setDealerFaceUp([true, false]);

    // Iniciar reparto secuencial
    dealCardsSequentially(playerCards, dealerCards);
  };

  // Funciones para modificar la apuesta
  const increaseBet = () => {
    const newBet = baseBet + 10;
    if (newBet <= balance) {
      setBaseBet(newBet);
    }
  };

  const decreaseBet = () => {
    const newBet = baseBet - 10;
    if (newBet >= 10) {
      // Mínimo $10
      setBaseBet(newBet);
    }
  };

  const updateBalance = (amount) => {
    setBalance((prev) => prev + amount);
  };

  const dealCardsSequentially = (playerCards, dealerCards) => {
    const dealOrder = [
      { target: "player", card: playerCards[0], index: 0, handIndex: 0 },
      { target: "dealer", card: dealerCards[0], index: 0, faceUp: true },
      { target: "player", card: playerCards[1], index: 1, handIndex: 0 },
      { target: "dealer", card: dealerCards[1], index: 1, faceUp: false },
    ];

    dealOrder.forEach((deal, i) => {
      setTimeout(() => {
        playCardSound();

        setDealtCards((prev) => [...prev, deal]);

        // Actualizar estado de cartas boca arriba del dealer INMEDIATAMENTE
        if (deal.target === "dealer") {
          setDealerFaceUp((prev) => {
            const newFaceUp = [...prev];
            newFaceUp[deal.index] = deal.faceUp;
            return newFaceUp;
          });
        }

        if (i === dealOrder.length - 1) {
          setTimeout(() => {
            setDealingPhase(false);
            setTurn("player");
          }, 500);
        }
      }, i * 800);
    });
  };

  const advanceToNextHand = () => {
    if (currentHandIndex + 1 < playerHands.length) {
      setCurrentHandIndex(currentHandIndex + 1);
    } else {
      const allHandsFinished = playerHands.every(
        (hand, idx) => isBust(hand) || surrenderedHands[idx]
      );

      if (allHandsFinished) {
        setTurn("game-over");
      } else {
        setTurn("dealer");
        handleDealerTurn();
      }
    }
  };

  // CORRIGE la función calculateFinalResults:
  const calculateFinalResults = (updatedHand = null) => {
    let totalWin = 0;
    let totalLoss = 0;

    playerHands.forEach((hand, idx) => {
      const currentHandToCheck =
        idx === currentHandIndex && updatedHand ? updatedHand : hand;

      if (surrenderedHands[idx]) {
        const loss = bets[idx] / 2;
        totalLoss += loss;
        updateBalance(-loss);
        return;
      }

      if (isBust(currentHandToCheck)) {
        totalLoss += bets[idx];
      }
    });

    const netResult = totalWin - totalLoss;
    let finalMessage = "";

    if (netResult > 0) {
      finalMessage = `You won +$${netResult}`;
      updateBalance(netResult); // ← Agregar ganancias al balance
    } else if (netResult < 0) {
      finalMessage = `${netResult} lost.`;
      updateBalance(netResult); // ← Restar pérdidas del balance (netResult es negativo)
    } else {
      const totalBet = bets.reduce((sum, bet) => sum + bet, 0);
      finalMessage = `TIE`;
      // En empate no se modifica el balance
    }

    setMessage(finalMessage);
    setTurn("game-over");
  };

  const currentHand = playerHands[currentHandIndex] || [];

  const updateCurrentHand = (newHand) => {
    const handsCopy = [...playerHands];
    handsCopy[currentHandIndex] = newHand;
    setPlayerHands(handsCopy);
  };

  const handleHit = () => {
    try {
      const result = hit(currentHand, deck);
      updateCurrentHand(result.newHand);
      setDeck(result.newDeck);

      playCardSound();

      if (isBust(result.newHand)) {
        console.log("¡BUST en la mano actual!");

        const allHandsFinished = playerHands.every(
          (hand, idx) =>
            (idx === currentHandIndex
              ? isBust(result.newHand)
              : isBust(hand)) || surrenderedHands[idx]
        );

        console.log("Todas las manos terminadas?", allHandsFinished);

        if (allHandsFinished) {
          console.log(
            "Todas las manos perdidas - calculando resultados finales"
          );
          calculateFinalResults(result.newHand); // ← PASA la mano actualizada
        } else {
          console.log("Avanzando a siguiente mano");
          advanceToNextHand();
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleStand = () => {
    advanceToNextHand();
  };

  const handleDouble = () => {
    try {
      const result = double(currentHand, deck);
      updateCurrentHand(result.newHand);
      setDeck(result.newDeck);

      const newBets = [...bets];
      newBets[currentHandIndex] *= 2;
      setBets(newBets);

      advanceToNextHand();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleSurrender = () => {
    if (dealerHand[0]?.value === "A") {
      setMessage("No puedes rendirte, el dealer muestra un As");
      return;
    }

    // Marcar la mano como rendida
    const newSurrendered = [...surrenderedHands];
    newSurrendered[currentHandIndex] = true;
    setSurrenderedHands(newSurrendered);

    // Restar la mitad de la apuesta directamente
    const loss = bets[currentHandIndex] / 2;
    updateBalance(-loss);

    // SOLO mostrar mensaje si NO es la última mano
    const isLastHand = currentHandIndex === playerHands.length - 1;
    if (!isLastHand) {
      setMessage(`Te has rendido - pierdes la mitad de la apuesta ($${loss})`);
    } else {
      setMessage(`RENDICIÓN - Pierdes $${loss}`);
      setTurn("game-over");
      return; // No llamar advanceToNextHand si es la última mano
    }

    advanceToNextHand();
  };

  const handleSplit = () => {
    try {
      const result = split(currentHand, deck);

      if (result.hands) {
        const newHands = [...playerHands];
        newHands.splice(currentHandIndex, 1, ...result.hands);
        setPlayerHands(newHands);
        setDeck(result.newDeck);

        // Reproducir sonido por cada carta nueva en el split
        playCardSound();

        const newBets = [...bets];
        const currentBet = newBets[currentHandIndex];
        newBets.splice(currentHandIndex, 1, currentBet, currentBet);
        setBets(newBets);

        const newSurrendered = [...surrenderedHands];
        newSurrendered.splice(currentHandIndex, 1, false, false);
        setSurrenderedHands(newSurrendered);
      }
    } catch (error) {
      setMessage(`No se puede hacer split: ${error.message}`);
    }
  };

  const handleInsurance = () => {
    try {
      if (dealerHand[0]?.value === "A") {
        const insuranceAmount = baseBet / 2; // El seguro es la mitad de la apuesta principal

        // Verificar que tenga suficiente balance para el seguro
        if (insuranceAmount > balance) {
          setMessage("Balance insuficiente para el seguro");
          return;
        }

        setInsuranceBet(insuranceAmount);
        updateBalance(-insuranceAmount); // Restar el seguro del balance inmediatamente
        setMessage(`Seguro tomado: $${insuranceAmount}`);
      } else {
        setMessage("Seguro no disponible - dealer no muestra As");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDealerTurn = () => {
    // Primero voltear la carta oculta del dealer
    setDealerFaceUp([true, true]);
    playCardSound();

    // Pequeño delay para mostrar la carta volteada antes de empezar a repartir
    setTimeout(() => {
      let dealerFinal = [...dealerHand];
      let currentDeck = [...deck];

      // Calcular si el dealer ya tiene una mano ganadora sin necesidad de pedir más cartas
      const dealerCurrentScore = calculateHand(dealerFinal);

      // Verificar si el dealer ya gana contra todas las manos del jugador
      const dealerAlreadyWins = playerHands.every((hand, idx) => {
        if (surrenderedHands[idx] || isBust(hand)) return true;

        const playerScore = calculateHand(hand);
        return dealerCurrentScore >= playerScore;
      });

      if (dealerAlreadyWins && dealerCurrentScore >= 17) {
        // Si el dealer ya gana contra todas las manos y tiene 17 o más, no pide más cartas
        console.log("Dealer ya gana, no necesita más cartas");
        calculateDealerResults(dealerFinal);
        return;
      }

      const dealDealerCards = () => {
        const currentDealerScore = calculateHand(dealerFinal);

        // El dealer solo pide cartas si tiene menos de 17 Y no gana contra todas las manos
        if (currentDealerScore < 17) {
          setTimeout(() => {
            const newCard = currentDeck.pop();
            dealerFinal.push(newCard);

            // Reproducir sonido y actualizar estado
            playCardSound();
            setDealerHand([...dealerFinal]);

            dealDealerCards();
          }, 800);
        } else {
          // Cuando el dealer termina, calcular resultados finales
          calculateDealerResults(dealerFinal);
        }
      };

      // Iniciar el reparto secuencial del dealer
      dealDealerCards();
    }, 1000);
  };

  let finalMessage = "";

  const calculateDealerResults = (dealerFinal) => {
    const dealerScore = calculateHand(dealerFinal);
    const dealerBust = isBust(dealerFinal);
    const dealerHasBlackjack = isBlackjack(dealerFinal);

    let totalWin = 0;
    let totalLoss = 0;

    // --- Seguro ---
    if (insuranceBet > 0) {
      const messages = [];

      if (dealerHasBlackjack) {
        const insuranceWin = insuranceBet * 2;
        updateBalance(insuranceWin);
        messages.push({
          text: `¡Dealer tiene Blackjack! Ganas el seguro: +$${insuranceWin}`,
          type: "win",
        });
      } else {
        messages.push({
          text: `Dealer no tiene Blackjack - Pierdes el seguro ($${insuranceBet})`,
          type: "lose",
        });
      }

      // --- Cada mano del jugador ---
      playerHands.forEach((hand, idx) => {
        if (surrenderedHands[idx]) {
          messages.push({
            text: `Mano ${
              idx + 1
            }: Te rendiste - pierdes la mitad de la apuesta ($${
              bets[idx] / 2
            })`,
            type: "lose",
          });
          return;
        }

        const playerScore = calculateHand(hand);
        const playerBust = isBust(hand);
        const playerHasBlackjack = isBlackjack(hand);

        let handMessage = `Mano ${idx + 1}: `;
        let type = "neutral";

        if (dealerHasBlackjack && playerHasBlackjack) {
          handMessage +=
            "Push - It's a tie. Your bet is returned.";
          type = "info";
        } else if (dealerHasBlackjack) {
          totalLoss += bets[idx];
          handMessage += `${bets[idx]} lost. (Dealer got Blackjack)`;
          type = "lose";
        } else if (playerHasBlackjack) {
          const win = bets[idx] * 1.5;
          totalWin += win;
          handMessage += `Blackjack! You win $${win}`;
          type = "win";
        } else if (playerBust) {
          totalLoss += bets[idx];
          handMessage += `${bets[idx]} lost.`;
          type = "lose";
        } else if (dealerBust) {
          totalWin += bets[idx];
          handMessage += `You won $${bets[idx]}`;
          type = "win";
        } else if (playerScore > dealerScore) {
          totalWin += bets[idx];
          handMessage += `You won $${bets[idx]}`;
          type = "win";
        } else if (playerScore < dealerScore) {
          totalLoss += bets[idx];
          handMessage += `${bets[idx]} lost.`;
          type = "lose";
        } else {
          handMessage += `TIE`;
          type = "info";
        }

        messages.push({ text: handMessage, type });
      });

      // --- Resultado neto ---
      const netResult = totalWin - totalLoss;
      if (netResult !== 0) {
        updateBalance(netResult);
      }

      setMessage(messages);
      setInsuranceBet(0);
    } else {
      // --- SIN SEGURO - lógica normal ---
      playerHands.forEach((hand, idx) => {
        if (surrenderedHands[idx]) return;

        const playerScore = calculateHand(hand);
        const playerBust = isBust(hand);
        const playerHasBlackjack = isBlackjack(hand);

        if (dealerHasBlackjack) {
          if (!playerHasBlackjack) {
            totalLoss += bets[idx];
          }
        } else if (playerHasBlackjack) {
          totalWin += bets[idx] * 1.5;
        } else if (playerBust) {
          totalLoss += bets[idx];
        } else if (dealerBust) {
          totalWin += bets[idx];
        } else if (playerScore > dealerScore) {
          totalWin += bets[idx];
        } else if (playerScore < dealerScore) {
          totalLoss += bets[idx];
        }
      });

      const netResult = totalWin - totalLoss;
      let finalMessage = "";

      if (netResult > 0) {
        finalMessage = `You win +$${netResult}`;
        updateBalance(netResult);
      } else if (netResult < 0) {
        finalMessage = `You lost $${Math.abs(netResult)}`;
        updateBalance(netResult);
      } else {
        finalMessage = `TIE`;
      }

      setMessage(finalMessage);
    }

    setTurn("game-over");
  };

  // ✅ CONDICIONES PARA CONTROLES
  const canHit =
    !isBust(currentHand) &&
    !surrenderedHands[currentHandIndex] &&
    turn === "player";

  const canSplit =
    currentHand.length === 2 &&
    currentHand[0].value === currentHand[1].value &&
    playerHands.length < 4;

  const canDouble =
    currentHand.length === 2 &&
    turn === "player" &&
    !surrenderedHands[currentHandIndex] &&
    [9, 10, 11].includes(calculateHand(currentHand));

  const canSurrender =
    currentHand.length === 2 &&
    turn === "player" &&
    !surrenderedHands[currentHandIndex] &&
    dealerHand[0]?.value !== "A";

  const canInsurance =
    dealerHand[0]?.value === "A" &&
    currentHand.length === 2 &&
    insuranceBet === 0;

  // Agrega esta función en Table.jsx, antes del return
  const calculateDealerPoints = () => {
    if (dealerHand.length === 0) return 0;

    // Durante el reparto
    if (dealingPhase) {
      const visibleCards = dealerHand.filter(
        (_, index) =>
          dealerFaceUp[index] ||
          dealtCards.some(
            (deal) => deal.target === "dealer" && deal.index === index
          )
      );
      return calculateHand(visibleCards);
    }

    // Durante el turno del jugador
    if (turn === "player") {
      return dealerHand[0] ? calculateHand([dealerHand[0]]) : 0; // Solo primera carta visible
    }

    // Durante dealer o game-over
    const anySurrendered = surrenderedHands.some((s) => s === true);

    if (anySurrendered) {
      // Mostrar solo la primera carta, segunda tapada
      return dealerHand[0] ? calculateHand([dealerHand[0]]) : 0;
    }

    // Mostrar todas las cartas si nadie se rindió
    return calculateHand(dealerHand);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-gray-900">
      {/* Textura de fieltro del casino */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_49%,_rgba(255,255,255,0.02)_50%,_transparent_51%)] bg-[length:8px_8px]"></div>

      {/* Brillo ambiental */}
      <div className="absolute inset-0 hidden sm:block bg-[linear-gradient(45deg,_transparent_49%,_rgba(255,255,255,0.02)_50%,_transparent_51%)] bg-[length:8px_8px]"></div>

      <div className="h-full w-full flex flex-col safe-area-container">
        {/* Header Fijo Responsive */}
        <div className="flex-shrink-0 bg-black/60 backdrop-blur-lg border-b border-yellow-500/40 px-3 sm:px-4 py-2 pt-safe z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent drop-shadow-lg">
                BLACKJACK 21
              </h1>
              <div className="hidden xs:block text-green-300 text-xs sm:text-sm">
                Vegas Style
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-white">
              <div className="text-right">
                <div className="text-xs text-green-300">Hand</div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-cyan-400">
                  {currentHandIndex + 1}/{playerHands.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área de Juego Principal Responsive */}
        {turn !== "ready" ? (
          <div className="flex-1 min-h-0 overflow-auto p-2 sm:p-3 md:p-4 lg:p-6 pb-32">
            {/* Dealer Section */}
            <div className="flex-1 flex flex-col justify-center mb-2 sm:mb-4 md:mb-6">
              <div className="text-center mb-2 sm:mb-3">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 drop-shadow-lg">
                  DEALER
                </h2>
                {dealingPhase && (
                  <div className="inline-block bg-blue-500/30 text-blue-200 px-2 sm:px-3 py-1 rounded-full border border-blue-500/40 text-xs sm:text-sm animate-pulse">
                    🃏 Dealing...
                  </div>
                )}
                {turn === "dealer" && turn !== "game-over" && (
                  <div className="inline-block bg-red-500/30 text-red-200 px-2 sm:px-3 py-1 rounded-full border border-red-500/40 text-xs sm:text-sm animate-pulse">
                     Playing...
                  </div>
                )}
              </div>

              <div className="flex justify-center px-1">
                {dealingPhase ? (
                  <DealingHand
                    cards={dealerHand}
                    dealtCards={dealtCards}
                    target="dealer"
                    isDealer={true}
                  />
                ) : (
                  <Hand
                    cards={dealerHand}
                    faceUp={
                      turn === "dealer" || turn === "game-over"
                        ? surrenderedHands.some((s) => s === true)
                          ? [true, false] // Segunda carta tapada si alguien se rindió
                          : [true, true]
                        : dealerFaceUp
                    }
                    isDealer={true}
                    points={calculateDealerPoints()}
                  />
                )}
              </div>
            </div>

            {/* Player Section */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-2 sm:mb-3">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 drop-shadow-lg">
                  PLAYER
                </h2>
                {dealingPhase && (
                  <div className="inline-block bg-green-500/30 text-green-200 px-2 sm:px-3 py-1 rounded-full border border-green-500/40 text-xs sm:text-sm">
                    Receiving cards...
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-4xl lg:max-w-6xl px-1 sm:px-2">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                    {playerHands.map((hand, idx) => (
                      <div
                        key={idx}
                        className={`
              flex-1 min-w-[200px] max-w-[300px] 
              p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl 
              transition-all duration-300 border-2
              ${
                idx === currentHandIndex && turn === "player"
                  ? "bg-yellow-500/30 border-yellow-400 shadow-lg"
                  : "bg-white/10 border-white/20"
              }
              ${surrenderedHands[idx] ? "opacity-60 grayscale" : ""}
            `}
                      >
                        {dealingPhase ? (
                          <DealingHand
                            cards={hand}
                            dealtCards={dealtCards}
                            target="player"
                            handIndex={idx}
                          />
                        ) : (
                          <Hand
                            cards={hand}
                            faceUp={true}
                            points={hand.length > 0 ? calculateHand(hand) : 0}
                            isActive={
                              idx === currentHandIndex && turn === "player"
                            }
                          />
                        )}

                        {surrenderedHands[idx] && (
                          <div className="text-center mt-1 sm:mt-2">
                            <span className="bg-red-500/30 text-red-200 px-2 py-1 rounded text-xs border border-red-500/40">
                              🏳️ Surrendered
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex-shrink-0 mt-2 sm:mt-3 md:mt-4">
              {turn === "player" ? (
                <Controls
                  onHit={handleHit}
                  onStand={handleStand}
                  onDouble={handleDouble}
                  onSurrender={handleSurrender}
                  onSplit={handleSplit}
                  onInsurance={handleInsurance}
                  canHit={canHit}
                  canDouble={canDouble}
                  canSplit={canSplit}
                  canSurrender={canSurrender}
                  canInsurance={canInsurance}
                />
              ) : (
                <div className="text-center py-2 sm:py-3">
                  {message ? (
                    <div className="space-y-2 max-w-2xl mx-auto">
                      {Array.isArray(message) && insuranceBet === 0 ? (
                        // Mostrar array solo si hubo seguro (insuranceBet se resetea después)
                        message.map((msg, index) => (
                          <div
                            key={index}
                            className={`
            inline-block px-4 py-2 rounded-lg border text-sm
            ${
              msg.type === "win"
                ? "bg-green-500/20 text-green-200 border-green-400"
                : msg.type === "lose"
                ? "bg-red-500/20 text-red-200 border-red-400"
                : "bg-blue-500/20 text-blue-200 border-blue-400"
            }
          `}
                          >
                            {msg.text}
                          </div>
                        ))
                      ) : (
                        // Mostrar mensaje simple
                        <div
                          className={`
          inline-block px-6 py-4 rounded-xl border-2 shadow-2xl
          font-bold text-lg sm:text-xl md:text-2xl
          transform transition-all duration-500 animate-pulse
          ${
            message.includes("You win")
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-300"
              : message.includes("You lost")
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-300"
              : "bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-300"
          }
        `}
                        >
                          <div className="flex items-center justify-center gap-4">
                            <span className="font-extrabold drop-shadow-lg">
                              {message}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-white/70 text-xs sm:text-sm">
                      {turn === "dealer"
                        ? "🃏 Dealer is playing..."
                        : turn === "game-over"
                        ? "🎮 Game Over - Click New Game"
                        : turn === "ready"
                        ? "💰 Set your bet and click DEAL"
                        : "⏳ Game ready"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-8 pb-24">
            <div className="text-center max-w-2xl">
              {/* Logo/Título grande */}
              <div className="mb-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent drop-shadow-lg mb-4">
                  BLACKJACK 21
                </h1>
              </div>

              {/* Mensaje de bienvenida */}
              <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-yellow-500/30 mb-8">
                <p className="text-white/90 text-lg sm:text-xl mb-4">
                  Welcome to Blackjack
                </p>
                <p className="text-white/70 text-sm sm:text-base">
                  Make your bet and challenge the dealer!
                </p>
              </div>

              {/* Botón de inicio llamativo */}
              <button
                onClick={startGame}
                disabled={baseBet > balance}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold px-12 py-6 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:cursor-not-allowed"
              >
                START GAME
              </button>
            </div>
          </div>
        )}

        {/* Footer Responsive */}
        {/* Footer FIXED en una sola fila */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg border-t border-yellow-500/40 px-3 sm:px-4 py-2 pb-safe z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center gap-3">
              {/* Balance */}
              <div className="text-center min-w-20">
                <div className="text-xs text-green-300">Balance</div>
                <div className="text-sm sm:text-base font-bold text-white">
                  ${balance}
                </div>
              </div>

              {/* Controles de apuesta */}
              <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-yellow-500/30">
                <button
                  onClick={decreaseBet}
                  disabled={
                    baseBet <= 10 || (turn !== "ready" && turn !== "game-over")
                  }
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-200 transform hover:scale-110"
                >
                  -
                </button>

                <div className="text-center min-w-16">
                  <div className="text-xs text-yellow-300">Bet</div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    ${baseBet}
                  </div>
                </div>

                <button
                  onClick={increaseBet}
                  disabled={
                    baseBet + 10 > balance ||
                    (turn !== "ready" && turn !== "game-over")
                  }
                  className="w-8 h-8 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-200 transform hover:scale-110"
                >
                  +
                </button>
              </div>

              {/* Botón DEAL y seguro */}
              <div className="flex items-center gap-2">
                {/* Info del seguro */}
                {insuranceBet > 0 && (
                  <div className="text-yellow-300 text-xs sm:text-sm whitespace-nowrap">
                    🛡️${insuranceBet}
                  </div>
                )}

                {/* Botón DEAL */}
                {turn !== "ready" && (
                  <button
                    onClick={startGame}
                    disabled={
                      baseBet > balance ||
                      (turn !== "ready" && turn !== "game-over")
                    }
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap disabled:cursor-not-allowed"
                  >
                    DEAL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
