/// <reference types="react" />
interface QuestImage {
    step: string;
    src: string;
    width: number;
    height: number;
}
type QuestImageStore = {
    imageList: QuestImage[];
    setQuestImages: (images: QuestImage[]) => void;
};
export declare const UseImageStore: import("zustand").UseBoundStore<import("zustand").StoreApi<QuestImageStore>>;
interface QuestImageType {
    questName: string;
    QuestListJSON: string;
}
export declare const QuestImageFetcher: React.FC<QuestImageType>;
export default QuestImageFetcher;
