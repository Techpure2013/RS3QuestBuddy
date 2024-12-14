export type questlist = {
    quests: string[];
};
export declare const fetchQuestList: () => Promise<questlist | null>;
