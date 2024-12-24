import pathData from "./../Quest Data/QuestPaths.json";
import { useCallback, useMemo, useState } from "react";

type QuestPaths = {
	Quest: string;
	Path: string;
	Transcript: string;
	CTranscript: string;
};
export const useQuestPaths = () => {
	const [questSteps, setQuestSteps] = useState<String[]>();

	const QuestDataPaths = useMemo(() => {
		const paths: QuestPaths[] = JSON.parse(JSON.stringify(pathData));
		return Array.isArray(paths) ? paths : [];
	}, []);

	const getQuestSteps = useCallback(
		async (questName: string) => {
			if (QuestDataPaths !== undefined) {
				const stepPath = QuestDataPaths?.find((quest) => {
					if (quest.Quest === questName) {
						return quest.Path;
					}
				});
				if (stepPath !== undefined) {
					const response = fetch(stepPath.Path);
					const steps = (await (await response).text())
						.trim()
						.replace(/\n/g, "")
						.split("`");
					if (Array.isArray(steps) && steps !== undefined) {
						setQuestSteps(steps);
					}
				}
			}
		},
		[QuestDataPaths]
	);

	return { questSteps, QuestDataPaths, getQuestSteps } as const;
};
