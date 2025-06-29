export interface UIState {
    isCompact: boolean;
    isHighlight: boolean;
    hasColor: boolean;
    hasButtonColor: boolean;
    hasLabelColor: boolean;
    userID: string;
    userColor: string;
    userLabelColor: string;
    userButtonColor: string;
}
export declare function useUISettings(): {
    uiState: UIState;
    loadUserSettings: () => void;
};
