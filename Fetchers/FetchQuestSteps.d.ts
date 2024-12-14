import React from "react";
type QuestStepStore = {
    stepDetails: string[];
    setStepDetails: (steps: string[]) => void;
};
export declare const useQuestStepStore: import("zustand").UseBoundStore<import("zustand").StoreApi<QuestStepStore>>;
interface QuestStepFetcherProps {
    textfile: string;
    questStepJSON: string;
}
export declare const QuestStepFetcher: React.FC<QuestStepFetcherProps>;
export default QuestStepFetcher;
