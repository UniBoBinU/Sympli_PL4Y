export type PlayerColor = string;

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  position: number;
  rerolls: number;
  extraActions: number;
  skipTurn: boolean;
  movementStyle?: MovementStyle;
}

export enum SpaceType {
  REGULAR = "REGULAR",
  BONUS = "BONUS",
  PENALTY = "PENALTY",
  FINISH = "FINISH",
  POSITION = "POSITION",
}

export enum ActionType {
  DRINK = "DRINK",
  QUESTION = "QUESTION",
  DARE = "DARE",
  EVENT = "EVENT",
  CHOICE = "CHOICE",
  POSITION = "POSITION",
}

export type MovementStyle = "bounce" | "slip" | "tug" | "rub" | "grind" | "thrust";

export interface Space {
  id: number;
  type: SpaceType;
  effect?: SpaceEffect;
}

export type SpaceEffect = {
  type: "MOVE_FORWARD" | "MOVE_BACKWARD" | "SKIP_TURN" | "EXTRA_ACTION" | "FINISH";
  value?: number;
};

export interface Action {
  id: string;
  type: ActionType;
  text: string;
  options?: string[];
  imageUrl?: string;
  category: string[];
}

export enum GamePhase {
  SETUP = "SETUP",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export interface GameEvent {
  id: string;
  timestamp: number;
  playerId: number;
  type: string;
  description: string;
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
