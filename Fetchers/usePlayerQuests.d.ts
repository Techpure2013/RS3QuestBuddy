import { PlayerQuestStatus } from "./sortPlayerQuests";
export declare const usePlayerQuests: () => {
    readonly playerQuests: PlayerQuestStatus[];
    readonly fetchPlayerQuests: (playerName: String) => Promise<void>;
    readonly questIsLoading: boolean;
    readonly hasError: boolean;
};
