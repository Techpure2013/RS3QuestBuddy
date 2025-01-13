/// <reference types="react" />
export type CTranscript = {
    Dialogue: String;
};
export declare const useCompareTranscript: () => {
    readonly compareTranscript: import("react").MutableRefObject<CTranscript[]>;
    readonly getCompareTranscript: (questName: string) => Promise<void>;
};
