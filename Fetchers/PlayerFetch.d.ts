export type PlayerQuestInfo = {
    title: string;
    status: string;
    difficulty: number;
    members: boolean;
    questPoints: number;
    userEligible: boolean;
};
export type Skills = {
    skillID: number;
    skillName: string;
    skillLevel: number;
    xpAmount: number;
    rank: number;
};
interface PlayerQuest {
    playerQuestInfo: PlayerQuestInfo[];
    setPlayerQuestInfo: (player: PlayerQuestInfo[]) => void;
    title: string;
    setTitle: (qTitle: string) => void;
    qStatus: string;
    setQStatus: (status: string) => void;
    difficulty: number;
    setDifficulty: (difficulty: number) => void;
    members: boolean;
    setMembers: (members: boolean) => void;
    questPoints: number;
    setQuestPoints: (questPoints: number) => void;
    userEligible: boolean;
    setUserEligible: (userEligible: boolean) => void;
    playerReponseOK: boolean;
    grabbedSkills: boolean;
}
export declare const usePlayerStore: import("zustand").UseBoundStore<import("zustand").StoreApi<PlayerQuest>>;
export declare class PlayerQuests {
    constructor();
    private url;
    private url2;
    fetchPlayerInfo(playername: string): Promise<void>;
    getQTitle(): void;
    getStatus(): void;
    getDifficulty(): void;
    getMember(): void;
    getQuestPoints(): void;
    getUserEligible(): void;
    fetchPlayerSkills(playername: string): Promise<String[]>;
}
export {};
