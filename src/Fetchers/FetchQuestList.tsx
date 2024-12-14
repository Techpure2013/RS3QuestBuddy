export type questlist = {
  quests: string[];
};

const questlistPath = "./Quest Data/QuestList.json";

export const fetchQuestList = async (): Promise<questlist | null> => {
  try {
    const response = await fetch(questlistPath);
    const questList: questlist = await response.json();
    return questList;
  } catch (error) {
    console.error("Was not able to fetch Quest List from Quests:", error);
    return null;
  }
};
