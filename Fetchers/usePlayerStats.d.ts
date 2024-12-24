export declare const usePlayerStats: () => {
    readonly playerStats: String;
    readonly isLoading: boolean;
    readonly hasError: boolean;
    readonly fetchPlayerStats: (playerName: String) => Promise<void>;
};
