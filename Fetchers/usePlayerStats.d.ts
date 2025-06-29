import { Skills } from "./PlayerStatsSort";
export declare const usePlayerStats: () => {
    playerStats: Skills | null;
    fetchPlayerStats: (playerName: string) => Promise<boolean>;
    isLoading: boolean;
};
