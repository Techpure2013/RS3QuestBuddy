import React from "react";
type QuestModalsProps = {
    openedSettings: boolean;
    closeSettings: () => void;
    openedGrid: boolean;
    closeGrid: () => void;
    openedLunarGrid: boolean;
    closeLunarGrid: () => void;
    openedNotes: boolean;
    closeNotes: () => void;
    openedPog: boolean;
    closePog: () => void;
    uiColor: string;
};
export declare const QuestModals: React.FC<QuestModalsProps>;
export {};
