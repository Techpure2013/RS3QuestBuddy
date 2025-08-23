type QuestPaths = {
    Quest: string;
    Path: string;
    Transcript?: string;
    CTranscript?: string;
};
export type QuestStep = {
    stepDescription: string;
    itemsNeeded: string[];
    itemsRecommended: string[];
    highlights: {
        npc: {
            npcName: string;
            npcLocation: {
                lat: number;
                lng: number;
            };
            wanderRadius: {
                bottomLeft: {
                    lat: number;
                    lng: number;
                };
                topRight: {
                    lat: number;
                    lng: number;
                };
            };
        }[];
        object: {
            name: string;
            objectLocation: {
                lat: number;
                lng: number;
            }[];
            objectRadius: {
                bottomLeft: {
                    lat: number;
                    lng: number;
                };
                topRight: {
                    lat: number;
                    lng: number;
                };
            };
        }[];
    };
    floor: number;
    additionalStepInformation: string[];
};
export type Quest = {
    questName: string;
    questSteps: QuestStep[];
};
export declare const useQuestPaths: () => {
    readonly questSteps: QuestStep[];
    readonly QuestDataPaths: QuestPaths[];
    readonly getQuestSteps: (questName: string) => Promise<void>;
};
export {};
