import { useState } from "react";
import { PlayerQuestStatus } from "./sortPlayerQuests";

export const usePlayerQuests = () => {
	const [playerQuests, setPlayerQuests] = useState<PlayerQuestStatus[]>([]);
	const [questIsLoading, setIsLoading] = useState<boolean>(false);
	const [hasError, setHasError] = useState<boolean>(false);
	const PlayerQuestSite =
		"https://corsproxy.io/?url=https://apps.runescape.com/runemetrics/quests";

	const fetchPlayerQuests = async (playerName: String): Promise<void> => {
		try {
			const start = performance.now();
			setIsLoading(true);
			const response = await fetch(PlayerQuestSite + `?user=${playerName}`);
			const data = await response.json();
			if (data !== null) {
				setPlayerQuests(data.quests);
				const end = performance.now();
				console.log(`Fetching player quests took ${end - start}ms to execute`);
			}

			setHasError(false);
			setIsLoading(false);
		} catch (error) {
			console.error("Was not able to fetch Quest from RuneMetrics:", error);
			setIsLoading(false);
			setHasError(true);
		}
	};
	return {
		playerQuests,
		fetchPlayerQuests,
		questIsLoading,
		hasError,
	} as const;
};
