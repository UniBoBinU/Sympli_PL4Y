import React, { useState, useCallback, useEffect } from "react";
import { 
  GamePhase, 
  Player, 
  GameState,
  GameEvent,
  Action,
  Space
} from "@/utils/gameTypes";
import { 
  BOARD_SPACES, 
  DEFAULT_ACTION_CATEGORIES,
  DEFAULT_TIMER_DURATION,
  POSITION_TIMER_DURATION,
  SAMPLE_ACTIONS
} from "@/utils/gameConstants";
import {
  rollDice,
  calculateNewPosition,
  applySpaceEffect,
  getRandomAction,
  createGameEvent
} from "@/utils/gameUtils";
import PlayerSetup from "@/components/PlayerSetup";
import GameBoard from "@/components/GameBoard";
import Dice from "@/components/Dice";
import PlayerInfo from "@/components/PlayerInfo";
import ActionCard from "@/components/ActionCard";
import GameHistory from "@/components/GameHistory";
import Timer from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Min and max timer duration in seconds (2-5 minutes)
const MIN_TIMER_DURATION = 120; 
const MAX_TIMER_DURATION = 300;

const Index = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.SETUP,
    players: [],
    currentPlayerIndex: 0,
    currentAction: null,
    timerActive: false,
    timerDuration: DEFAULT_TIMER_DURATION,
    timerRemaining: DEFAULT_TIMER_DURATION,
    history: [],
    actionCategories: DEFAULT_ACTION_CATEGORIES
  });
  
  const [diceValue, setDiceValue] = useState<number>(1);
  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [canRoll, setCanRoll] = useState<boolean>(true);
  const [processedRoll, setProcessedRoll] = useState<boolean>(false);

  // Generate a random timer duration between MIN and MAX
  const getRandomTimerDuration = useCallback(() => {
    return Math.floor(Math.random() * (MAX_TIMER_DURATION - MIN_TIMER_DURATION + 1)) + MIN_TIMER_DURATION;
  }, []);

  // Reset timer with a new random duration
  const resetTimer = useCallback(() => {
    const newDuration = getRandomTimerDuration();
    setGameState(prev => ({
      ...prev,
      timerDuration: newDuration,
      timerRemaining: newDuration,
      timerActive: true
    }));
  }, [getRandomTimerDuration]);

  // Advance to the next player - MOVED THIS UP to fix the declaration order issue
  const advanceToNextPlayer = useCallback(() => {
    setGameState(prev => {
      // Find the next player who doesn't have skipTurn
      let nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      
      // If the next player has skipTurn flag, set it to false and find the next player
      const updatedPlayers = [...prev.players];
      if (updatedPlayers[nextPlayerIndex].skipTurn) {
        updatedPlayers[nextPlayerIndex] = {
          ...updatedPlayers[nextPlayerIndex],
          skipTurn: false
        };
        
        // Log the skipped turn
        const skipEvent = createGameEvent(
          updatedPlayers[nextPlayerIndex].id,
          "SKIP_TURN",
          "Turn skipped due to penalty"
        );
        
        // Move to the next player
        nextPlayerIndex = (nextPlayerIndex + 1) % prev.players.length;
        
        return {
          ...prev,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
          history: [...prev.history, skipEvent]
        };
      }
      
      // Next player's turn event
      const turnEvent = createGameEvent(
        updatedPlayers[nextPlayerIndex].id,
        "TURN_START",
        `${updatedPlayers[nextPlayerIndex].name}'s turn`
      );
      
      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        history: [...prev.history, turnEvent]
      };
    });
    
    // Reset dice state and allow rolling again
    setDiceRolling(false);
    setCanRoll(true);
    setProcessedRoll(false);
  }, []);

  // Handle player setup completion
  const handlePlayersConfirmed = (players: Player[]) => {
    // Initialize with random timer duration
    const initialTimerDuration = getRandomTimerDuration();
    
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.PLAYING,
      players,
      timerDuration: initialTimerDuration,
      timerRemaining: initialTimerDuration
    }));
    
    // Add game start event
    const startEvent: GameEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      playerId: players[0].id,
      type: "GAME_START",
      description: "Game started! Let's roll!"
    };
    
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.PLAYING,
      players,
      history: [startEvent],
      timerDuration: initialTimerDuration,
      timerRemaining: initialTimerDuration
    }));
    
    toast({
      title: "Game Started!",
      description: `${players.length} players have joined the game.`
    });
  };

  // Handle dice rolling
  const handleRollDice = useCallback(() => {
    if (!canRoll) return;
    
    setDiceRolling(true);
    setCanRoll(false);
    setProcessedRoll(false);
    
    const roll = rollDice();
    setDiceValue(roll);
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Log the dice roll
    const rollEvent = createGameEvent(
      currentPlayer.id,
      "DICE_ROLL",
      `Rolled a ${roll}`
    );
    
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, rollEvent]
    }));
  }, [canRoll, gameState.players, gameState.currentPlayerIndex]);

  // Handle re-roll
  const handleReroll = useCallback(() => {
    if (!canRoll) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer.rerolls <= 0) {
      toast({
        title: "No Re-rolls Left",
        description: `${currentPlayer.name} has no more re-rolls available.`,
        variant: "destructive"
      });
      return;
    }
    
    // Update player's re-roll count
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      rerolls: currentPlayer.rerolls - 1
    };
    
    // Log the re-roll
    const rerollEvent = createGameEvent(
      currentPlayer.id,
      "RE_ROLL",
      `Used a re-roll (${currentPlayer.rerolls - 1} left)`
    );
    
    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      history: [...prev.history, rerollEvent]
    }));
    
    // Trigger the dice roll
    handleRollDice();
  }, [canRoll, gameState.players, gameState.currentPlayerIndex, handleRollDice, toast]);

  // Handle dice roll completion
  const handleDiceRollComplete = useCallback(() => {
    // Prevent multiple executions of this function for a single dice roll
    if (processedRoll || !diceRolling) return;
    
    setProcessedRoll(true);
    setDiceRolling(false);
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Calculate new position
    const newPosition = calculateNewPosition(
      currentPlayer.position,
      diceValue,
      BOARD_SPACES.length
    );
    
    // Update player position
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      position: newPosition
    };
    
    // Log the movement
    const moveEvent = createGameEvent(
      currentPlayer.id,
      "MOVE",
      `Moved to space ${newPosition + 1}`
    );
    
    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      history: [...prev.history, moveEvent]
    }));
    
    // Apply space effect
    const currentSpace = BOARD_SPACES[newPosition];
    if (currentSpace.effect) {
      const updatedPlayer = applySpaceEffect(
        updatedPlayers[gameState.currentPlayerIndex],
        currentSpace,
        BOARD_SPACES.length
      );
      
      updatedPlayers[gameState.currentPlayerIndex] = updatedPlayer;
      
      // Log the space effect
      let effectDescription = "";
      switch (currentSpace.effect.type) {
        case "MOVE_FORWARD":
          effectDescription = `Bonus: Moved forward ${currentSpace.effect.value} spaces`;
          break;
        case "MOVE_BACKWARD":
          effectDescription = `Penalty: Moved back ${currentSpace.effect.value} spaces`;
          break;
        case "SKIP_TURN":
          effectDescription = "Penalty: Will skip next turn";
          break;
        case "EXTRA_ACTION":
          effectDescription = "Bonus: Gained an extra action";
          break;
        case "FINISH":
          effectDescription = "Reached the finish line!";
          break;
        default:
          break;
      }
      
      if (effectDescription) {
        const effectEvent = createGameEvent(
          currentPlayer.id,
          "SPACE_EFFECT",
          effectDescription
        );
        
        setGameState(prev => ({
          ...prev,
          players: updatedPlayers,
          history: [...prev.history, effectEvent]
        }));
      }
    }
    
    // Draw a random action
    const action = getRandomAction(gameState.actionCategories);
    
    if (action) {
      // Set the timer duration based on action type
      const timer = action.type === "POSITION" ? 
        POSITION_TIMER_DURATION : gameState.timerDuration;
      
      const actionEvent = createGameEvent(
        currentPlayer.id,
        "ACTION",
        `Drew action: ${action.text}`
      );
      
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        currentAction: action,
        timerActive: true,
        history: [...prev.history, actionEvent]
      }));
    } else {
      // No action available or filtered out
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        currentAction: null
      }));
      
      // Proceed to the next player
      setTimeout(() => {
        advanceToNextPlayer();
      }, 1500);
    }
  }, [diceValue, gameState.players, gameState.currentPlayerIndex, gameState.actionCategories, diceRolling, processedRoll, gameState.timerDuration, advanceToNextPlayer]);

  // Handle action completion
  const handleActionComplete = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentAction: null,
      timerActive: false
    }));
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    toast({
      title: "Time's Up!",
      description: "The timer has run out."
    });
    
    handleActionComplete();
  }, [handleActionComplete, toast]);

  // Handle choice selection in action card
  const handleActionChoice = useCallback((option: string) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Log the choice
    const choiceEvent = createGameEvent(
      currentPlayer.id,
      "CHOICE",
      `Chose: ${option}`
    );
    
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, choiceEvent]
    }));
    
    // Complete the action
    handleActionComplete();
  }, [gameState.players, gameState.currentPlayerIndex, handleActionComplete]);

  // Handle Next Turn button click
  const handleNextTurn = useCallback(() => {
    // First complete the current action if any
    handleActionComplete();
    
    // Then advance to the next player
    advanceToNextPlayer();
    
    // Reset the timer with a new random duration
    resetTimer();
  }, [handleActionComplete, advanceToNextPlayer, resetTimer]);

  // Reset the game
  const handleResetGame = () => {
    setGameState({
      phase: GamePhase.SETUP,
      players: [],
      currentPlayerIndex: 0,
      currentAction: null,
      timerActive: false,
      timerDuration: DEFAULT_TIMER_DURATION,
      timerRemaining: DEFAULT_TIMER_DURATION,
      history: [],
      actionCategories: DEFAULT_ACTION_CATEGORIES
    });
    setDiceValue(1);
    setDiceRolling(false);
    setCanRoll(true);
    setProcessedRoll(false);
    
    toast({
      title: "Game Reset",
      description: "Starting a new game"
    });
  };

  // Connect dice roll animation completion to position update
  useEffect(() => {
    if (!diceRolling) return;
    // Dice rolling logic is handled by the Dice component
  }, [diceRolling]);

  if (gameState.phase === GamePhase.SETUP) {
    return (
      <div className="min-h-screen bg-[#6604A0] py-12 px-4">
        <PlayerSetup onPlayersConfirmed={handlePlayersConfirmed} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#6604A0] p-4 text-[#FB007C]">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#FB007C]">Board Game</h1>
          <Button onClick={handleResetGame} variant="outline" className="bg-[#0085FB] text-[#6604A0] hover:bg-[#0085FB]/80">New Game</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Game board */}
          <div className="md:col-span-2">
            <GameBoard 
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
            />
          </div>
          
          {/* Right column: Controls and info */}
          <div className="space-y-6">
            {/* Player info and dice */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Dice 
                  value={diceValue}
                  rolling={diceRolling}
                  onRollComplete={handleDiceRollComplete}
                />
              </div>
              <div>
                <PlayerInfo 
                  players={gameState.players}
                  currentPlayerIndex={gameState.currentPlayerIndex}
                  onRollDice={handleRollDice}
                  onReroll={handleReroll}
                  canRoll={canRoll}
                />
              </div>
            </div>
            
            {/* Action card */}
            <ActionCard 
              action={gameState.currentAction}
              onComplete={handleNextTurn}
              onChoice={handleActionChoice}
              nextTurnLabel="Next Turn"
            />
            
            {/* Timer */}
            <Timer 
              duration={gameState.timerDuration}
              isActive={gameState.timerActive}
              onComplete={handleTimerComplete}
              onReset={resetTimer}
            />
            
            {/* Game history */}
            <GameHistory 
              events={gameState.history}
              players={gameState.players}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
