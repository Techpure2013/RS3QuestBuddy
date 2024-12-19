/// <reference types="react" />
type Skills = {
    rank: number;
    totalLevel: number;
    attack: number;
    defence: number;
    strength: number;
    constitution: number;
    range: number;
    prayer: number;
    magic: number;
    cooking: number;
    woodcutting: number;
    fletching: number;
    fishing: number;
    firemaking: number;
    crafting: number;
    smithing: number;
    mining: number;
    herblore: number;
    agility: number;
    thieving: number;
    slayer: number;
    farming: number;
    runecrafting: number;
    hunter: number;
    construction: number;
    summoning: number;
    dungeoneering: number;
    divination: number;
    invention: number;
    archaeology: number;
    necromancy: number;
};
export declare const usePlayerSortStats: () => {
    readonly sortedPlayerStats: import("react").MutableRefObject<Skills | null>;
    readonly filterPlayerStats: (playerStats: string[]) => void;
};
export {};
