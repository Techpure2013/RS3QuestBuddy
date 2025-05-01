export type Quest = {
    toLowerCase(): unknown;
    questName: string;
    questAge: string;
    series: string;
    questPoints: string;
    releaseDate: string;
};
export type QuestList = Quest[];
export declare const fetchQuestList: () => Promise<QuestList | null>;
