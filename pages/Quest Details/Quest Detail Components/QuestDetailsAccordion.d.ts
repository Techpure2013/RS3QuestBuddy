import React from "react";
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
    skillLevels: string[];
    completedQuests: any[];
    history: any;
}
declare const AccordionComponent: React.FC<AccordionComponentProps>;
export default AccordionComponent;
