/// <reference types="react" />
export declare const useDialogSolver: (questName: string) => {
    readonly startSolver: () => Promise<void>;
    readonly stopEverything: () => void;
    readonly compareTranscript: import("react").MutableRefObject<import("./../../Fetchers/useCompareTranscript").CTranscript[]>;
};
