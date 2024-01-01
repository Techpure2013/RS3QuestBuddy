import { create } from "zustand";
import QuestDetails from "./../pages/QuestDetail.json";
import { useEffect } from "react";

type QuestDetailsType = {
    Quest: string;
    StartPoint: string;
    EnemiesToDefeat: string[];
    Requirements: string[];
    MemberRequirement: string;
    ItemsRequired: string[];
    OfficialLength: string;
    Recommended: string[];
};

type QuestFetcherType = {
    questDetails: QuestDetailsType[];
    setQuestDetails: (details: QuestDetailsType[]) => void;
};

export const useQuestDetailsStore = create<QuestFetcherType>((set) => ({
    questDetails: [],
    setQuestDetails: (details) => set({ questDetails: details }),
}));

interface QuestFetcher {
    questName: string;
}

export const QuestDetailsFetcher: React.FC<QuestFetcher> = ({ questName }) => {
    const fetchDetails = () => {
        try {
            const stringyJSON = JSON.stringify(QuestDetails);
            const data = JSON.parse(stringyJSON);

            const sanitizeString = (input: string) => {
                return input.replace(/[^\w\s]/gi, "").toLowerCase();
            };
            const sanitizedQuestName = sanitizeString(questName.trim());

            const questInfo = data.find((quest: { Quest: string }) => {
                return (
                    quest.Quest &&
                    sanitizeString(quest.Quest) === sanitizedQuestName
                );
            });

            if (!questInfo) {
                console.warn(
                    `Quest Details not found for questName: ${questName}`
                );
                return;
            }

            // Update the state

            useQuestDetailsStore.getState().setQuestDetails([questInfo]);
            console.log(useQuestDetailsStore.getState().questDetails);
        } catch (error) {
            console.warn("Could not fetch quest details", error);
        }
    };

    //Call the fetchDetails function when the component mounts or when needed
    useEffect(() => {
        fetchDetails();
    }, []);

    return null;
};
