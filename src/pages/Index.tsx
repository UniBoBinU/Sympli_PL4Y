import React, { useState, useCallback, useEffect } from "react";
import { 
  GamePhase, 
  Player, 
  GameState,
  GameEvent,
  Action,
  ActionType
} from "@/utils/gameTypes";
import { 
  DEFAULT_ACTION_CATEGORIES,
  DEFAULT_TIMER_DURATION,
  POSITION_TIMER_DURATION,
  SAMPLE_ACTIONS
} from "@/utils/gameConstants";
import {
  getRandomAction,
  createGameEvent
} from "@/utils/gameUtils";
import PlayerSetup from "@/components/PlayerSetup";
import ClassDice from "@/components/ClassDice";
import PlayerInfo from "@/components/PlayerInfo";
import ActionCard from "@/components/ActionCard";
import GameHistory from "@/components/GameHistory";
import Timer from "@/components/Timer";
import TopBar from "@/components/TopBar";
import { useToast } from "@/hooks/use-toast";

// Min and max timer duration in seconds (2-5 minutes)
const MIN_TIMER_DURATION = 120; 
const MAX_TIMER_DURATION = 300;

// Position prompts for Position tiles
const POSITION_PROMPTS = [
  "Mmmm like this — reenact the position and choose an action to perform in it.",
  "Photo-Op! Reenact the position and let another player take a picture.",
  "Sexy Selfie! Reenact the position, take a selfie, then send it to another player."
];

// Available classes for the dice
const DICE_CLASSES = ['intimate', 'playful', 'daring', 'naughty', 'wild', 'extreme'];

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
  
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [canRoll, setCanRoll] = useState<boolean>(true);

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

  // Advance to the next player
  const advanceToNextPlayer = useCallback(() => {
    setGameState(prev => {
      let nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      
      const updatedPlayers = [...prev.players];
      if (updatedPlayers[nextPlayerIndex].skipTurn) {
        updatedPlayers[nextPlayerIndex] = {
          ...updatedPlayers[nextPlayerIndex],
          skipTurn: false
        };
        
        const skipEvent = createGameEvent(
          updatedPlayers[nextPlayerIndex].id,
          "SKIP_TURN",
          "Turn skipped due to penalty"
        );
        
        nextPlayerIndex = (nextPlayerIndex + 1) % prev.players.length;
        
        return {
          ...prev,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
          history: [...prev.history, skipEvent]
        };
      }
      
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
    
    setDiceRolling(false);
    setCanRoll(true);
    setSelectedClass(null);
  }, []);

  // Handle player setup completion
  const handlePlayersConfirmed = (players: Player[]) => {
    const initialTimerDuration = getRandomTimerDuration();
    
    const startEvent: GameEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      playerId: players[0].id,
      type: "GAME_START",
      description: "Game started! Let's roll!"
    };
    
    setGameState({
      phase: GamePhase.PLAYING,
      players,
      currentPlayerIndex: 0,
      currentAction: null,
      timerActive: false,
      timerDuration: initialTimerDuration,
      timerRemaining: initialTimerDuration,
      history: [startEvent],
      actionCategories: DEFAULT_ACTION_CATEGORIES
    });
    
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
    
    // Select random class
    const randomClass = DICE_CLASSES[Math.floor(Math.random() * DICE_CLASSES.length)];
    setSelectedClass(randomClass);
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    const rollEvent = createGameEvent(
      currentPlayer.id,
      "DICE_ROLL",
      `Rolled: ${randomClass}`
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
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      rerolls: currentPlayer.rerolls - 1
    };
    
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
    
    handleRollDice();
  }, [canRoll, gameState.players, gameState.currentPlayerIndex, handleRollDice, toast]);

  // Handle dice roll completion
  const handleDiceRollComplete = useCallback(() => {
    if (!selectedClass) return;
    
    setDiceRolling(false);
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Create activeCategories object with only the selected class set to true
    const activeCategories = { [selectedClass]: true };
    
    // Get action based on selected class
    const action = getRandomAction(activeCategories);
    
    if (action) {
      const timer = action.type === ActionType.POSITION ? 
        POSITION_TIMER_DURATION : gameState.timerDuration;
      
      const actionEvent = createGameEvent(
        currentPlayer.id,
        "ACTION",
        `Drew ${selectedClass} action: ${action.text}`
      );
      
      setGameState(prev => ({
        ...prev,
        currentAction: action,
        timerActive: true,
        history: [...prev.history, actionEvent]
      }));
    } else {
      setTimeout(() => {
        advanceToNextPlayer();
      }, 1500);
    }
  }, [selectedClass, gameState.players, gameState.currentPlayerIndex, gameState.timerDuration, advanceToNextPlayer]);

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
    
    const choiceEvent = createGameEvent(
      currentPlayer.id,
      "CHOICE",
      `Chose: ${option}`
    );
    
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, choiceEvent]
    }));
    
    handleActionComplete();
  }, [gameState.players, gameState.currentPlayerIndex, handleActionComplete]);

  // Handle Next Turn button click
  const handleNextTurn = useCallback(() => {
    handleActionComplete();
    advanceToNextPlayer();
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
    setSelectedClass(null);
    setDiceRolling(false);
    setCanRoll(true);
    
    toast({
      title: "Game Reset",
      description: "Starting a new game"
    });
  };

  if (gameState.phase === GamePhase.SETUP) {
    return (
      <>
        <TopBar onResetGame={handleResetGame} />
        <div className="min-h-screen bg-[#6604A0] pt-20 py-12 px-4">
          <PlayerSetup onPlayersConfirmed={handlePlayersConfirmed} />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar onResetGame={handleResetGame} />
      <div className="min-h-screen bg-[#6604A0] pt-20 p-4 text-[#FB007C]">
        <div className="container mx-auto h-[calc(100vh-6rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Left column: Class Dice */}
            <div className="h-full flex items-center justify-center">
              <ClassDice 
                selectedClass={selectedClass}
                rolling={diceRolling}
                onRollComplete={handleDiceRollComplete}
                classes={DICE_CLASSES}
              />
            </div>
            
            {/* Right column: Controls and info */}
            <div className="h-full flex flex-col space-y-4 max-h-[calc(100vh-8rem)] overflow-hidden">
              {/* Player Info */}
              <div className="shrink-0">
                <PlayerInfo 
                  players={gameState.players}
                  currentPlayerIndex={gameState.currentPlayerIndex}
                  onRollDice={handleRollDice}
                  onReroll={handleReroll}
                  canRoll={canRoll}
                />
              </div>
              
              {/* Timer */}
              <div className="shrink-0">
                <Timer 
                  duration={gameState.timerDuration}
                  isActive={gameState.timerActive}
                  onComplete={handleTimerComplete}
                  onReset={resetTimer}
                />
              </div>
              
              {/* Actions container */}
              <div className="flex-1 flex flex-col justify-end space-y-4 min-h-0">
                <div className="shrink-0">
                  <ActionCard 
                    action={gameState.currentAction}
                    onComplete={handleNextTurn}
                    onChoice={handleActionChoice}
                  />
                </div>
                
                <div className="shrink-0">
                  <GameHistory 
                    events={gameState.history}
                    players={gameState.players}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
