
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAX_PLAYERS, PLAYER_COLORS } from "@/utils/gameConstants";
import { Player, PlayerColor } from "@/utils/gameTypes";

interface PlayerSetupProps {
  onPlayersConfirmed: (players: Player[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onPlayersConfirmed }) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<Partial<Player>[]>(
    Array(playerCount).fill(null).map((_, i) => ({
      id: i,
      name: "",
      color: PLAYER_COLORS[i]
    }))
  );
  const [nameError, setNameError] = useState<boolean>(false);

  const handlePlayerCountChange = (value: string) => {
    const count = parseInt(value, 10);
    setPlayerCount(count);
    
    // Update players array with the new count
    if (count > players.length) {
      // Add new players
      const newPlayers = [...players];
      for (let i = players.length; i < count; i++) {
        newPlayers.push({
          id: i,
          name: "",
          color: PLAYER_COLORS[i % PLAYER_COLORS.length]
        });
      }
      setPlayers(newPlayers);
    } else if (count < players.length) {
      // Remove excess players
      setPlayers(players.slice(0, count));
    }
  };

  const handleNameChange = (index: number, name: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], name };
    setPlayers(updatedPlayers);
    setNameError(false);
  };

  const handleColorChange = (index: number, color: PlayerColor) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], color };
    setPlayers(updatedPlayers);
  };

  const handleStartGame = () => {
    // Validate all players have names
    if (players.some(player => !player.name || player.name.trim() === "")) {
      setNameError(true);
      return;
    }

    // Create full player objects
    const completePlayers = players.map(player => ({
      id: player.id!,
      name: player.name!,
      color: player.color!,
      position: 0,
      rerolls: 3,
      extraActions: 0,
      skipTurn: false
    }));

    onPlayersConfirmed(completePlayers as Player[]);
  };

  // Colors available in the color picker
  const colorOptions = PLAYER_COLORS.map(color => (
    <div 
      key={color} 
      className="w-6 h-6 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-800"
      style={{ backgroundColor: color }}
    />
  ));

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-3xl font-bold text-game-primary mb-6">Player Setup</h2>
      
      <div className="w-full mb-8">
        <label className="block text-sm font-medium mb-2">Number of Players</label>
        <Select 
          value={playerCount.toString()} 
          onValueChange={handlePlayerCountChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select number of players" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1).map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? 'Player' : 'Players'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-4 mb-8">
        {players.map((player, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0 rounded-full" style={{ backgroundColor: player.color }} />
            
            <div className="flex-1">
              <Input
                placeholder={`Player ${index + 1} name`}
                value={player.name || ""}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className={nameError && !player.name ? "border-red-500" : ""}
              />
            </div>
            
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full p-0"
                style={{ backgroundColor: player.color }}
                onClick={() => {
                  // In a complete implementation, you would open a color picker here
                  // For simplicity, we'll just cycle through predefined colors
                  const currentIndex = PLAYER_COLORS.indexOf(player.color!);
                  const nextIndex = (currentIndex + 1) % PLAYER_COLORS.length;
                  handleColorChange(index, PLAYER_COLORS[nextIndex]);
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {nameError && (
        <p className="text-red-500 mb-4">Please enter names for all players</p>
      )}

      <Button 
        className="bg-game-primary hover:bg-game-secondary w-full"
        onClick={handleStartGame}
      >
        Start Game
      </Button>
    </div>
  );
};

export default PlayerSetup;
