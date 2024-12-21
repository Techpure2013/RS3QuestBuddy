export type QuestDetailsType = {
    Quest: string;
    StartPoint: string;
    EnemiesToDefeat: string[];
    Requirements: string[];
    MemberRequirement: string;
    ItemsRequired: string[];
    OfficialLength: string;
    Recommended: string[];
};
export declare const useQuestDetails: () => {
    readonly getQuestDetails: QuestDetailsType[];
    readonly questDetails: QuestDetailsType[] | undefined;
    readonly getQuestNamedDetails: (questName: string) => void;
};
