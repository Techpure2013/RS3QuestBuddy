import React, { useEffect, useState } from "react";
import { DiagReader } from "./dialogsolver.tsx";

interface ReaderProps {
	reader: DiagReader;
	questName: string;
}

export const Reader: React.FC<ReaderProps> = ({ reader, questName }) => {
	useEffect(() => {
		console.log("Component has mounted");

		reader.toggleOptionRun(true);
		const handleChange = () => setCState(reader.getCState());
		reader.on("change", handleChange);

		return () => {
			console.log("Component is unmounting");
			reader.toggleOptionRun(false);
			reader.off("change", handleChange);
		};
	}, []);

	useEffect(() => {
		const fetchCompareTranscript = async (): Promise<void> => {
			try {
				const questResponse = await fetch("./QuestList.json");
				const questData = await questResponse.json();
				const normalizedQuestName = questName.toLowerCase().trim();
				const questEntry = questData.find(
					(value: { Quest: string }) =>
						value.Quest.toLowerCase().trim() === normalizedQuestName
				);

				if (questEntry) {
					const cTranscriptPath = questEntry.CTranscript;
					const transcriptResponse = await fetch(cTranscriptPath);
					const rawData = await transcriptResponse.text();
					const pattern = /"([^"]+)"/g;
					const cleanedData = rawData.match(pattern);
					const cTranscriptArray =
						cleanedData?.map((value) =>
							value.toString().replace('"', "").replace('"', "")
						) || [];
					console.log(cTranscriptArray);
					reader.cTStore = cTranscriptArray;
				}
			} catch (error) {
				console.warn(
					"Error fetching or cleaning the compare transcript data:",
					error
				);
			}
		};

		fetchCompareTranscript();
	}, [questName]);

	const [, setCState] = useState(reader.getCState());

	return <div key="">{/* Render your JSX elements here */}</div>;
};
