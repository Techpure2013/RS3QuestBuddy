type QuestPaths = {
    Quest: string;
    Path: string;
    Transcript: string;
    CTranscript: string;
};
export declare const useQuestPaths: () => {
    readonly questPaths: QuestPaths[] | undefined;
    readonly QuestDataPaths: () => void;
    readonly getQuestSteps: (questName: string) => void;
};
export {};
