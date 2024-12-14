/// <reference types="react" />
type QuestDetailsType = {
    Quest: string;
    StartPoint: string;
    EnemiesToDefeat: string[];
    Requirements: string[];
    MemberRequirement: string;
    ItemsRequired: string[];
    OfficialLength: string;
    Recommended: string[];
};
type QuestFetcherType = {
    questDetails: QuestDetailsType[];
    setQuestDetails: (details: QuestDetailsType[]) => void;
};
export declare const useQuestDetailsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<QuestFetcherType>>;
interface QuestFetcher {
    questName: string;
}
export declare const QuestDetailsFetcher: React.FC<QuestFetcher>;
export {};
