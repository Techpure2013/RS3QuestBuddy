import { useState, useMemo, useCallback, useEffect } from "react";

export type PlayerQuestStatus = {
	title: string;
	status: "COMPLETED" | "NOT_STARTED" | "STARTED";
	difficulty: number;
	questPoints: number;
	userEligible: boolean;
};

// This map is constant, so we can define it outside the hook.
const replacementMap = new Map<string, string>([
	["Hermy and Bass", "That Old Black Magic: Hermy and Bass"],
	["Flesh and Bone", "That Old Black Magic: Flesh and Bone"],
	["Skelly by Everlight", "That Old Black Magic: Skelly by Everlight"],
	["My One and Only Lute", "That Old Black Magic: My One and Only Lute"],
	["Foreshadowing", "Once Upon a Time in Gielinor: Foreshadowing"],
	[
		"Defeating the Culinaromancer",
		"Recipe for Disaster: Defeating the Culinaromancer",
	],
	["Freeing Evil Dave", "Recipe for Disaster: Freeing Evil Dave"],
	["Freeing King Awowogei", "Recipe for Disaster: Freeing King Awowogei"],
	["Freeing Pirate Pete", "Recipe for Disaster: Freeing Pirate Pete"],
	["Freeing Sir Amik Varze", "Recipe for Disaster: Freeing Sir Amik Varze"],
	["Freeing Skrach Uglogwee", "Recipe for Disaster: Freeing Skrach Uglogwee"],
	[
		"Freeing the Goblin Generals",
		"Recipe for Disaster: Freeing the Goblin Generals",
	],
	[
		"Freeing the Lumbridge Sage",
		"Recipe for Disaster: Freeing the Lumbridge Sage",
	],
	[
		"Freeing the Mountain Dwarf",
		"Recipe for Disaster: Freeing the Mountain Dwarf",
	],
	["That Old Black Magic", ""],
	["Unstable Foundations", ""],
	["Once Upon a Time in Gielinor", ""],
	["Recipe for Disaster", ""],
	["Dimension of Disaster", ""],
	["Finale", "Once Upon a Time in Gielinor: Finale"],
	["flashback", "Once Upon a Time in Gielinor: Flashback"],
	["Fortunes", "Once Upon a Time in Gielinor: Fortunes"],
	["Raksha, The Shadow Colossus", "Raksha, The Shadow Colossus Quest"],
	["Helping Laniakea", "Helping Laniakea (miniquest)"],
	["Father and Son", "Father and Son (miniquest)"],
	["A Fairy Tale I - Growing Pains", "A Fairy Tale I: Growing Pains"],
	["A Fairy Tale II - Cure a Queen", "A Fairy Tale II: Cure a Queen"],
	[
		"A Fairy Tale III - Battle at Ork's Rift",
		"A Fairy Tale III: Battle at Ork's Rift",
	],
]);

export const useSortedPlayerQuests = () => {
	// Initialize state with a function that checks sessionStorage
	const [rawQuests, setRawQuests] = useState<PlayerQuestStatus[]>(() => {
		const storedQuests = sessionStorage.getItem("processedPlayerQuests");
		if (storedQuests) {
			try {
				const parsedQuests = JSON.parse(storedQuests);
				if (Array.isArray(parsedQuests)) {
					return parsedQuests;
				}
			} catch (e) {
				console.error("Failed to parse stored quests", e);
			}
		}
		return []; // Default to an empty array if nothing is found
	});

	const sortPlayerQuests = useCallback(
		(questData: PlayerQuestStatus[] | null) => {
			setRawQuests(questData || []);
		},
		[],
	);

	const sortedData = useMemo(() => {
		if (!rawQuests || rawQuests.length === 0) {
			return {
				alteredQuestData: [],
				completedPlayerQuests: [],
				notStartedPlayerQuests: [],
				startedPlayerQuests: [],
				eligiblePlayerQuests: [],
				notEligiblePlayerQuests: [],
				totalQuestPoints: 0,
			};
		}

		const updatedData = rawQuests
			.map((quest) => {
				const newTitle = replacementMap.get(quest.title) ?? quest.title;
				return { ...quest, title: newTitle };
			})
			.filter((quest) => quest.title !== "");

		const updatedWithQuestPoints = updatedData.map((quest) => {
			switch (quest.title.toLowerCase()) {
				case "that old black magic: hermy and bass":
					quest.questPoints = 2;
					break;
				case "dimension of disaster: curse of arrav":
					quest.questPoints = 3;
					break;
				case "once upon a time in gielinor: finale":
					quest.questPoints = 4;
					break;
				case "necromancy!":
					quest.questPoints = 1;
					break;
				default:
					break;
			}
			return quest;
		});

		const completed = updatedWithQuestPoints.filter(
			(q) => q.status === "COMPLETED",
		);
		const notStarted = updatedWithQuestPoints.filter(
			(q) => q.status === "NOT_STARTED",
		);
		const started = updatedWithQuestPoints.filter((q) => q.status === "STARTED");
		const eligible = updatedWithQuestPoints.filter((q) => q.userEligible);
		const notEligible = updatedWithQuestPoints.filter((q) => !q.userEligible);
		const totalPoints = completed.reduce(
			(sum, q) => sum + (q.questPoints || 0),
			0,
		);

		return {
			alteredQuestData: updatedWithQuestPoints,
			completedPlayerQuests: completed,
			notStartedPlayerQuests: notStarted,
			startedPlayerQuests: started,
			eligiblePlayerQuests: eligible,
			notEligiblePlayerQuests: notEligible,
			totalQuestPoints: totalPoints,
		};
	}, [rawQuests]);

	// This effect now saves BOTH lists whenever the source data changes
	useEffect(() => {
		// The guard clause prevents overwriting good data with an empty array on initial load.
		if (rawQuests.length > 0) {
			// Save the normalized data that can be used to re-hydrate the state.
			// We use `sortedData.alteredQuestData` because it's the final, cleaned version.
			sessionStorage.setItem(
				"processedPlayerQuests",
				JSON.stringify(sortedData.alteredQuestData),
			);

			// Also save the completed list for the other page.
			sessionStorage.setItem(
				"hasCompleted",
				JSON.stringify(sortedData.completedPlayerQuests),
			);
		}
	}, [rawQuests, sortedData.alteredQuestData, sortedData.completedPlayerQuests]);

	return {
		...sortedData,
		sortPlayerQuests,
	};
};
