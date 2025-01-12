import pathData from "./../Quest Data/QuestPaths.json";
import { useCallback, useMemo, useState } from "react";

type QuestPaths = {
	Quest: string;
	Path: string;
	Transcript: string;
	CTranscript: string;
};
export const useQuestPaths = () => {
	const [questSteps, setQuestSteps] = useState<String[]>([]); // Default to an empty array

	const QuestDataPaths = useMemo(() => {
		const paths: QuestPaths[] = JSON.parse(JSON.stringify(pathData));
		return Array.isArray(paths) ? paths : [];
	}, []);

	const getQuestSteps = useCallback(
		async (questName: string) => {
			if (QuestDataPaths.length > 0) {
				const stepPath = QuestDataPaths.find((quest) => quest.Quest === questName);
				if (stepPath !== undefined) {
					try {
						const response = await fetch(stepPath.Path);
						const steps = (await response.text())
							.trim()
							.replace(/\n/g, "")
							.split("`");
						if (Array.isArray(steps)) {
							setQuestSteps(steps);
						} else {
							console.warn("Fetched steps are not a valid array.");
							setQuestSteps([]); // Reset to default if invalid data
						}
					} catch (error) {
						console.error("Error fetching quest steps:", error);
						setQuestSteps([]); // Reset to default if an error occurs
					}
				} else {
					console.warn("No matching stepPath found for quest:", questName);
					setQuestSteps([]); // Reset to default if no path is found
				}
			} else {
				console.warn("QuestDataPaths is empty.");
				setQuestSteps([]); // Reset to default if no paths are available
			}
		},
		[QuestDataPaths]
	);

	return { questSteps, QuestDataPaths, getQuestSteps } as const;
};
