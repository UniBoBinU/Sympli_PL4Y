
import React from "react";
import { BOARD_SPACES } from "@/utils/gameConstants";
import { getSpaceTypeClass, calculateTokenOffset } from "@/utils/gameUtils";
import { Player, SpaceType } from "@/utils/gameTypes";

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerIndex }) => {
  // Calculate how many spaces to display per row
  const spacesPerRow = 8; // We'll arrange it as a 4x8 grid
  
  // Create rows of spaces
  const rows = [];
  for (let i = 0; i < BOARD_SPACES.length; i += spacesPerRow) {
    const rowSpaces = BOARD_SPACES.slice(i, i + spacesPerRow);
    // Alternate direction of rows for zigzag pattern
    if ((i / spacesPerRow) % 2 === 1) {
      rowSpaces.reverse();
    }
    rows.push(rowSpaces);
  }

  // Find all players on each space for positioning
  const playersOnSpace: Record<number, number[]> = {};
  players.forEach(player => {
    if (!playersOnSpace[player.position]) {
      playersOnSpace[player.position] = [];
    }
    playersOnSpace[player.position].push(player.id);
  });

  return (
    <div className="bg-purple-800 p-4 rounded-lg shadow-md w-full border border-cyan-400">
      <h2 className="text-2xl font-bold text-magenta-400 mb-4 text-center">Game Board</h2>
      
      <div className="flex flex-col gap-1">
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`flex ${rowIndex % 2 === 1 ? 'flex-row-reverse' : 'flex-row'} gap-1`}
          >
            {row.map((space) => {
              const isEven = space.id % 2 === 0;
              const baseClass = isEven ? 'bg-game-board-light' : 'bg-game-board-dark';
              const spaceTypeClass = getSpaceTypeClass(space.type);
              const playersHere = playersOnSpace[space.id] || [];
              
              return (
                <div 
                  key={space.id} 
                  className={`relative flex-1 aspect-square flex items-center justify-center rounded ${baseClass} ${spaceTypeClass} border border-gray-300`}
                >
                  <span className="text-xs font-medium">{space.id + 1}</span>
                  
                  {space.type !== SpaceType.REGULAR && space.type !== SpaceType.POSITION && (
                    <div className="absolute top-0 left-0 w-full text-[8px] text-center">
                      {space.type}
                    </div>
                  )}
                  
                  {/* Show POSITION type without the space number */}
                  {space.type === SpaceType.POSITION && (
                    <div className="absolute top-0 left-0 w-full text-[8px] text-center">
                      {space.type}
                    </div>
                  )}
                  
                  {/* Player tokens */}
                  {playersHere.map(playerId => {
                    const player = players.find(p => p.id === playerId)!;
                    const offset = calculateTokenOffset(playerId, space.id, playersHere);
                    const isCurrentPlayer = player.id === players[currentPlayerIndex].id;
                    
                    return (
                      <div
                        key={`token-${player.id}`}
                        className={`absolute w-4 h-4 rounded-full border-2 border-white ${isCurrentPlayer ? 'animate-pulse' : ''}`}
                        style={{ 
                          backgroundColor: player.color,
                          top: `calc(50% + ${offset.top}px)`,
                          left: `calc(50% + ${offset.left}px)`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: isCurrentPlayer ? 10 : 5
                        }}
                        title={player.name}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
