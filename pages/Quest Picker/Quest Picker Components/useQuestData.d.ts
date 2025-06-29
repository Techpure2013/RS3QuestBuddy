import { QuestList } from "./../../../Fetchers/FetchQuestList";
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
export declare function useQuestData(): {
    questList: QuestList | null;
    playerName: string;
    playerFound: boolean;
    isSorted: boolean;
    isLoading: boolean;
    questPoints: number;
    displayQuests: EnrichedQuest[];
    remainingQuestsCount: number;
    searchForPlayer: (name: string) => Promise<void>;
    clearPlayerSearch: () => void;
    setSortState: (sorted: boolean) => void;
};
