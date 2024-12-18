import pathData from "./../Quest Data/QuestPaths.json";
import { useCallback, useState } from "react";

type Steps = {
	steps: string;
};
type QuestPaths = {
	Quest: string;
	Path: string;
	Transcript: string;
	CTranscript: string;
};
export const useQuestPaths = () => {
	const [questPaths, setQuestPaths] = useState<QuestPaths[]>();
	const [questSteps, setQuestSteps] = useState<Steps>();

	const QuestDataPaths = useCallback(() => {
		const paths = JSON.parse(JSON.stringify(pathData));
		console.log(paths);
		if (Array.isArray(paths)) {
			setQuestPaths((prev) =>
				JSON.stringify(prev) !== JSON.stringify(paths) ? paths : prev
			);
		}
	}, []);

	const getQuestSteps = useCallback(
		(questName: string) => {
			const stepPath = questPaths?.find(
				(quest) => quest.Quest === questName
			)?.Path;
			console.log(stepPath);
		},
		[questPaths]
	);
	return { questPaths, QuestDataPaths, getQuestSteps } as const;
};
