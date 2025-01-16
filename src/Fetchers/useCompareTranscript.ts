import { useMemo } from "react";
import pathData from "./../Quest Data/QuestPaths.json";

type QuestPaths = {
	Quest: string;
	Path: string;
	Transcript: string;
	CTranscript: string;
};
export type CTranscript = {
	Dialogue: string;
};

export const useCompareTranscript = () => {
	// ✅ Store `compareTranscript` inside a `useMemo` variable
	let { QuestDataPaths, compareTranscript } = useMemo(() => {
		const paths: QuestPaths[] = JSON.parse(JSON.stringify(pathData));

		// Persistent variable to store transcript data
		const transcriptStorage: CTranscript[] = [];

		return {
			QuestDataPaths: Array.isArray(paths) ? paths : [],
			compareTranscript: transcriptStorage, // Persistent reference
		};
	}, []);

	const getCompareTranscript = async (questName: string) => {
		try {
			if (QuestDataPaths.length > 0) {
				const transcriptPath = QuestDataPaths.find(
					(quest) => quest.Quest === questName
				)?.CTranscript;

				if (!transcriptPath) {
					console.error("Transcript path not found for quest:", questName);
					return;
				}

				const response = await fetch(transcriptPath);
				if (!response.ok) {
					console.error(
						"Failed to fetch transcript:",
						response.status,
						response.statusText
					);
					return;
				}

				const transcript = await response.json();

				// Ensure expected structure
				if (transcript?.Dialogue && Array.isArray(transcript.Dialogue)) {
					console.log("Fetched Transcript Dialogues:", transcript.Dialogue);

					// ✅ Update persistent array reference
					compareTranscript.length = 0; // Clear previous data
					compareTranscript.push(
						...transcript.Dialogue.map((dialogue: string) => ({
							Dialogue: dialogue,
						}))
					);
					compareTranscript = compareTranscript.filter(
						(option) => option.Dialogue !== "[Accept Quest]"
					);
					localStorage.setItem(
						"CompareTranscript",
						JSON.stringify(compareTranscript)
					);
				} else {
					console.error("Invalid transcript structure:", transcript);
				}
			}
		} catch (error) {
			console.error("Error fetching or parsing transcript:", error);
		}
	};

	return { compareTranscript, getCompareTranscript };
};
