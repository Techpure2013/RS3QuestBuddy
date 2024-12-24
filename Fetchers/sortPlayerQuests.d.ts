export type PlayerQuestStatus = {
    title: string;
    status: "COMPLETED" | "NOT_STARTED" | "STARTED";
    difficulty: number;
    questPoints: number;
    userEligible: boolean;
};
export declare const useSortedPlayerQuests: () => {
    alteredQuestData: PlayerQuestStatus[];
    completedPlayerQuests: PlayerQuestStatus[];
    notStartedPlayerQuests: PlayerQuestStatus[];
    startedPlayerQuests: PlayerQuestStatus[];
    eligiblePlayerQuests: PlayerQuestStatus[];
    notEligiblePlayerQuests: PlayerQuestStatus[];
    totalQuestPoints: number | null;
    sortPlayerQuests: (questData: PlayerQuestStatus[] | null) => void;
};
