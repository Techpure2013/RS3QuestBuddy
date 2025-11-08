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
	const [rawQuests, setRawQuests] = useState<PlayerQuestStatus[]>();

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
				remainingPlayerQuests: [],
				notStartedPlayerQuests: [],
				startedPlayerQuests: [],
				eligiblePlayerQuests: [],
				notEligiblePlayerQuests: [],
				totalQuestPoints: 0,
			};
		}

		const normalized = rawQuests
			.map((quest) => {
				const newTitle = replacementMap.get(quest.title) ?? quest.title;
				return { ...quest, title: newTitle };
			})
			.filter((quest) => quest.title !== "");

		const withPoints = normalized.map((quest) => {
			const lower = quest.title.toLowerCase();
			const qp =
				lower === "that old black magic: hermy and bass"
					? 2
					: lower === "dimension of disaster: curse of arrav"
						? 3
						: lower === "once upon a time in gielinor: finale"
							? 4
							: lower === "necromancy!"
								? 1
								: (quest.questPoints ?? 0);
			return { ...quest, questPoints: qp };
		});

		const completed = withPoints.filter((q) => q.status === "COMPLETED");
		const notStarted = withPoints.filter((q) => q.status === "NOT_STARTED");
		const started = withPoints.filter((q) => q.status === "STARTED");
		const eligible = withPoints.filter((q) => q.userEligible);
		const notEligible = withPoints.filter((q) => !q.userEligible);
		const remaining = withPoints.filter((q) => q.status !== "COMPLETED");

		const totalPoints = completed.reduce(
			(sum, q) => sum + (q.questPoints || 0),
			0,
		);

		return {
			alteredQuestData: withPoints,
			completedPlayerQuests: completed,
			remainingPlayerQuests: remaining,
			notStartedPlayerQuests: notStarted,
			startedPlayerQuests: started,
			eligiblePlayerQuests: eligible,
			notEligiblePlayerQuests: notEligible,
			totalQuestPoints: totalPoints,
		};
	}, [rawQuests]);

	return {
		...sortedData,
		sortPlayerQuests,
	};
};
