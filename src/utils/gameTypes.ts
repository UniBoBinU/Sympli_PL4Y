
export type PlayerColor = string;

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  position: number;
  rerolls: number;
  extraActions: number;
  skipTurn: boolean;
}

export enum SpaceType {
  REGULAR = "REGULAR",
  BONUS = "BONUS",
  PENALTY = "PENALTY",
  FINISH = "FINISH",
  POSITION = "POSITION",
}

export interface Space {
  id: number;
  type: SpaceType;
  effect?: SpaceEffect;
}

export type SpaceEffect = {
  type: "MOVE_FORWARD" | "MOVE_BACKWARD" | "SKIP_TURN" | "EXTRA_ACTION" | "FINISH";
  value?: number;
};

export enum ActionType {
  CHOICE = "CHOICE",
  DRINK = "DRINK",
  QUESTION = "QUESTION",
  DARE = "DARE",
  EVENT = "EVENT",
  POSITION = "POSITION",
}

export interface Action {
  id: string;
  type: ActionType;
  text: string;
  options?: string[];
  imageUrl?: string;
  category?: string[];
}

export enum GamePhase {
  SETUP = "SETUP",
  PLAYING = "PLAYING",
  GAME_OVER = "GAME_OVER",
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  currentAction: Action | null;
  timerActive: boolean;
  timerDuration: number;
  timerRemaining: number;
  history: GameEvent[];
  actionCategories: Record<string, boolean>;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  playerId: number;
  type: string;
  description: string;
}
