import { useState, useEffect, useCallback, useMemo } from "react";
import { usePlayerStats } from "./../../../Fetchers/usePlayerStats";
import { usePlayerQuests } from "./../../../Fetchers/usePlayerQuests";
import { fetchQuestList, QuestList } from "./../../../Fetchers/FetchQuestList";
import { useSortedPlayerQuests } from "./../../../Fetchers/sortPlayerQuests";

// Define the shape of our final, unified quest object for type safety
export type EnrichedQuest = {
	questName: string;
	questAge: string;
	series: string;
	releaseDate: string;
	title: string;
	status: "COMPLETED" | "NOT_STARTED" | "STARTED";
	difficulty: number;
	questPoints: number;
	userEligible: boolean;
};

export function useQuestData() {
	// --- State Declarations ---
	const [questList, setQuestList] = useState<QuestList | null>(() => {
		const storedList = sessionStorage.getItem("staticQuestList");
		try {
			if (storedList) {
				const parsedList = JSON.parse(storedList);
				if (Array.isArray(parsedList)) {
					return parsedList;
				}
			}
		} catch (e) {
			console.error("Failed to parse stored quest list", e);
		}
		return null;
	});
	const [playerName, setPlayerName] = useState<string>("");
	const [isSorted, setIsSorted] = useState<boolean>(false);
	const [playerFound, setPlayerFound] = useState<boolean>(() => {
		// Player is only "found" if ALL necessary data exists in storage.
		return (
			!!sessionStorage.getItem("playerName") &&
			!!sessionStorage.getItem("processedPlayerQuests") &&
			!!sessionStorage.getItem("staticQuestList")
		);
	});

	// --- Child Hooks ---
	const { isLoading: isStatsLoading, fetchPlayerStats } = usePlayerStats();
	const {
		playerQuests,
		questIsLoading: isQuestLoading,
		fetchPlayerQuests,
	} = usePlayerQuests();
	// CORRECTED: We no longer need eligiblePlayerQuests from here
	let { alteredQuestData, totalQuestPoints, sortPlayerQuests } =
		useSortedPlayerQuests();
	const isLoading = isStatsLoading || isQuestLoading;
	// --- Effects ---
	useEffect(() => {
		if (questList) return;
		fetchQuestList().then((ql) => {
			if (ql) {
				setQuestList(ql);
				sessionStorage.setItem("staticQuestList", JSON.stringify(ql));
			}
		});
	}, [questList]);

	useEffect(() => {
		if (playerFound) {
			const sessionPlayer = sessionStorage.getItem("playerName");
			if (sessionPlayer) {
				setPlayerName(sessionPlayer);
			}
		}
	}, [playerFound]);

	useEffect(() => {
		if (playerQuests && playerQuests.length > 0) {
			sortPlayerQuests(playerQuests);
		}
	}, [playerQuests, sortPlayerQuests]);

	// --- Data Enrichment Pipeline ---
	const baseEnrichedQuests: EnrichedQuest[] = useMemo(() => {
		if (!questList) return [];
		return questList.map(
			(quest) =>
				({
					...quest,
					title: quest.questName,
					status: "NOT_STARTED",
					difficulty: 0,
					userEligible: false,
					questPoints: parseInt(quest.questPoints, 10) || 0,
				}) as EnrichedQuest,
		);
	}, [questList]);

	const playerEnrichedQuests: EnrichedQuest[] = useMemo(() => {
		if (!questList || !alteredQuestData || alteredQuestData.length === 0) {
			return [];
		}
		const questDetailsMap = new Map(
			questList.map((quest) => [quest.questName, quest]),
		);
		return alteredQuestData
			.map((playerQuest) => {
				const details = questDetailsMap.get(playerQuest.title);
				if (!details) return null;
				return {
					...details,
					...playerQuest,
				} as EnrichedQuest;
			})
			.filter((q): q is EnrichedQuest => q !== null);
	}, [questList, alteredQuestData]);

	const activeQuestList =
		playerFound && !!isSorted ? playerEnrichedQuests : baseEnrichedQuests;

	// ensuring it is also of type EnrichedQuest[].
	const remainingQuests: EnrichedQuest[] = useMemo(() => {
		// Use the enriched list, not the raw one from the child hook
		return playerEnrichedQuests.filter(
			(q) =>
				q.userEligible && (q.status === "NOT_STARTED" || q.status === "STARTED"),
		);
	}, [playerEnrichedQuests]);

	// The final list to be displayed. It is now ALWAYS of type EnrichedQuest[].
	const displayQuests =
		isSorted && playerFound ? remainingQuests : activeQuestList;
	// --- Core Logic ---
	const searchForPlayer = useCallback(
		async (name: string) => {
			if (isLoading) return;
			setPlayerName(name);
			const statsFound = await fetchPlayerStats(name);
			const questsFound = await fetchPlayerQuests(name);
			const wasPlayerFound = statsFound && questsFound;
			if (wasPlayerFound) {
				setPlayerFound(true);
				sessionStorage.setItem("playerName", name);
			} else {
				setPlayerFound(false);
				sessionStorage.removeItem("playerName");
				sessionStorage.removeItem("processedPlayerQuests");
				sessionStorage.removeItem("hasCompleted");
			}
		},
		[fetchPlayerStats, fetchPlayerQuests, isLoading],
	);

	const clearPlayerSearch = () => {
		sessionStorage.clear();
		setPlayerName("");
		setIsSorted(false);
		setSortState(false);
		sortPlayerQuests(null);
		setPlayerFound(false);
		setQuestList(null);
	};

	const setSortState = (sorted: boolean) => {
		setIsSorted(sorted);
	};

	// --- Return Value ---
	return {
		questList,
		playerName,
		playerFound,
		isSorted,
		isLoading,
		questPoints: totalQuestPoints,
		displayQuests,
		remainingQuestsCount: remainingQuests.length,
		searchForPlayer,
		clearPlayerSearch,
		setSortState,
	};
}
