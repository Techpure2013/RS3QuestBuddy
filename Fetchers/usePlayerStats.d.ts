/// <reference types="react" />
export declare const usePlayerStats: () => {
    readonly playerStats: import("react").MutableRefObject<string | null>;
    readonly isLoading: boolean;
    readonly hasError: boolean;
    readonly fetchPlayerStats: (playerName: String) => Promise<void>;
};
