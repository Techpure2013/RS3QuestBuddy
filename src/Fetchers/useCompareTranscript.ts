import { useMemo, useRef } from "react";
import pathData from "./../Quest Data/QuestPaths.json";

type QuestPaths = {
	Quest: string;
	Path: string;
	Transcript: string;
	CTranscript: string;
};
export type CTranscript = {
	Dialogue: String;
};

export const useCompareTranscript = () => {
	let compareTranscript = useRef<CTranscript[]>([]);

	const QuestDataPaths = useMemo(() => {
		const paths: QuestPaths[] = JSON.parse(JSON.stringify(pathData));
		return Array.isArray(paths) ? paths : [];
	}, []);

	const getCompareTranscript = async (questName: string) => {
		try {
			if (QuestDataPaths) {
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

				// Check if transcript contains the expected structure
				if (transcript?.Dialogue && Array.isArray(transcript.Dialogue)) {
					console.log("Fetched Transcript Dialogues:", transcript.Dialogue);

					// Transform the `Dialogue` array into the expected format
					compareTranscript.current = transcript.Dialogue.map(
						(dialogue: string) => ({
							Dialogue: dialogue,
						})
					);
					console.log(compareTranscript.current);
				} else {
					console.error("Invalid transcript structure:", transcript);
				}
			}
		} catch (error) {
			console.error("Error fetching or parsing transcript:", error);
		}
	};

	return { compareTranscript, getCompareTranscript } as const;
};
