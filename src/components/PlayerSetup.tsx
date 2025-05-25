
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

type MovementStyle = "bounce" | "slip" | "tug" | "rub" | "grind" | "thrust";

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onPlayersConfirmed }) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<Partial<Player & { movementStyle: MovementStyle }>[]>(
    Array(playerCount).fill(null).map((_, i) => ({
      id: i,
      name: "",
      color: PLAYER_COLORS[i],
      movementStyle: "bounce"
    }))
  );
  const [nameError, setNameError] = useState<boolean>(false);

  const movementStyles: MovementStyle[] = ["bounce", "slip", "tug", "rub", "grind", "thrust"];

  const handlePlayerCountChange = (value: string) => {
    const count = parseInt(value, 10);
    setPlayerCount(count);
    
    if (count > players.length) {
      const newPlayers = [...players];
      for (let i = players.length; i < count; i++) {
        newPlayers.push({
          id: i,
          name: "",
          color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          movementStyle: "bounce"
        });
      }
      setPlayers(newPlayers);
    } else if (count < players.length) {
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

  const handleMovementStyleChange = (index: number, style: MovementStyle) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], movementStyle: style };
    setPlayers(updatedPlayers);
  };

  const handleStartGame = () => {
    if (players.some(player => !player.name || player.name.trim() === "")) {
      setNameError(true);
      return;
    }

    const completePlayers = players.map(player => ({
      id: player.id!,
      name: player.name!,
      color: player.color!,
      position: 0,
      rerolls: 3,
      extraActions: 0,
      skipTurn: false,
      movementStyle: player.movementStyle || "bounce"
    }));

    onPlayersConfirmed(completePlayers as Player[]);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
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

      <div className="w-full space-y-6 mb-8">
        {players.map((player, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 flex-shrink-0 rounded-full" style={{ backgroundColor: player.color }} />
              
              <div className="flex-1">
                <Input
                  placeholder={`Player ${index + 1} name`}
                  value={player.name || ""}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className={nameError && !player.name ? "border-red-500" : ""}
                />
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full p-0"
                style={{ backgroundColor: player.color }}
                onClick={() => {
                  const currentIndex = PLAYER_COLORS.indexOf(player.color!);
                  const nextIndex = (currentIndex + 1) % PLAYER_COLORS.length;
                  handleColorChange(index, PLAYER_COLORS[nextIndex]);
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Movement Style</label>
              <div className="grid grid-cols-3 gap-2">
                {movementStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleMovementStyleChange(index, style)}
                    className={`px-3 py-2 text-sm rounded transition-colors capitalize ${
                      player.movementStyle === style
                        ? 'bg-game-primary text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
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
