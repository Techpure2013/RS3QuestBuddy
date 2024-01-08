import { useEffect, useState } from "react";
import { DiagReader } from "./dialogsolver.tsx";

interface ReaderProps {
	reader: DiagReader;
	questName: string;
}
export const Reader: React.FC<ReaderProps> = ({ reader, questName }) => {
	const [, setCState] = useState(reader.getCState());

	useEffect(() => {
		const fetchCompareTranscript = async (): Promise<void> => {
			try {
				// Fetch the quest data
				const questResponse = await fetch("./QuestList.json");
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
						cleanedData?.map((value) =>
							value.toString().replace('"', "").replace('"', "")
						) || [];
					// Set the transcript data to the Zustand store
					reader.cTStore = cTranscriptArray;
				}
			} catch (error) {
				console.warn(
					"Could not fetch or clean the compare transcript data:",
					error
				);
			}
		};
		fetchCompareTranscript();
	}, []);

	useEffect(() => {
		console.log("I from the diagsolver has mounted");
		reader.on("change", setCState);
		reader.toggleOptionInterval(true, () => reader.readDiagOptions(), 600);
		return () => {
			reader.off("change", setCState);
			reader.toggleOptionRun(false);
			// p.reader.toggleDiagRun(false);
		};
	}, []);
	return (
		<>
			<div className="DialogReaderContainer" style={{ color: "#FFFFFF" }}>
				{/* <h2>State:</h2>
				<pre style={{ color: "#FFFFFF" }}>
					{JSON.stringify(cState, null, 3)}
				</pre>
				You can also display specific state properties here */}
			</div>
		</>
	);
};
