import React from "react";
import { Skills } from "./../../../Fetchers/PlayerStatsSort";
import { PlayerQuestStatus } from "./../../../Fetchers/sortPlayerQuests";
interface UIState {
    hasLabelColor: boolean;
    userLabelColor: string;
    hasColor: boolean;
    userColor: string;
}
interface AccordionComponentProps {
    QuestDetails: any[];
    uiState: UIState;
    expanded: string[];
    setExpanded: (expanded: string[]) => void;
    ignoredRequirements: Set<string>;
    skillLevels: Skills[];
    completedQuests: PlayerQuestStatus[];
    history: any;
}
declare const AccordionComponent: React.FC<AccordionComponentProps>;
export default AccordionComponent;
