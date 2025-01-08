export declare const useQuestPageFunctions: () => {
    readonly ignoredRequirements: Set<string>;
    readonly create_ListUUID: () => string;
    readonly useAlt1Listener: (callback: () => void) => void;
    readonly handleBackButton: () => void;
    readonly openDiscord: () => void;
    readonly openWikiQuest: (questName: string) => void;
};
