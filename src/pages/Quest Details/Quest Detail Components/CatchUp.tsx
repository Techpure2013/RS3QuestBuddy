import { Checkbox } from "@mantine/core";
import { CTranscript } from "Fetchers/useCompareTranscript";
import React, { useEffect, useState } from "react";

interface CatchUpProps {
	step: string[];
}

export const CatchUp: React.FC<CatchUpProps> = ({ step }) => {
	let [currentTranscript, setCurrentTranscript] = useState<CTranscript[]>([]);
	const [cTranscript, setCompareTranscript] = useState<CTranscript[]>([]);
	let match: RegExpMatchArray | null = null;
	const [transcriptSlices, setTranscriptSlices] = useState<string[][]>(
		new Array(step.length).fill([])
	);
	const checkBoxLocations: string[] = [];
	let numberVals: string[][] = [];
	const [checkedValues, setCheckedValues] = useState<Record<string, boolean>>(
		{}
	);
	const [originalIndexes, setOriginalIndexes] = useState<
		{ key: string; originalIndex: number }[]
	>([]);
	useEffect(() => {
		try {
			const parsedData: CTranscript[] = JSON.parse(
				localStorage.getItem("CompareTranscript") || "[]"
			);
			console.log(parsedData);
			if (parsedData && Array.isArray(parsedData)) {
				setCurrentTranscript(parsedData);
				setCompareTranscript(parsedData);
			} else {
				console.error("Invalid Data Structure");
				setCurrentTranscript([]);
				setCompareTranscript([]);
			}
		} catch (error) {
			console.error("Failed to parse compareTranscript:", error);
			setCurrentTranscript([]);
			setCompareTranscript([]);
		}
	}, []);

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
	}, [currentTranscript]);
	useEffect(() => {
		localStorage.setItem("CompareTranscript", JSON.stringify(cTranscript));
		window.dispatchEvent(new Event("compareTranscriptUpdated"));
	}, [cTranscript]);
	// Handle Checkbox change

	const handleCheckboxChange = (index: number, i: number, value: string) => {
		const key = `${index}-${i}`;
		const isChecked = !checkedValues[key]; // Determine if this checkbox is being checked or unchecked

		const updatedCheckedValues = { ...checkedValues };

		// Find the index of this checkbox in the checkBoxLocations array
		const checkBoxLocationIndex = checkBoxLocations.indexOf(key);

		if (isChecked) {
			// For checking, ensure the previous checkbox is checked
			if (checkBoxLocationIndex > 0) {
				const previousKey = checkBoxLocations[checkBoxLocationIndex - 1];
				if (!updatedCheckedValues[previousKey]) {
					console.warn(`Cannot check ${key} because ${previousKey} is not checked.`);
					return; // Prevent checking out of sequence
				}
			}

			// Mark this checkbox as checked
			updatedCheckedValues[key] = true;

			// Update the compareTranscript by removing the value when checked
			setCompareTranscript((prevTranscript) => {
				const originalIndex = prevTranscript.findIndex(
					(dialog) => dialog.Dialogue === value
				);

				if (originalIndex !== -1) {
					// Track the original index of the removed value
					setOriginalIndexes((prevIndexes) => [
						...prevIndexes,
						{ key, originalIndex },
					]);
				}

				// Remove the value from compareTranscript
				return prevTranscript.filter((dialog) => dialog.Dialogue !== value);
			});
		} else {
			// For unchecking, ensure all subsequent checkboxes are unchecked first
			const nextCheckboxesUnchecked = checkBoxLocations
				.slice(checkBoxLocationIndex + 1)
				.every((location) => !updatedCheckedValues[location]);

			if (!nextCheckboxesUnchecked) {
				console.warn(
					`Cannot uncheck ${key} because subsequent checkboxes are not unchecked.`
				);
				return; // Prevent unchecking out of sequence
			}

			// Uncheck this checkbox and all subsequent checkboxes
			updatedCheckedValues[key] = false;
			checkBoxLocations.slice(checkBoxLocationIndex + 1).forEach((location) => {
				updatedCheckedValues[location] = false;
			});

			// Update the compareTranscript by re-inserting the value at its original index
			setCompareTranscript((prevTranscript) => {
				const newTranscript = [...prevTranscript];

				// Find the original index where the item was removed
				const lastRemovedEntry = originalIndexes.find((entry) => entry.key === key);

				if (lastRemovedEntry) {
					const restoredIndex = lastRemovedEntry.originalIndex;

					// Prevent duplicates and insert at the original position
					if (!newTranscript.some((dialog) => dialog.Dialogue === value)) {
						newTranscript.splice(restoredIndex, 0, { Dialogue: value });
					}

					// Remove the entry from originalIndexes as we've reintegrated it
					setOriginalIndexes((prev) => prev.filter((entry) => entry.key !== key));
				}

				return newTranscript;
			});
		}

		setCheckedValues(updatedCheckedValues);
		console.log(
			`Checkbox ${key} changed. Value: ${value}, Checked: ${isChecked}`
		);
	};

	// Calculate the total for each step
	const totalsForSteps = step.map((step) => {
		match = step.match(/\(Chat\s*([\d~✓•]*)\)/);

		if (match !== null) {
			const splitValues = match[1].split("•").filter((value) => value !== "✓"); // Remove "✓"
			numberVals.push([...splitValues]); // Push the values, even if empty
		} else {
			numberVals.push([]); // Ensure empty values are also added
		}

		if (match && match[1]) {
			const values: (1 | 0)[] = match[1].split("•").map((val) => {
				return ["~", "1", "2", "3", "4", "5"].includes(val) ? 1 : 0;
			});

			return values.reduce((sum: number, val: number) => sum + val, 0);
		}

		return 0;
	});
	return (
		<div>
			<h3>What Step are you on?</h3>
			{step?.map((step, index) => (
				<div
					key={index}
					style={{
						marginBottom: "1.5em",
					}}
				>
					<p
						style={{
							fontWeight: "bold",
							marginBottom: "0.5em",
						}}
					>
						Step {index + 1}
					</p>

					<p
						style={{
							marginBottom: "0.5em",
						}}
					>
						{step}
					</p>

					{transcriptSlices?.[index]?.length > 0 &&
						numberVals?.[index]?.length > 0 && (
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: "10px",
								}}
							>
								{transcriptSlices[index].map((dialogue, i) => {
									const value = numberVals[index]?.[i] ?? "";

									if (value === undefined) {
										console.warn(`Missing value for index ${index}, i ${i}`);
									}
									checkBoxLocations.push(`${index}-${i}`);
									return (
										<Checkbox
											key={`${index}-${i}`}
											label={`${dialogue} | Chat Option: ${value}`}
											checked={!!checkedValues[`${index}-${i}`]}
											onChange={() => handleCheckboxChange(index, i, dialogue)}
											styles={{
												root: {
													flexDirection: "row",
												},
											}}
										/>
									);
								})}
							</div>
						)}
				</div>
			))}
		</div>
	);
};
