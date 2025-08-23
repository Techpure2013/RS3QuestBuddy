import pathData from "./../Quest Data/QuestPaths.json"; // Adjust path if needed
import { useCallback, useMemo, useState } from "react";

// Original type for the QuestPaths.json file
type QuestPaths = {
	Quest: string;
	Path: string;
	// The other keys are not used, so they don't need to be here,
	// but it's fine to leave them for completeness.
	Transcript?: string;
	CTranscript?: string;
};

// A specific type for a single step object
export type QuestStep = {
	stepDescription: string;
	itemsNeeded: string[];
	itemsRecommended: string[];
	highlights: {
		npc: {
			npcName: string;
			npcLocation: {
				lat: number;
				lng: number;
			};
			wanderRadius: {
				bottomLeft: {
					lat: number;
					lng: number;
				};
				topRight: {
					lat: number;
					lng: number;
				};
			};
		}[];
		object: {
			name: string;
			objectLocation: {
				lat: number;
				lng: number;
			}[];
			objectRadius: {
				bottomLeft: {
					lat: number;
					lng: number;
				};
				topRight: {
					lat: number;
					lng: number;
				};
			};
		}[];
	};
	floor: number;
	additionalStepInformation: string[];
};

// The type for the entire fetched quest file (e.g., A_Christmas_Reunion.json)
export type Quest = {
	questName: string;
	questSteps: QuestStep[];
};

export const useQuestPaths = () => {
	// FIX 1: The state should hold an array of QuestStep objects, not strings.
	const [questSteps, setQuestSteps] = useState<QuestStep[]>([]);

	const QuestDataPaths = useMemo(() => {
		// FIX 2: Importing JSON already parses it. No need for stringify/parse.
		return Array.isArray(pathData) ? (pathData as QuestPaths[]) : [];
	}, []);

	const getQuestSteps = useCallback(
		async (questName: string) => {
			if (QuestDataPaths.length === 0) {
				console.warn("QuestDataPaths is empty.");
				setQuestSteps([]);
				return;
			}

			const stepPath = QuestDataPaths.find((quest) => quest.Quest === questName);

			if (!stepPath || !stepPath.Path) {
				console.warn("No matching stepPath found for quest:", questName);
				setQuestSteps([]);
				return;
			}

			try {
				const response = await fetch(stepPath.Path);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// FIX 3: Fetch the entire Quest object first.
				const fetchedQuest: Quest = await response.json();

				// FIX 4: Check if the `questSteps` property is an array and then set state.
				if (fetchedQuest && Array.isArray(fetchedQuest.questSteps)) {
					setQuestSteps(fetchedQuest.questSteps);
				} else {
					console.warn("Fetched data is invalid or has no 'questSteps' array.");
					setQuestSteps([]);
				}
			} catch (error) {
				console.error("Error fetching or parsing quest steps:", error);
				setQuestSteps([]); // Reset on error
			}
		},
		[QuestDataPaths],
	);

	return { questSteps, QuestDataPaths, getQuestSteps } as const;
};
