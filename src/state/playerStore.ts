// src/state/playerStore.ts
import { get, set } from "idb-keyval";
import { produce, type Draft } from "immer";
import type {
  PlayerStoreState,
  PlayerDerivedSelectors,
  PlayerState,
  QuestListState,
  UiState,
  PlayerStateKey,
  EnrichedQuest,
  QuestListItem,
} from "./playerModel";
import {
  initialPlayerStoreState,
  PLAYER_STORE_VERSION,
} from "./playerModel";
import type { PlayerQuestStatus, Skills } from "./types";
import { getApiBase } from "../api/base";
import { getQuestGroup } from "../Handlers/questGroups";
import { parsePlayerStats } from "../Fetchers/PlayerStatsSort";

/* ==========================================================================
   Constants
   ========================================================================== */

type Listener = (changedKeys: ReadonlySet<PlayerStateKey>, next: PlayerStoreState) => void;

const STORAGE_KEY = "rs3qb:player_state:v1";

/* ==========================================================================
   Quest Title Normalization Map
   ========================================================================== */

const replacementMap = new Map<string, string>([
  ["Between a Rock", "Between a Rock..."],
  ["Hermy and Bass", "That Old Black Magic: Hermy and Bass"],
  ["Flesh and Bone", "That Old Black Magic: Flesh and Bone"],
  ["Skelly by Everlight", "That Old Black Magic: Skelly By Everlight"],
  ["My One and Only Lute", "That Old Black Magic: My One and Only Lute"],
  ["Foreshadowing", "Once Upon a Time in Gielinor: Foreshadowing"],
  ["Defeating the Culinaromancer", "Recipe for Disaster: Defeating the Culinaromancer"],
  ["Freeing Evil Dave", "Recipe for Disaster: Freeing Evil Dave"],
  ["Freeing King Awowogei", "Recipe for Disaster: Freeing King Awowogei"],
  ["Freeing Pirate Pete", "Recipe for Disaster: Freeing Pirate Pete"],
  ["Freeing Sir Amik Varze", "Recipe for Disaster: Freeing Sir Amik Varze"],
  ["Freeing Skrach Uglogwee", "Recipe for Disaster: Freeing Skrach Uglogwee"],
  ["Freeing the Goblin Generals", "Recipe for Disaster: Freeing the Goblin Generals"],
  ["Freeing the Lumbridge Sage", "Recipe for Disaster: Freeing the Lumbridge Sage"],
  ["Freeing the Mountain Dwarf", "Recipe for Disaster: Freeing the Mountain Dwarf"],
  ["That Old Black Magic", ""],
  // Unstable Foundations: removed tutorial quest, but RS3 API still returns it
  // with 1 QP for players who completed it. Keep it as-is (no remap needed).
  // ["Unstable Foundations", ""],
  ["Once Upon a Time in Gielinor", ""],
  ["Recipe for Disaster", ""],
  ["Dimension of Disaster", ""],
  ["Finale", "Once Upon a Time in Gielinor: Finale"],
  ["flashback", "Once Upon a Time in Gielinor: Flashback"],
  ["Fortunes", "Once Upon a Time in Gielinor: Fortunes"],
  ["Raksha, The Shadow Colossus", "Raksha, the Shadow Colossus"],
  ["Helping Laniakea", "Helping Laniakea (miniquest)"],
  ["Father and Son", "Father and Son (miniquest)"],
  ["A Fairy Tale I - Growing Pains", "A Fairy Tale I: Growing Pains"],
  ["A Fairy Tale II - Cure a Queen", "A Fairy Tale II: Cure a Queen"],
  ["A Fairy Tale III - Battle at Ork's Rift", "A Fairy Tale III: Battle at Ork's Rift"],
]);

/* ==========================================================================
   Internal State & Listeners
   ========================================================================== */

let state: PlayerStoreState = initialPlayerStoreState;
const listeners = new Set<Listener>();

/* ==========================================================================
   Debounced Persistence
   ========================================================================== */

let persistTimer: ReturnType<typeof setTimeout> | null = null;

const schedulePersist = () => {
  if (persistTimer !== null) clearTimeout(persistTimer);
  persistTimer = setTimeout(async () => {
    try {
      await set(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("[PlayerStore] Persist failed:", err);
    }
    persistTimer = null;
  }, 150);
};

/* ==========================================================================
   Migration
   ========================================================================== */

function migrate(raw: PlayerStoreState): PlayerStoreState {
  if (!raw || typeof raw.version !== "number") return initialPlayerStoreState;

  // Future migrations go here
  // if (raw.version < 2) { ... }

  return {
    ...initialPlayerStoreState,
    ...raw,
    version: PLAYER_STORE_VERSION,
    // Ensure nested objects exist
    player: { ...initialPlayerStoreState.player, ...raw.player },
    questList: { ...initialPlayerStoreState.questList, ...raw.questList },
    ui: { ...initialPlayerStoreState.ui, ...raw.ui },
  };
}

/* ==========================================================================
   Shallow Equality Check
   ========================================================================== */

const isEqualShallow = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }

  // Handle objects
  const ak = Object.keys(a as Record<string, unknown>);
  const bk = Object.keys(b as Record<string, unknown>);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
};

/* ==========================================================================
   Quest Point Overrides
   ========================================================================== */

// Quest point overrides — currently empty since DB values are correct.
// Add entries here if the techpure API ever has wrong quest_points values.
// Format: "quest name lowercase" → correct QP value
const QUEST_POINT_OVERRIDES: Record<string, number> = {};

function getQuestPointOverride(title: string): number | null {
  return QUEST_POINT_OVERRIDES[title.toLowerCase()] ?? null;
}

/* ==========================================================================
   Derived Selectors (computed on demand, not persisted)
   ========================================================================== */

const derivedSelectors: PlayerDerivedSelectors = {
  normalizedQuests(): PlayerQuestStatus[] {
    const quests = state.player.quests;
    if (!quests.length) return [];

    const seen = new Set<string>();
    const result: PlayerQuestStatus[] = [];

    for (const q of quests) {
      const newTitle = replacementMap.get(q.title) ?? q.title;

      if (newTitle === "") {
        // Parent quest mapped to empty - expand into sub-quests if it's a quest group
        const group = getQuestGroup(q.title);
        if (group) {
          for (const sub of group.subquests) {
            if (!seen.has(sub)) {
              seen.add(sub);
              result.push({
                ...q,
                title: sub,
                questPoints: getQuestPointOverride(sub) ?? 0,
              });
            }
          }
        }
        continue;
      }

      if (!seen.has(newTitle)) {
        seen.add(newTitle);
        const pointOverride = getQuestPointOverride(newTitle);
        result.push({
          ...q,
          title: newTitle,
          questPoints: pointOverride ?? q.questPoints,
        });
      }
    }

    return result;
  },

  completedQuests(): PlayerQuestStatus[] {
    const fromRM = this.normalizedQuests().filter((q) => q.status === "COMPLETED");
    const rmTitles = new Set(fromRM.map((q) => q.title));
    // Include manually completed quests not already in RuneMetrics data
    const manual = state.player.completedQuestNames
      .filter((name) => !rmTitles.has(name))
      .map((name) => ({
        title: name,
        status: "COMPLETED" as const,
        difficulty: 0,
        questPoints: 0,
        userEligible: true,
      }));
    return [...fromRM, ...manual];
  },

  remainingQuests(): PlayerQuestStatus[] {
    return this.normalizedQuests().filter((q) => q.status !== "COMPLETED");
  },

  eligibleQuests(): PlayerQuestStatus[] {
    return this.normalizedQuests().filter((q) => q.userEligible && q.status !== "COMPLETED");
  },

  totalQuestPoints(): number {
    // Sum from raw RuneMetrics data when available
    const rmQP = state.player.quests
      .filter((q) => q.status === "COMPLETED")
      .reduce((sum, q) => sum + (q.questPoints || 0), 0);

    // Add QP from manually completed quests not in RuneMetrics
    const rmTitles = new Set(state.player.quests.map((q) => q.title));
    const manualOnly = state.player.completedQuestNames.filter((n) => !rmTitles.has(n));
    const questListMap = new Map(state.questList.items.map((i) => [i.questName, i]));
    const manualQP = manualOnly.reduce((sum, name) => {
      const item = questListMap.get(name);
      return sum + (item ? parseInt(item.questPoints, 10) || 0 : 0);
    }, 0);

    return rmQP + manualQP;
  },

  enrichedQuests(): EnrichedQuest[] {
    const questList = state.questList.items;
    const normalized = this.normalizedQuests();

    if (!questList.length) return [];

    // If no player quests, return base enrichment with manual completions applied
    if (!normalized.length) {
      const completedNames = new Set(state.player.completedQuestNames);
      return questList.map((q) => ({
        questName: q.questName,
        questAge: q.questAge,
        series: q.series,
        releaseDate: q.releaseDate ?? "",
        title: q.questName,
        status: completedNames.has(q.questName)
          ? ("COMPLETED" as const)
          : ("NOT_STARTED" as const),
        difficulty: 0,
        userEligible: false,
        questPoints: parseInt(q.questPoints, 10) || 0,
        rewards: q.rewards ?? [],
      }));
    }

    // Build lookup from RuneMetrics player data, keyed by title
    const playerMap = new Map<string, PlayerQuestStatus>(normalized.map((pq) => [pq.title, pq]));

    // Iterate over OUR quest list as the source of truth,
    // and enhance with RuneMetrics data when available
    const completedNames = new Set(state.player.completedQuestNames);

    return questList
      .map((base) => {
        const pq = playerMap.get(base.questName);
        const manuallyCompleted = completedNames.has(base.questName);
        return {
          questName: base.questName,
          questAge: base.questAge,
          series: base.series,
          releaseDate: base.releaseDate ?? "",
          title: base.questName,
          status: manuallyCompleted
            ? ("COMPLETED" as const)
            : (pq?.status ?? ("NOT_STARTED" as const)),
          difficulty: pq?.difficulty ?? 0,
          userEligible: pq?.userEligible ?? false,
          questPoints: parseInt(base.questPoints, 10) || 0,
          rewards: base.rewards ?? [],
        };
      })
      .sort((a, b) => a.questName.localeCompare(b.questName));
  },

  displayQuests(): EnrichedQuest[] {
    const enriched = this.enrichedQuests();
    const { hideCompleted, showEligibleOnly } = state.player;
    const hasData = this.hasCompletionData();

    let result = enriched;

    // Apply "Hide Completed" filter (when player data or manual completions exist)
    if (hideCompleted && hasData) {
      result = result.filter((q) => q.status !== "COMPLETED");
    }

    // Apply "Show Eligible Only" filter (only when RuneMetrics player data is loaded)
    if (showEligibleOnly && state.ui.playerFound) {
      const eligible = result.filter((q) => q.userEligible);
      // Only apply if we have eligible quests, otherwise keep current list
      if (eligible.length > 0) {
        result = eligible;
      }
    }

    return result;
  },

  remainingCount(): number {
    const enriched = this.enrichedQuests();
    return enriched.filter((q) => q.status !== "COMPLETED").length;
  },

  hasCompletionData(): boolean {
    return state.player.quests.length > 0 || state.player.completedQuestNames.length > 0;
  },
};

/* ==========================================================================
   Abort Controller for Fetch Operations
   ========================================================================== */

let fetchAbortController: AbortController | null = null;

/* ==========================================================================
   PlayerStore
   ========================================================================== */

export const PlayerStore = {
  /* --------------------------------------------------------------------------
     Initialization
     -------------------------------------------------------------------------- */

  async initialize(): Promise<void> {
    try {
      const raw = await get<string>(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PlayerStoreState;
      state = migrate(parsed);
      // Transient UI flags should never survive a page reload
      state = produce(state, (draft) => {
        draft.ui.loading = false;
        draft.ui.error = null;
      });
    } catch (err) {
      console.error("[PlayerStore] Initialize failed:", err);
      // Keep initial state
    }
  },

  /* --------------------------------------------------------------------------
     State Access
     -------------------------------------------------------------------------- */

  getState(): PlayerStoreState {
    return state;
  },

  derived: derivedSelectors,

  /* --------------------------------------------------------------------------
     Subscription (selector-based to minimize re-renders)
     -------------------------------------------------------------------------- */

  subscribe<T>(
    selector: (s: PlayerStoreState, d: PlayerDerivedSelectors) => T,
    cb: (value: T) => void
  ): () => void {
    let last = selector(state, this.derived);
    cb(last);

    const listener: Listener = (_changed, next) => {
      const selected = selector(next, this.derived);
      if (!isEqualShallow(selected as unknown, last as unknown)) {
        last = selected;
        cb(selected);
      }
    };

    listeners.add(listener);

    // Debug warning for potential memory leaks
    if (listeners.size > 50) {
      console.warn("[PlayerStore] High listener count:", listeners.size);
    }

    return () => listeners.delete(listener);
  },

  /* --------------------------------------------------------------------------
     Low-Level Update API (with Immer)
     -------------------------------------------------------------------------- */

  update(recipe: (draft: Draft<PlayerStoreState>) => void, changedKeys?: PlayerStateKey[]) {
    const next = produce(state, recipe);
    if (next === state) return;
    state = next;

    if (process.env.NODE_ENV === "development") {
      console.debug(
        "[PlayerStore.update] changed:",
        changedKeys?.join(",") || "(unknown)",
        "at",
        performance.now().toFixed(2)
      );
    }

    schedulePersist();
    const changed = new Set<PlayerStateKey>(changedKeys ?? []);
    for (const l of Array.from(listeners)) {
      try {
        l(changed, state);
      } catch (err) {
        console.error("[PlayerStore] Listener error:", err);
      }
    }
  },

  /* --------------------------------------------------------------------------
     Convenience Setters
     -------------------------------------------------------------------------- */

  setPlayer(patch: Partial<PlayerState>) {
    this.update(
      (draft) => {
        draft.player = { ...draft.player, ...patch };
      },
      ["player"]
    );
  },

  setQuestList(patch: Partial<QuestListState>) {
    this.update(
      (draft) => {
        draft.questList = { ...draft.questList, ...patch };
      },
      ["questList"]
    );
  },

  setUi(patch: Partial<UiState>) {
    this.update(
      (draft) => {
        draft.ui = { ...draft.ui, ...patch };
      },
      ["ui"]
    );
  },

  /* --------------------------------------------------------------------------
     Actions
     -------------------------------------------------------------------------- */

  async fetchPlayer(playerName: string): Promise<boolean> {
    const trimmed = playerName.trim();
    if (!trimmed) return false;

    // Abort any in-flight request
    fetchAbortController?.abort();
    fetchAbortController = new AbortController();
    const signal = fetchAbortController.signal;

    // Add 15-second timeout to prevent permanent lockup
    const timeoutId = setTimeout(() => {
      fetchAbortController?.abort();
    }, 15000);

    this.setUi({ loading: true, error: null });
    this.setPlayer({ playerName: trimmed });

    const api = getApiBase();

    try {
      const [hiscoresRes, rmRes] = await Promise.all([
        fetch(`${api}/hiscores?player=${encodeURIComponent(trimmed)}`, {
          signal,
          credentials: "same-origin",
        }),
        fetch(`${api}/runemetrics/quests?user=${encodeURIComponent(trimmed)}`, {
          signal,
          credentials: "same-origin",
        }),
      ]);

      clearTimeout(timeoutId);

      // Parse hiscores
      let parsedSkills: Skills | null = null;
      if (hiscoresRes.ok) {
        const text = await hiscoresRes.text();
        parsedSkills = parsePlayerStats(text);
      } else {
        console.warn("[PlayerStore] Hiscores error:", hiscoresRes.status);
      }

      // Parse runemetrics
      let quests: PlayerQuestStatus[] = [];
      if (rmRes.ok) {
        const json = await rmRes.json();
        if (!json.error && Array.isArray(json.quests)) {
          quests = json.quests;
        } else {
          console.warn("[PlayerStore] Runemetrics error:", json.error);
        }
      } else {
        console.warn("[PlayerStore] Runemetrics status:", rmRes.status);
      }

      const success = parsedSkills !== null || quests.length > 0;

      // Merge RuneMetrics completed quests into our manual list (source of truth)
      // Use a Set to guarantee no duplicates from RM data or existing list
      if (quests.length > 0) {
        const merged = new Set(state.player.completedQuestNames);
        const before = merged.size;
        for (const q of quests) {
          if (q.status !== "COMPLETED") continue;
          const normalized = replacementMap.get(q.title) ?? q.title;
          if (normalized !== "") merged.add(normalized);
        }
        if (merged.size > before) {
          this.setPlayer({ completedQuestNames: [...merged] });
        }
      }

      this.update(
        (draft) => {
          draft.player.skills = parsedSkills;
          draft.player.quests = quests;
          draft.ui.loading = false;
          draft.ui.playerFound = success;
          draft.ui.error = success ? null : "Player not found";
        },
        ["player", "ui"]
      );

      return success;
    } catch (err) {
      clearTimeout(timeoutId);

      if ((err as Error).name === "AbortError") {
        // Only reset loading if no newer request has taken over
        if (fetchAbortController?.signal === signal) {
          this.setUi({ loading: false, error: null });
        }
        return false;
      }

      console.error("[PlayerStore] Fetch failed:", err);
      this.setUi({
        loading: false,
        playerFound: false,
        error: "Failed to fetch player data",
      });
      return false;
    }
  },

  async loadQuestList(): Promise<void> {
    const api = getApiBase();

    try {
      const res = await fetch(`${api}/quests/all-full`, {
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Failed to fetch quest list");

      const json = await res.json();
      const items: QuestListItem[] = (json.items ?? []).map((i: Record<string, unknown>) => ({
        questName: i.quest_name as string,
        questAge: i.quest_age as string,
        series: i.quest_series as string,
        releaseDate: (i.quest_release_date as string) ?? "",
        questPoints: String(i.quest_points ?? 0),
        rewards: Array.isArray(i.quest_rewards) ? i.quest_rewards : [],
      }));

      this.setQuestList({
        items,
        updatedAt: json.updatedAt ?? new Date().toISOString(),
      });
    } catch (err) {
      console.error("[PlayerStore] Failed to load quest list:", err);
    }
  },

  markQuestCompleted(questName: string) {
    this.update(
      (draft) => {
        if (!draft.player.completedQuestNames.includes(questName)) {
          draft.player.completedQuestNames.push(questName);
        }
      },
      ["player"]
    );
  },

  markQuestIncomplete(questName: string) {
    this.update(
      (draft) => {
        draft.player.completedQuestNames = draft.player.completedQuestNames.filter(
          (n: string) => n !== questName
        );
      },
      ["player"]
    );
  },

  setCompletedQuests(questNames: string[]) {
    this.setPlayer({ completedQuestNames: questNames });
  },

  setHideCompleted(hideCompleted: boolean) {
    this.setPlayer({ hideCompleted });
  },

  setShowEligibleOnly(showEligibleOnly: boolean) {
    this.setPlayer({ showEligibleOnly });
  },

  clearPlayer() {
    this.update(
      (draft) => {
        const saved = draft.player.completedQuestNames;
        draft.player = { ...initialPlayerStoreState.player, completedQuestNames: saved };
        draft.ui.playerFound = false;
        draft.ui.error = null;
      },
      ["player", "ui"]
    );
  },

  reset() {
    this.update(
      (draft) => {
        const saved = draft.player.completedQuestNames;
        Object.assign(draft, initialPlayerStoreState);
        draft.player.completedQuestNames = saved;
      },
      ["player", "questList", "ui"]
    );
  },
};

export default PlayerStore;
