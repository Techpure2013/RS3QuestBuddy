// src/state/playerModel.ts
import type { PlayerQuestStatus, QuestAge, QuestSeries, Skills } from "./types";

/* ==========================================================================
   Player Store State Model
   ========================================================================== */

export const PLAYER_STORE_VERSION = 1;

export type EnrichedQuest = {
  questName: string;
  questAge: QuestAge;
  series: QuestSeries;
  releaseDate: string;
  title: string;
  status: "COMPLETED" | "NOT_STARTED" | "STARTED";
  difficulty: number;
  questPoints: number;
  userEligible: boolean;
  rewards: string[];
};

export type QuestListItem = {
  questName: string;
  questAge: QuestAge;
  series: QuestSeries;
  releaseDate: string;
  questPoints: string;
  rewards: string[];
};

export type SortPreference = "default" | "eligible" | "alphabetical" | "points";

/* ==========================================================================
   State Slices
   ========================================================================== */

export interface PlayerState {
  playerName: string;
  skills: Skills | null;
  quests: PlayerQuestStatus[];
  hideCompleted: boolean;
  showEligibleOnly: boolean;
}

export interface QuestListState {
  items: QuestListItem[];
  updatedAt: string | null;
}

export interface UiState {
  loading: boolean;
  playerFound: boolean;
  error: string | null;
}

/* ==========================================================================
   Root State
   ========================================================================== */

export interface PlayerStoreState {
  version: number;
  player: PlayerState;
  questList: QuestListState;
  ui: UiState;
}

export const initialPlayerStoreState: PlayerStoreState = {
  version: PLAYER_STORE_VERSION,
  player: {
    playerName: "",
    skills: null,
    quests: [],
    hideCompleted: false,
    showEligibleOnly: false,
  },
  questList: {
    items: [],
    updatedAt: null,
  },
  ui: {
    loading: false,
    playerFound: false,
    error: null,
  },
};

/* ==========================================================================
   Derived Selectors Interface
   ========================================================================== */

export interface PlayerDerivedSelectors {
  /** All quests normalized with title replacements */
  normalizedQuests(): PlayerQuestStatus[];
  /** Completed quests */
  completedQuests(): PlayerQuestStatus[];
  /** Remaining (not completed) quests */
  remainingQuests(): PlayerQuestStatus[];
  /** Eligible quests (user can start) */
  eligibleQuests(): PlayerQuestStatus[];
  /** Total quest points earned */
  totalQuestPoints(): number;
  /** Enriched quests merged with quest list metadata */
  enrichedQuests(): EnrichedQuest[];
  /** Display quests based on sort preference */
  displayQuests(): EnrichedQuest[];
  /** Remaining count */
  remainingCount(): number;
}

/* ==========================================================================
   State Keys (for type-safe changedKeys)
   ========================================================================== */

export type PlayerStateKey = keyof PlayerStoreState;
