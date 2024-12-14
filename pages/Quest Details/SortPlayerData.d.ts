import { PlayerQuestInfo } from "./../../Fetchers/PlayerFetch";
export declare class rsQuestSorter {
    private remainingQuests;
    constructor();
    sortNotStartedQuests(playerInfo: PlayerQuestInfo[]): string[];
    sortCompletedQuests(playerInfo: PlayerQuestInfo[]): void;
}
