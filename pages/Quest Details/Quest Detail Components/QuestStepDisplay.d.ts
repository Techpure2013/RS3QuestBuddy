import React from "react";
import { QuestStep } from "./../../../Fetchers/useQuestData";
import { QuestImage } from "./../../../Fetchers/handleNewImage";
type CompactQuestStepProps = {
    step: QuestStep;
    index: number;
    isCompleted: boolean;
    images: QuestImage[];
    onImagePopOut: (src: string, height: number, width: number) => void;
};
export declare const CompactQuestStep: React.FC<CompactQuestStepProps>;
export {};
