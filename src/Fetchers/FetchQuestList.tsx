export type Quest = {
	toLowerCase(): unknown;
	questName: string;
	questAge: string;
	series: string;
	questPoints: string;
	releaseDate: string;
};

// This is the correct type for your data:
export type QuestList = Quest[];

const questlistPath = "./Quest Data/QuestSeriesList.json";

export const fetchQuestList = async (): Promise<QuestList | null> => {
	try {
		const response = await fetch(questlistPath);
		const questList: QuestList = await response.json();
		return questList;
	} catch (error) {
		console.error("Was not able to fetch Quest List from Quests:", error);
		return null;
	}
};
