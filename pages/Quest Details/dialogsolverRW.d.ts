export declare const useDialogSolver: (questName: string) => {
    readonly startSolver: () => Promise<void>;
    readonly stopSolver: () => void;
    readonly stopOverlay: () => void;
};
