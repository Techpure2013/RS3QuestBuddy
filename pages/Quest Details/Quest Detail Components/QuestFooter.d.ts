import React from "react";
type QuestFooterProps = {
    onSettingsClick: () => void;
    onDiscordClick: () => void;
    onNotesClick: () => void;
    onBackClick: () => void;
    onCompleteClick: () => void;
    onWikiClick: () => void;
    onCoffeeClick: () => void;
    onNextStep: () => void;
    onPrevStep: () => void;
    specialButtons: React.ReactNode;
    toolTipEnabled: boolean;
    buttonColor: string;
    hasButtonColor: boolean;
};
export declare const QuestFooter: React.FC<QuestFooterProps>;
export {};
