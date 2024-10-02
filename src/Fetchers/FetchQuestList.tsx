import { useEffect } from "react";
import { create } from "zustand";

interface QuestListFetch {
	questlist: string;
}

type QuestList = {
	questlist: string[];
	setQuestList: (questlist: string[]) => void;
};

export const useQuestListStore = create<QuestList>((set) => ({
	questlist: [],
	setQuestList: (newQuestlist: string[]) => set({ questlist: newQuestlist }),
}));

export const QuestListFetcher: React.FC<QuestListFetch> = ({ questlist }) => {
	const fetchQuestList = async (): Promise<void> => {
		try {
			const response = await fetch(questlist);
			const text = await response.text();
			const quests = text.split("`");

			// Convert each quest string into an object with 'questlist' property
			quests.map((quest) => ({
				questlist: quest.trim(),
			}));

			// Sort the quest list objects
			quests.sort((a, b) => {
				return a.trim().replace("'", "").replace(":", "").localeCompare(b.trim());
			});
			quests.shift();

			useQuestListStore.getState().setQuestList(quests);
		} catch (error) {
			console.error("Error fetching quest list:", error);
		}
	};

	useEffect(() => {
		fetchQuestList();
	}, []);
	return null;
};
export default QuestListFetcher;
