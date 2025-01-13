import { Checkbox } from "@mantine/core";
import React, { useEffect, useState } from "react";

interface CatchUpProps {
	step: string[];
	compareTranscript: string;
}

interface CompareTranscriptData {
	current: { Dialogue: string }[];
}

export const CatchUp: React.FC<CatchUpProps> = ({
	step,
	compareTranscript,
}) => {
	const [currentTranscript, setCurrentTranscript] = useState<
		{ Dialogue: string }[] | null
	>(null);

	const [transcriptSlices, setTranscriptSlices] = useState<string[][]>(
		new Array(step.length).fill([])
	);
	const [numberVals, setNumberVals] = useState<string[]>([]);
	// Parse the compareTranscript
	useEffect(() => {
		try {
			const parsedData: CompareTranscriptData = JSON.parse(compareTranscript);

			if (parsedData.current && Array.isArray(parsedData.current)) {
				setCurrentTranscript(parsedData.current);
			} else {
				console.error("Invalid Data Structure");
				setCurrentTranscript(null);
			}
		} catch (error) {
			console.error("Failed to parse compareTranscript:", error);
			setCurrentTranscript(null);
		}
	}, [compareTranscript]);

	// Precompute transcript slices for each step
	useEffect(() => {
		if (!currentTranscript) return;

		const slices: string[][] = [];
		let remainingTranscript = [...currentTranscript];

		step.forEach((_, index) => {
			const count = totalsForSteps[index];
			const slice = remainingTranscript
				.slice(0, count)
				.map((item) => item.Dialogue);
			slices.push(slice);
			remainingTranscript = remainingTranscript.slice(count);
		});

		setTranscriptSlices(slices);
	}, [currentTranscript, step]);

	// Calculate the total for each step
	const totalsForSteps = step.map((step) => {
		const match = step.match(/\(Chat\s*([\d~✓•]*)\)/);
		if (match && match[1]) {
			const values: (1 | 0)[] = match[1].split("•").map((val) => {
				if (
					val === "~" ||
					val === "1" ||
					val === "2" ||
					val === "3" ||
					val === "4" ||
					val === "5"
				) {
					//setNumberVals(val);
					return 1;
				}
				return 0;
			});

			return values.reduce((sum: number, val: number) => sum + val, 0);
		}
		return 0;
	});

	return (
		<div>
			<h3>What Step are you on?</h3>
			{step.length > 0 ? (
				<>
					{step.map((step, index) => (
						<div
							key={index}
							style={{
								marginBottom: "1.5em", // Add spacing between groups
							}}
						>
							{/* Step Label */}
							<p
								style={{
									fontWeight: "bold", // Bold for better visibility
									marginBottom: "0.5em", // Space between the label and checkboxes
								}}
							>
								Step {index + 1}
							</p>

							{/* Step Description */}
							<p
								style={{
									marginBottom: "0.5em", // Add spacing between the description and checkboxes
								}}
							>
								{step}
							</p>

							{/* Checkboxes */}
							{transcriptSlices[index]?.length > 0 && (
								<div
									style={{
										display: "flex", // Flexbox layout for checkboxes
										flexWrap: "wrap", // Allow wrapping of checkboxes
										gap: "10px", // Space between checkboxes
									}}
								>
									{transcriptSlices[index].map((dialogue, i) => (
										<Checkbox
											key={i}
											label={dialogue}
											styles={{
												root: {
													flexDirection: "row", // Checkbox and label side by side
												},
											}}
										/>
									))}
								</div>
							)}
						</div>
					))}
				</>
			) : (
				<p>No steps containing (Chat or (chat) found</p>
			)}
		</div>
	);
};
