import { PlayerQuestStatus } from "./sortPlayerQuests";
export declare const usePlayerQuests: () => {
    playerQuests: PlayerQuestStatus[];
    fetchPlayerQuests: (playerName: string) => Promise<boolean>;
    questIsLoading: boolean;
};
