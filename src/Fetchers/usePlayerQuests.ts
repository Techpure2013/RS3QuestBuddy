// hooks/usePlayerQuests.ts
import { useState, useCallback } from "react";
import { PlayerQuestStatus } from "./sortPlayerQuests";

export const usePlayerQuests = () => {
	const [playerQuests, setPlayerQuests] = useState<PlayerQuestStatus[]>([]);
	const [questIsLoading, setIsLoading] = useState<boolean>(false);
	const PlayerQuestSite =
		"https://corsproxy.io/?url=https://apps.runescape.com/runemetrics/quests";

	const fetchPlayerQuests = useCallback(
		async (playerName: string): Promise<boolean> => {
			// <-- Return boolean
			try {
				setIsLoading(true);
				const response = await fetch(PlayerQuestSite + `?user=${playerName}`);
				const data = await response.json();

				// THIS IS THE KEY: The RuneMetrics API returns an 'error' property on failure.
				if (data.error) {
					console.warn("Player not found or profile private:", data.error);
					setPlayerQuests([]); // Reset state to empty
					setIsLoading(false);
					return false; // <-- Report failure
				}

				setPlayerQuests(data.quests || []); // Set quests on success
				setIsLoading(false);
				return true; // <-- Report success
			} catch (error) {
				console.error("Failed to fetch from RuneMetrics:", error);
				setPlayerQuests([]); // Reset state on network error
				setIsLoading(false);
				return false; // <-- Report failure
			}
		},
		[],
	); // Empty dependency array makes this function stable

	// We no longer need to return hasError from here.
	return {
		playerQuests,
		fetchPlayerQuests,
		questIsLoading,
	};
};
