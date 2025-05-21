
import { Space, SpaceType } from "./gameTypes";

// Board configuration
export const TOTAL_SPACES = 32;
export const MAX_PLAYERS = 8;
export const DEFAULT_REROLLS = 3;
export const DEFAULT_TIMER_DURATION = 30; // in seconds
export const POSITION_TIMER_DURATION = 60; // in seconds

// Define the board spaces with their types and effects
export const BOARD_SPACES: Space[] = Array.from({ length: TOTAL_SPACES }, (_, index) => {
  // Create special spaces at specific positions
  if (index === TOTAL_SPACES - 1) {
    return {
      id: index,
      type: SpaceType.FINISH,
      effect: { type: "FINISH" }
    };
  } else if (index % 8 === 3) {
    return {
      id: index,
      type: SpaceType.BONUS,
      effect: { type: "MOVE_FORWARD", value: 2 }
    };
  } else if (index % 8 === 7) {
    return {
      id: index,
      type: SpaceType.PENALTY,
      effect: { type: "MOVE_BACKWARD", value: 2 }
    };
  } else if (index % 12 === 10) {
    return {
      id: index,
      type: SpaceType.PENALTY,
      effect: { type: "SKIP_TURN" }
    };
  } else if (index % 10 === 5) {
    return {
      id: index,
      type: SpaceType.BONUS,
      effect: { type: "EXTRA_ACTION" }
    };
  } else {
    return {
      id: index,
      type: SpaceType.REGULAR
    };
  }
});

// Sample actions for initial game (would be loaded from JSON in full implementation)
export const SAMPLE_ACTIONS = [
  {
    id: "1",
    type: "DRINK",
    text: "Take two sips",
    category: ["drinks"]
  },
  {
    id: "2",
    type: "QUESTION",
    text: "What's your most embarrassing moment?",
    category: ["personal"]
  },
  {
    id: "3",
    type: "DARE",
    text: "Do 10 jumping jacks",
    category: ["physical"]
  },
  {
    id: "4",
    type: "EVENT",
    text: "Everyone with blue clothing drinks",
    category: ["drinks", "group"]
  },
  {
    id: "5",
    type: "CHOICE",
    text: "Choose: Take a shot or answer a personal question",
    options: ["Take a shot", "Answer a question"],
    category: ["drinks", "personal"]
  },
  {
    id: "6",
    type: "POSITION",
    text: "Hold this position for 30 seconds",
    imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
    category: ["intimate"]
  }
];

// Default action categories
export const DEFAULT_ACTION_CATEGORIES = {
  drinks: true,
  personal: true,
  physical: true,
  group: true,
  intimate: true
};

// Player colors (matching with Tailwind classes)
export const PLAYER_COLORS = [
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
];
