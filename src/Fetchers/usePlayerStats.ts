// hooks/usePlayerStats.ts
import { useState, useCallback } from "react";
// --- Import the utility function and the type ---
import { Skills, parsePlayerStats } from "./PlayerStatsSort";

export const usePlayerStats = () => {
	const [playerStats, setPlayerStats] = useState<Skills | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const HiscoreSite =
		"https://corsproxy.io/?url=https://secure.runescape.com/m=hiscore/index_lite.ws";

	const fetchPlayerStats = useCallback(
		async (playerName: string): Promise<boolean> => {
			try {
				setIsLoading(true);
				const response = await fetch(HiscoreSite + `?player=${playerName}`);

				if (!response.ok) {
					if (response.status === 404) {
						console.warn(`Player not found on hiscores: ${playerName}`);
					} else {
						console.error(`Hiscores API returned an error: ${response.status}`);
					}
					setPlayerStats(null);
					setIsLoading(false);
					return false;
				}

				const rawData = await response.text();

				// --- CORRECTED LOGIC ---
				// 1. Call the parser function with the raw text data
				const newSkills = parsePlayerStats(rawData);

				// 2. Check if the parser returned a valid object
				if (newSkills) {
					// 3. Set state and session storage with the valid object
					setPlayerStats(newSkills);
					sessionStorage.setItem("skillLevels", JSON.stringify(newSkills));
					setIsLoading(false);
					return true; // Report success
				} else {
					// The data was invalid, so treat it as a failure
					setPlayerStats(null);
					setIsLoading(false);
					return false; // Report failure
				}
			} catch (error) {
				console.error("Failed to fetch from Hiscores:", error);
				setPlayerStats(null);
				setIsLoading(false);
				return false;
			}
		},
		[],
	);

	return {
		playerStats,
		fetchPlayerStats,
		isLoading,
	};
};
