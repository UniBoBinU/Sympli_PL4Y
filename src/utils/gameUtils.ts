
import { Action, ActionType, GameEvent, Player, Space, SpaceType } from "./gameTypes";
import { BOARD_SPACES, SAMPLE_ACTIONS } from "./gameConstants";

// Generate a random integer between min and max (inclusive)
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Roll a dice and get a value between 1-6
export const rollDice = (): number => {
  return getRandomInt(1, 6);
};

// Get a random action from the available actions, filtered by active categories
export const getRandomAction = (activeCategories: Record<string, boolean>): Action | null => {
  // Filter the actions based on the active categories
  // In a full implementation, this would load from the JSON file
  const filteredActions = SAMPLE_ACTIONS.filter(action => {
    if (!action.category) return true;
    return action.category.some(cat => activeCategories[cat]);
  });

  if (filteredActions.length === 0) {
    return null;
  }

  const randomIndex = getRandomInt(0, filteredActions.length - 1);
  return filteredActions[randomIndex];
};

// Calculate the new position after a dice roll
export const calculateNewPosition = (
  currentPosition: number,
  diceValue: number,
  spaceCount: number
): number => {
  const newPosition = currentPosition + diceValue;
  // If the new position exceeds the board size, player stays in place
  // In a real game, you might want different rules here
  return newPosition >= spaceCount ? spaceCount - 1 : newPosition;
};

// Apply the effect of a space to a player
export const applySpaceEffect = (
  player: Player,
  space: Space,
  spaceCount: number
): Player => {
  if (!space.effect) {
    return player;
  }

  const updatedPlayer = { ...player };

  switch (space.effect.type) {
    case "MOVE_FORWARD":
      updatedPlayer.position = Math.min(
        player.position + (space.effect.value || 0),
        spaceCount - 1
      );
      break;
    case "MOVE_BACKWARD":
      updatedPlayer.position = Math.max(
        player.position - (space.effect.value || 0),
        0
      );
      break;
    case "SKIP_TURN":
      updatedPlayer.skipTurn = true;
      break;
    case "EXTRA_ACTION":
      updatedPlayer.extraActions += 1;
      break;
    case "FINISH":
      // No need to update position, it's already at the finish
      break;
    default:
      break;
  }

  return updatedPlayer;
};

// Create a game event
export const createGameEvent = (
  playerId: number,
  type: string,
  description: string
): GameEvent => {
  return {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    playerId,
    type,
    description,
  };
};

// Calculate token positioning when multiple tokens are on the same space
export const calculateTokenOffset = (
  playerId: number,
  position: number,
  playersOnSameSpace: number[]
): { top: number; left: number } => {
  // Find this player's index in the array of players on the same space
  const indexInSameSpace = playersOnSameSpace.indexOf(playerId);
  
  // Calculate offset based on how many players are on this space
  const count = playersOnSameSpace.length;
  let offsetX = 0;
  let offsetY = 0;
  
  if (count === 2) {
    // Two players: left and right
    offsetX = indexInSameSpace === 0 ? -10 : 10;
  } else if (count === 3) {
    // Three players: triangle formation
    if (indexInSameSpace === 0) {
      offsetY = -8;
    } else if (indexInSameSpace === 1) {
      offsetX = -10;
      offsetY = 8;
    } else {
      offsetX = 10;
      offsetY = 8;
    }
  } else if (count >= 4) {
    // Four or more: grid formation
    const row = Math.floor(indexInSameSpace / 2);
    const col = indexInSameSpace % 2;
    offsetX = col === 0 ? -10 : 10;
    offsetY = row === 0 ? -10 : 10;
  }
  
  return { top: offsetY, left: offsetX };
};

// Get the space type class for styling
export const getSpaceTypeClass = (type: SpaceType): string => {
  switch (type) {
    case SpaceType.BONUS:
      return "bg-game-bonus text-white";
    case SpaceType.PENALTY:
      return "bg-game-penalty text-white";
    case SpaceType.FINISH:
      return "bg-game-finish text-white";
    default:
      return ""; // Regular spaces use the alternating colors
  }
};

// Format seconds into MM:SS
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
