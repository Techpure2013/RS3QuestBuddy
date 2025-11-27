// src/state/usePlayerSelector.ts
import { useEffect, useRef, useState, useCallback } from "react";
import type { PlayerStoreState, PlayerDerivedSelectors } from "./playerModel";
import { PlayerStore } from "./playerStore";

/**
 * React hook for subscribing to PlayerStore slices.
 * Uses selector pattern to minimize re-renders.
 *
 * @example
 * // Subscribe to player name only
 * const playerName = usePlayerSelector((s) => s.player.playerName);
 *
 * @example
 * // Subscribe to derived data
 * const completed = usePlayerSelector((s, d) => d.completedQuests());
 *
 * @example
 * // Subscribe to multiple values (returns new object each time - use carefully)
 * const { name, loading } = usePlayerSelector((s) => ({
 *   name: s.player.playerName,
 *   loading: s.ui.loading,
 * }));
 */
export function usePlayerSelector<T>(
  selector: (s: PlayerStoreState, d: PlayerDerivedSelectors) => T
): T {
  const [value, setValue] = useState<T>(() =>
    selector(PlayerStore.getState(), PlayerStore.derived)
  );

  // Keep selector ref updated to avoid stale closures
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  useEffect(() => {
    const unsubscribe = PlayerStore.subscribe(selectorRef.current, setValue);
    return unsubscribe;
  }, []);

  return value;
}

/**
 * Hook to get PlayerStore actions without subscribing to state.
 * Use this when you only need to dispatch actions.
 *
 * @example
 * const actions = usePlayerActions();
 * actions.fetchPlayer("Zezima");
 */
export function usePlayerActions(options?: { onFetchError?: (error: string) => void; onFetchSuccess?: (playerName: string) => void }) {
  const { onFetchError, onFetchSuccess } = options || {};

  const fetchPlayer = useCallback(async (playerName: string) => {
    const success = await PlayerStore.fetchPlayer(playerName);
    if (!success) {
      const error = PlayerStore.getState().ui.error;
      onFetchError?.(error || "Failed to fetch player data");
    } else {
      onFetchSuccess?.(playerName);
    }
    return success;
  }, [onFetchError, onFetchSuccess]);

  return {
    fetchPlayer,
    loadQuestList: PlayerStore.loadQuestList.bind(PlayerStore),
    setSorted: PlayerStore.setSorted.bind(PlayerStore),
    clearPlayer: PlayerStore.clearPlayer.bind(PlayerStore),
    reset: PlayerStore.reset.bind(PlayerStore),
  };
}

/**
 * Hook that initializes the PlayerStore on mount.
 * Call this once at your app root.
 *
 * @example
 * function App() {
 *   usePlayerStoreInit();
 *   return <MyApp />;
 * }
 */
export function usePlayerStoreInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initialize store from IDB
    PlayerStore.initialize().then(() => {
      // Optionally load fresh quest list on init
      PlayerStore.loadQuestList();
    });
  }, []);
}
