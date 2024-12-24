import { useState } from "react";

export const usePlayerStats = () => {
	const [playerStats, setPlayerStats] = useState<String>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasError, setHasError] = useState<boolean>(false);
	const PlayerStatsSite =
		"https://corsproxy.io/?url=https://secure.runescape.com/m=hiscore/index_lite.ws?player=";
	const fetchPlayerStats = async (playerName: String): Promise<void> => {
		try {
			setIsLoading(true);
			const response = await fetch(PlayerStatsSite + `${playerName}`);
			const playerInfo = await response.text();
			if (playerInfo !== null && playerInfo !== undefined) {
				setPlayerStats(playerInfo);
				setHasError(false);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Was not able to fetch player stats", error);
			setIsLoading(false);
			setHasError(true);
		}
	};
	return { playerStats, isLoading, hasError, fetchPlayerStats } as const;
};
