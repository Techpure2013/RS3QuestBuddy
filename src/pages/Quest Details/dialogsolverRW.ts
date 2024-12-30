import * as a1libs from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import { useCompareTranscript } from "./../../Fetchers/useCompareTranscript";
import { diagFinder } from "./handleImage";
export const useDialogSolver = (questName: string) => {
	const dialogReader = new DialogReader();
	const { compareTranscript, getCompareTranscript } = useCompareTranscript();
	let captureID: NodeJS.Timeout | null = null;
	let overlayID: NodeJS.Timeout | null = null;
	let acceptButtonID: NodeJS.Timeout | null = null;
	let acceptButtonFinder = new diagFinder();
	let readOptions: DialogButton[] | null = null;
	let readNPCDialog: string[] | null | undefined = null;
	let previousOptions: DialogButton[] | null = null;
	let previousMatchingOption: string | null = null;
	let npcDialogue: string[] | null | undefined = null;
	// Ensure `compareTranscript` is loaded before starting the interval
	const initialize = async () => {
		await getCompareTranscript(questName);
		startSolver();
	};

	const readCapture = (): DialogButton[] | null => {
		const diagboxCapture = a1libs.captureHoldFullRs();
		const found = dialogReader.find(diagboxCapture);
		if (found) {
			const findOptions = dialogReader.findOptions(diagboxCapture);
			if (findOptions) {
				const options = dialogReader.readOptions(diagboxCapture, findOptions);
				return options;
			}
		}
		return null;
	};
	const readDialog = () => {
		const diagboxCapture = a1libs.captureHoldFullRs();
		const findDialogue = dialogReader.checkDialog(diagboxCapture);
		if (findDialogue) {
			const readDialogue = dialogReader.readDialog(diagboxCapture, findDialogue);
			return readDialogue;
		}
	};
	const startOverlay = (
		option: DialogButton,
		color: number,
		transcriptValue: any
	) => {
		console.log("starting overlay: ", option);
		stopSolver();
		overlayID = setInterval(() => {
			readNPCDialog = readDialog();

			console.log(readNPCDialog);
			if (readNPCDialog !== undefined) {
				stopOverlay();
				console.log("not Undefined");
				const index = compareTranscript.current.findIndex(
					(value) => value.Dialogue === transcriptValue
				);

				if (index !== -1) {
					compareTranscript.current.splice(index, 1);
				}

				startSolver();
			} else {
				let testCapture = readCapture();
				if (testCapture) {
					let questionedOption = testCapture.some(
						(value) => value.text === previousMatchingOption
					);
					console.log(compareTranscript);
					if (!questionedOption) {
						stopOverlay();
						if (
							testCapture.some(
								(value) =>
									value.text.toLowerCase().trim() ===
									compareTranscript.current[0 + 1].Dialogue.toLowerCase().trim()
							)
						) {
							const index = compareTranscript.current.findIndex(
								(value) => value.Dialogue === transcriptValue
							);

							if (index !== -1) {
								compareTranscript.current.splice(index, 1);
							}
						}
						previousOptions = null;
						startSolver();
					}
				}
			}
			if (!dialogReader.find(a1libs.captureHoldFullRs())) {
				stopOverlay();
				previousOptions = null;
				startSolver();
			}
			alt1.overLayRect(
				color,
				option.buttonx,
				Math.round(option.y - 10),
				Math.round(option.x / 2),
				25,
				1200,
				4
			);
		}, 1000);
	};
	const stopOverlay = () => {
		if (overlayID) {
			clearInterval(overlayID);
		}
	};
	const startSolver = () => {
		if (!compareTranscript.current || compareTranscript.current.length === 0) {
			console.warn("Transcript data not available. Ensure it's loaded.");
			return;
		}
		compareTranscript.current = compareTranscript.current.filter(
			(option) => option.Dialogue !== "[Accept Quest]"
		);
		captureID = setInterval(() => {
			const options = readCapture();
			acceptButtonFinder.find();
			if (options) {
				const isSameAsPrevious =
					previousOptions &&
					options.length === previousOptions.length &&
					options.every((opt, idx) => opt.text === previousOptions![idx].text);

				if (!isSameAsPrevious) {
					readOptions = options;
					previousOptions = options; // Update previous options
					console.log("New dialog options read:", readOptions);

					// Process the new options
					useReadOptions(readOptions);
				} else {
					console.log("Same options detected, skipping...");
				}
			}
		}, 600);
	};

	// Update handleMatchedOption to expect a single DialogButton
	const handleMatchedOption = (option: DialogButton, transcriptValue: any) => {
		const red = a1libs.mixColor(252, 45, 75, 99);
		startOverlay(option, red, transcriptValue);
	};
	const useReadOptions = (options: DialogButton[]) => {
		if (compareTranscript.current.length > 0) {
			console.log(
				"Comparing transcript with options:",
				compareTranscript,
				options
			);
			let matchingOption: DialogButton | null = null;
			for (let index = 0; index < options.length; index++) {
				const option = options[index];
				if (
					option.text.toLowerCase().trim() ===
					compareTranscript.current[0].Dialogue.toLowerCase().trim()
				) {
					matchingOption = option;
					break;
				}
				if (compareTranscript.current[0].Dialogue === "[Any option]") {
					matchingOption = options[0];
					break;
				}
			}

			if (matchingOption) {
				console.log(`Matched option found: ${matchingOption.text}`);

				previousMatchingOption = matchingOption.text;

				handleMatchedOption(matchingOption, compareTranscript.current[0].Dialogue);
			} else {
				console.log("No match found for:", compareTranscript.current[0].Dialogue);
			}
		}
	};

	const stopSolver = () => {
		if (captureID) {
			clearInterval(captureID);
			captureID = null;
		}
	};

	return { startSolver: initialize, stopSolver, stopOverlay } as const;
};
