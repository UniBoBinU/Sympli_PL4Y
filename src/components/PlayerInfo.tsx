
import React from "react";
import { Player } from "@/utils/gameTypes";
import { Button } from "@/components/ui/button";
import { BOARD_SPACES } from "@/utils/gameConstants";

interface PlayerInfoProps {
  players: Player[];
  currentPlayerIndex: number;
  onRollDice: () => void;
  onReroll: () => void;
  canRoll: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({
  players,
  currentPlayerIndex,
  onRollDice,
  onReroll,
  canRoll
}) => {
  const currentPlayer = players[currentPlayerIndex];
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Current Player</h2>
      
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: currentPlayer.color }}
        />
        <div className="font-bold text-lg">{currentPlayer.name}</div>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Position:</span>
          <span>Space {currentPlayer.position + 1} of {BOARD_SPACES.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Re-rolls:</span>
          <span>{currentPlayer.rerolls}</span>
        </div>
        <div className="flex justify-between">
          <span>Extra Actions:</span>
          <span>{currentPlayer.extraActions}</span>
        </div>
        {currentPlayer.skipTurn && (
          <div className="flex justify-between text-game-penalty">
            <span>Status:</span>
            <span>Skip Next Turn</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <Button 
          onClick={onRollDice}
          disabled={!canRoll || currentPlayer.skipTurn}
          className="bg-game-primary hover:bg-game-secondary"
        >
          Roll Dice
        </Button>
        
        <Button 
          onClick={onReroll}
          disabled={!canRoll || currentPlayer.rerolls <= 0 || currentPlayer.skipTurn}
          variant="outline"
        >
          Re-roll ({currentPlayer.rerolls} left)
        </Button>
      </div>
      
      <div className="mt-6 p-3 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-1">All Players</h3>
        <div className="space-y-1">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className={`flex items-center gap-2 ${index === currentPlayerIndex ? 'font-bold' : ''}`}
            >
              <div 
                className={`w-3 h-3 rounded-full flex-shrink-0 ${index === currentPlayerIndex ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: player.color }}
              />
              <div className="text-sm">{player.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
