import { useMemo, useState } from "react";
import QuestDetails from "./../Quest Data/QuestDetail.json";

export type QuestDetailsType = {
	Quest: string;
	StartPoint: string;
	EnemiesToDefeat: string[];
	Requirements: string[];
	MemberRequirement: string;
	ItemsRequired: string[];
	OfficialLength: string;
	Recommended: string[];
};

export const useQuestDetails = () => {
	// Initialize state to hold an array of QuestDetailsType
	const [questDetails, setQuestDetails] = useState<QuestDetailsType[]>();

	// Memoized array of all quest details
	const getQuestDetails = useMemo(() => {
		const questDetails: QuestDetailsType[] = Array.isArray(QuestDetails)
			? QuestDetails
			: [];
		return questDetails;
	}, []);

	const getQuestNamedDetails = (questName: string) => {
		const filteredDetails = getQuestDetails.filter(
			(quest) => quest.Quest === questName
		);
		if (Array.isArray(filteredDetails) && filteredDetails !== undefined) {
			setQuestDetails(filteredDetails);
		}
	};

	return { getQuestDetails, questDetails, getQuestNamedDetails } as const;
};
