export type PlayerQuestStatus = {
    title: string;
    status: "COMPLETED" | "NOT_STARTED" | "STARTED";
    difficulty: number;
    questPoints: number;
    userEligible: boolean;
};
export declare const useSortedPlayerQuests: () => {
    sortPlayerQuests: (questData: PlayerQuestStatus[] | null) => void;
    alteredQuestData: {
        title: string;
        status: "COMPLETED" | "NOT_STARTED" | "STARTED";
        difficulty: number;
        questPoints: number;
        userEligible: boolean;
    }[];
    completedPlayerQuests: {
        title: string;
        status: "COMPLETED" | "NOT_STARTED" | "STARTED";
        difficulty: number;
        questPoints: number;
        userEligible: boolean;
    }[];
    notStartedPlayerQuests: {
        title: string;
        status: "COMPLETED" | "NOT_STARTED" | "STARTED";
        difficulty: number;
        questPoints: number;
        userEligible: boolean;
    }[];
    startedPlayerQuests: {
        title: string;
        status: "COMPLETED" | "NOT_STARTED" | "STARTED";
        difficulty: number;
        questPoints: number;
        userEligible: boolean;
    }[];
    eligiblePlayerQuests: {
        title: string;
        status: "COMPLETED" | "NOT_STARTED" | "STARTED";
        difficulty: number;
        questPoints: number;
        userEligible: boolean;
    }[];
    notEligiblePlayerQuests: {
        title: string;
        status: "COMPLETED" | "NOT_STARTED" | "STARTED";
        difficulty: number;
        questPoints: number;
        userEligible: boolean;
    }[];
    totalQuestPoints: number;
};
