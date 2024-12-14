/// <reference types="react" />
type CompareFetcherType = {
    CTranscript: string[];
    setCTranscript: (transcript: string[]) => void;
};
interface CTranInterface {
    questName: string;
    QuestPaths: string;
}
export declare const useCTranscriptStore: import("zustand").UseBoundStore<import("zustand").StoreApi<CompareFetcherType>>;
export declare const CompareTranscriptFetcher: React.FC<CTranInterface>;
export {};
