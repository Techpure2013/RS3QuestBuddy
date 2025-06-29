import React from "react";
type Quest = {
    title: string;
};
interface QuestDisplayProps {
    quests: Quest[];
    isCompact: boolean;
    onQuestClick: (questName: string) => void;
    labelColor?: string;
}
export declare const QuestDisplay: React.FC<QuestDisplayProps>;
export {};
