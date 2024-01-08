import { useEffect } from "react";
import { create } from "zustand";

type CompareFetcherType = {
	CTranscript: string[];
	setCTranscript: (transcript: string[]) => void;
};
interface CTranInterface {
	questName: string;
	QuestPaths: string;
}

export const useCTranscriptStore = create<CompareFetcherType>((set) => ({
	CTranscript: [],
	setCTranscript: (transcript) => set({ CTranscript: transcript }),
}));
export const CompareTranscriptFetcher: React.FC<CTranInterface> = ({
	questName,
	QuestPaths,
}) => {
	const fetchCompareTranscript = async (): Promise<void> => {
		try {
			// Fetch the quest data
			const questResponse = await fetch(QuestPaths);
			const questData = await questResponse.json();

			// Normalize the quest name for comparison
			const normalizedQuestName = questName.toLowerCase().trim();

			// Find the quest entry in the questData array
			const questEntry = questData.find((value: { Quest: string }) => {
				return value.Quest.toLowerCase().trim() === normalizedQuestName;
			});

			if (questEntry) {
				const cTranscriptPath = questEntry.CTranscript;

				// Fetch the compare transcript data
				const transcriptResponse = await fetch(cTranscriptPath);
				const rawData = await transcriptResponse.text();

				// Clean the data
				const pattern = /"([^"]+)"/g;
				const cleanedData = rawData.match(pattern);

				const cTranscriptArray: string[] =
					cleanedData?.map((value) => value.toString()) || [];
				// Set the transcript data to the Zustand store
				useCTranscriptStore.getState().setCTranscript(cTranscriptArray);
			}
		} catch (error) {
			console.warn(
				"Could not fetch or clean the compare transcript data:",
				error
			);
		}
	};

	// Call the fetchCompareTranscript function when the component mounts
	useEffect(() => {
		fetchCompareTranscript();
	}, []);

	return null;
};

// Example usage within a React component
// const fetcher = new CompareTranscriptFetcher( /* ... */ );
// const CTranscriptArray = await fetcher.fetchCompareTranscript();
// console.log(CTranscriptArray);
