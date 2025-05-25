
import React, { useState, useEffect } from "react";
import { BOARD_SPACES } from "@/utils/gameConstants";
import { getSpaceTypeClass, calculateTokenOffset } from "@/utils/gameUtils";
import { Player, SpaceType } from "@/utils/gameTypes";

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerIndex }) => {
  const [animatingTiles, setAnimatingTiles] = useState<Set<number>>(new Set());
  
  // Create enhanced board layout with zigzag pattern
  const createBoardLayout = () => {
    const layout = [];
    const totalSpaces = BOARD_SPACES.length;
    const regularSpacesPerRow = 8;
    const splitStartIndex = 38; // Between 34-44 as requested
    const mergeIndex = 58; // Merge point
    
    // Regular path until split
    let currentIndex = 0;
    while (currentIndex < splitStartIndex) {
      const row = [];
      const spacesInThisRow = Math.min(regularSpacesPerRow, splitStartIndex - currentIndex);
      
      for (let i = 0; i < spacesInThisRow; i++) {
        row.push(BOARD_SPACES[currentIndex + i]);
      }
      
      // Alternate direction for zigzag
      if (layout.length % 2 === 1) {
        row.reverse();
      }
      
      layout.push(row);
      currentIndex += spacesInThisRow;
    }
    
    // Split paths (Nasty or Filthy)
    const splitLength = mergeIndex - splitStartIndex;
    const pathLength = Math.floor(splitLength / 2);
    
    // Create two parallel zigzag paths
    for (let pathRow = 0; pathRow < Math.ceil(pathLength / 2); pathRow++) {
      const leftPath = [];
      const rightPath = [];
      
      // Add two tiles per path per row
      for (let i = 0; i < 2 && currentIndex < mergeIndex; i++) {
        if (currentIndex < splitStartIndex + pathLength) {
          leftPath.push(BOARD_SPACES[currentIndex]);
        }
        currentIndex++;
        
        if (currentIndex < splitStartIndex + pathLength) {
          rightPath.push(BOARD_SPACES[currentIndex]);
        }
        currentIndex++;
      }
      
      // Add zigzag pattern
      if (pathRow % 2 === 1) {
        leftPath.reverse();
        rightPath.reverse();
      }
      
      layout.push([...leftPath, null, ...rightPath]); // null creates gap between paths
    }
    
    // Continue regular path after merge
    while (currentIndex < totalSpaces) {
      const row = [];
      const spacesInThisRow = Math.min(regularSpacesPerRow, totalSpaces - currentIndex);
      
      for (let i = 0; i < spacesInThisRow; i++) {
        row.push(BOARD_SPACES[currentIndex + i]);
      }
      
      if (layout.length % 2 === 1) {
        row.reverse();
      }
      
      layout.push(row);
      currentIndex += spacesInThisRow;
    }
    
    return layout;
  };

  const boardLayout = createBoardLayout();

  // Animate tiles on mount
  useEffect(() => {
    const animateSequentially = async () => {
      for (let i = 0; i < BOARD_SPACES.length; i++) {
        setAnimatingTiles(prev => new Set([...prev, i]));
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay
      }
    };
    
    animateSequentially();
  }, []);

  // Find all players on each space for positioning
  const playersOnSpace: Record<number, number[]> = {};
  players.forEach(player => {
    if (!playersOnSpace[player.position]) {
      playersOnSpace[player.position] = [];
    }
    playersOnSpace[player.position].push(player.id);
  });

  const getMovementAnimationClass = (player: Player) => {
    if (!player.movementStyle) return '';
    return `movement-${player.movementStyle}`;
  };

  const renderSpace = (space: any, rowIndex: number, colIndex: number) => {
    if (!space) return <div key={`empty-${rowIndex}-${colIndex}`} className="aspect-square" />;
    
    const isEven = space.id % 2 === 0;
    const baseClass = isEven ? 'bg-game-board-light' : 'bg-game-board-dark';
    const spaceTypeClass = getSpaceTypeClass(space.type);
    const playersHere = playersOnSpace[space.id] || [];
    const isAnimating = animatingTiles.has(space.id);
    
    // Increase tile size by 20%
    const tileClass = `relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium border border-gray-300 transform scale-120 ${baseClass} ${spaceTypeClass} ${isAnimating ? 'tile-drop-animation' : ''}`;
    
    return (
      <div key={space.id} className={tileClass}>
        <span className="text-xs font-medium">{space.id + 1}</span>
        
        {/* Special space type labels with custom fonts */}
        {space.type === SpaceType.FINISH && (
          <div className="absolute top-0 left-0 w-full text-[8px] text-center">
            <span className="nasty-title text-[#FB007C]">Nasty</span>
            <span className="mx-1">or</span>
            <span className="filthy-title text-[#FB007C]">Filthy</span>
          </div>
        )}
        {space.type !== SpaceType.REGULAR && space.type !== SpaceType.FINISH && (
          <div className="absolute top-0 left-0 w-full text-[8px] text-center">
            {space.type}
          </div>
        )}
        
        {/* Player tokens - 100% of tile size */}
        {playersHere.map(playerId => {
          const player = players.find(p => p.id === playerId)!;
          const offset = calculateTokenOffset(playerId, space.id, playersHere);
          const isCurrentPlayer = player.id === players[currentPlayerIndex].id;
          const movementClass = isCurrentPlayer ? getMovementAnimationClass(player) : '';
          
          return (
            <div
              key={`token-${player.id}`}
              className={`absolute rounded-full border-2 border-white ${isCurrentPlayer ? 'animate-pulse' : ''} ${movementClass}`}
              style={{ 
                backgroundColor: player.color,
                width: '75%', // 75% of tile fills most of the space
                height: '75%',
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
  };

  return (
    <div className="bg-[#6604A0] p-6 rounded-lg shadow-md w-full border border-[#0085FB] max-h-[80vh] overflow-hidden">
      <h2 className="text-2xl font-bold text-[#FB007C] mb-4 text-center">
        <span className="nasty-title">Nasty</span>
        <span className="mx-2">or</span>
        <span className="filthy-title">Filthy</span>
        <span className="ml-2">Board</span>
      </h2>
      
      <div className="flex flex-col gap-2 max-w-full overflow-x-auto">
        {boardLayout.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`flex gap-2 justify-center min-w-max ${rowIndex % 2 === 1 ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {row.map((space, colIndex) => renderSpace(space, rowIndex, colIndex))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
