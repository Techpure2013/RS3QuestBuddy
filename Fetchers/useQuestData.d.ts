type QuestPaths = {
    Quest: string;
    Path: string;
    Transcript: string;
    CTranscript: string;
};
export declare const useQuestPaths: () => {
    readonly questSteps: String[] | undefined;
    readonly QuestDataPaths: never[] | (QuestPaths & any[]);
    readonly getQuestSteps: (questName: string) => Promise<void>;
};
export {};
