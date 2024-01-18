import React, { useEffect } from "react";
import { create } from "zustand";

// Zustand store
type QuestStepStore = {
	stepDetails: string[];
	setStepDetails: (steps: string[]) => void;
};

export const useQuestStepStore = create<QuestStepStore>((set) => ({
	stepDetails: [],
	setStepDetails: (steps) => set({ stepDetails: steps }),
}));

// Component Props
interface QuestStepFetcherProps {
	textfile: string;
	questStepJSON: string;
}

export const QuestStepFetcher: React.FC<QuestStepFetcherProps> = ({
	textfile,
	questStepJSON,
}) => {
	const fetchStepPath = async (): Promise<string | null> => {
		try {
			const response = await fetch(questStepJSON);
			const file = await response.json();
			const pattern = /[!,`']/g;
			const normalizedTextFile = textfile.toLowerCase().replace(/\s+/g, "");

			const foundStep = file.find((value: { Quest: string }) => {
				const normalizedValue =
					value.Quest.toLowerCase().split(" ").join("").replace(pattern, "") +
					"info.txt";
				return normalizedValue === normalizedTextFile;
			});

			if (foundStep) {
				return foundStep.Path;
			} else {
				console.error("Step not found for textfile:", foundStep);
				return null;
			}
		} catch (error) {
			console.error("Error fetching or processing quest list:", error);
			return null;
		}
	};

	const fetchData = async (): Promise<void> => {
		const { setStepDetails } = useQuestStepStore.getState();
		try {
			const stepPath = await fetchStepPath();
			if (stepPath) {
				const response = await fetch(stepPath);
				const text = await response.text();
				const textSteps = text.split("`");
				setStepDetails(textSteps);
			}
		} catch (error) {
			console.error("Steps Could Not Load", error);
		}
	};

	useEffect(() => {
		fetchData();
	}, [questStepJSON]);

	// Return null if you're not rendering anything
	return null;
};

export default QuestStepFetcher;
