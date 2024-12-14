export type ImageType = {
    step: string;
    src: string;
    width: number;
    height: number;
};
export declare const fetchQuestImages: (questName: string, questListJSON: string) => Promise<{
    images: ImageType[];
    error: string | null;
}>;
