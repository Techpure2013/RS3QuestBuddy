import React from "react";
interface SearchControlsProps {
    onPlayerSearch: (name: string) => void;
    onQuestSearchChange: (query: string) => void;
    isLoading: boolean;
    playerFound: boolean;
    initialPlayerName: string;
    labelColor?: string;
}
export declare const SearchControls: React.FC<SearchControlsProps>;
export {};
