import { useState } from "react";

export type PlayerQuestStatus = {
	title: string;
	status: "COMPLETED" | "NOT_STARTED" | "STARTED";
	difficulty: number;
	questPoints: number;
	userEligible: boolean;
};

export const useSortedPlayerQuests = () => {
	const [alteredQuestData, setAlteredQuestData] = useState<PlayerQuestStatus[]>(
		[]
	);
	const [completedPlayerQuests, setCompletedPlayerQuests] = useState<
		PlayerQuestStatus[]
	>([]);
	const [notStartedPlayerQuests, setNotStartedPlayerQuests] = useState<
		PlayerQuestStatus[]
	>([]);
	const [startedPlayerQuests, setStartedPlayerQuests] = useState<
		PlayerQuestStatus[]
	>([]);
	const [eligiblePlayerQuests, setEligiblePlayerQuests] = useState<
		PlayerQuestStatus[]
	>([]);
	const [notEligiblePlayerQuests, setNotEligiblePlayerQuests] = useState<
		PlayerQuestStatus[]
	>([]);
	const [totalQuestPoints, setTotalQuestPoints] = useState<number | null>(null);

	const sortPlayerQuests = (questData: PlayerQuestStatus[] | null) => {
		if (!questData) return;
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
			["Foreshadowing", "Once Upon a Time in Gielinor: Foreshadowing"],
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

		const updatedData = questData
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

		setAlteredQuestData(updatedWithQuestPoints);
		setCompletedPlayerQuests(() =>
			updatedWithQuestPoints.filter((q) => q.status === "COMPLETED")
		);
		setNotStartedPlayerQuests(() =>
			updatedWithQuestPoints.filter((q) => q.status === "NOT_STARTED")
		);
		setStartedPlayerQuests(() =>
			updatedWithQuestPoints.filter((q) => q.status === "STARTED")
		);
		setEligiblePlayerQuests(() =>
			updatedWithQuestPoints.filter((q) => q.userEligible)
		);
		setNotEligiblePlayerQuests(() =>
			updatedWithQuestPoints.filter((q) => !q.userEligible)
		);

		// Total quest points
		const totalPoints = completedPlayerQuests.reduce(
			(sum, q) => sum + (q.questPoints || 0),
			0
		);
		setTotalQuestPoints(totalPoints);
	};

	return {
		alteredQuestData,
		completedPlayerQuests,
		notStartedPlayerQuests,
		startedPlayerQuests,
		eligiblePlayerQuests,
		notEligiblePlayerQuests,
		totalQuestPoints,
		sortPlayerQuests,
	};
};
