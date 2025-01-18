export type CTranscript = {
    Dialogue: string;
};
export declare const useCompareTranscript: () => {
    compareTranscript: CTranscript[];
    getCompareTranscript: (questName: string) => Promise<void>;
};
