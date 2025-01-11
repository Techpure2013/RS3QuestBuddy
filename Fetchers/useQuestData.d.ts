type QuestPaths = {
    Quest: string;
    Path: string;
    Transcript: string;
    CTranscript: string;
};
export declare const useQuestPaths: () => {
    readonly questSteps: String[];
    readonly QuestDataPaths: QuestPaths[];
    readonly getQuestSteps: (questName: string) => Promise<void>;
};
export {};
