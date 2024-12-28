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
	let acceptButtonTwice: number = 0;
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
		const found = dialogReader.find(diagboxCapture);
		if (found) {
			const findDialogue = dialogReader.checkDialog(diagboxCapture);
			if (findDialogue) {
				const readDialogue = dialogReader.readDialog(diagboxCapture, findDialogue);
				return readDialogue;
			}
		}
	};
	const startAcceptButtonFinder = () => {
		let attemptCount = 0; // Counter to track attempts
		const maxAttempts = 5; // Maximum number of attempts allowed

		acceptButtonID = setInterval(() => {
			stopSolver();
			acceptButtonFinder.find();
			console.log(acceptButtonFinder.find());

			attemptCount++; // Increment the counter

			// Check if maximum attempts have been reached
			if (attemptCount >= maxAttempts) {
				console.warn(
					`Max attempts (${maxAttempts}) reached. Stopping acceptButtonFinder.`
				);
				previousOptions = null;
				stopButtonFinder();
				startSolver(); // Stop the interval
			}
		}, 500);
	};
	const startOverlay = (option: DialogButton, color: number) => {
		console.log("starting overlay: ", option);
		stopSolver();
		overlayID = setInterval(() => {
			readNPCDialog = readDialog();
			if (readNPCDialog !== undefined) {
				stopOverlay();
				compareTranscript.current.reverse().pop();
				compareTranscript.current.reverse();
				startSolver();
			} else {
				let testCapture = readCapture();
				if (testCapture) {
					let questionedOption = testCapture.some(
						(value) => value.text == previousMatchingOption
					);
					console.log(compareTranscript);
					if (!questionedOption) {
						stopOverlay();
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
				700,
				4
			);
		}, 1000);
	};
	const stopOverlay = () => {
		if (overlayID) {
			clearInterval(overlayID);
		}
	};
	const stopButtonFinder = () => {
		if (acceptButtonID) {
			clearInterval(acceptButtonID);
		}
	};
	const startSolver = () => {
		if (!compareTranscript.current || compareTranscript.current.length === 0) {
			console.warn("Transcript data not available. Ensure it's loaded.");
			return;
		}

		captureID = setInterval(() => {
			const options = readCapture();
			if (options) {
				stopButtonFinder();
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
		}, 1000);
	};

	// Update handleMatchedOption to expect a single DialogButton
	const handleMatchedOption = (option: DialogButton, transcriptValue: any) => {
		const red = a1libs.mixColor(252, 45, 75, 99);
		startOverlay(option, red);
	};
	const useReadOptions = (options: DialogButton[]) => {
		if (compareTranscript.current.length > 0) {
			console.log(
				"Comparing transcript with options:",
				compareTranscript,
				options
			);

			// Iterate over transcript values and match with options
			for (const transcriptValue of compareTranscript.current) {
				if (!transcriptValue || typeof transcriptValue.Dialogue !== "string") {
					console.warn(
						"Skipping due to invalid or undefined transcript value:",
						transcriptValue
					);
					continue;
				}

				const matchingOption = options.find((value) => {
					if (!value || typeof value.text !== "string") {
						console.warn("Skipping due to invalid or undefined option:", value);
						return false;
					}
					if (transcriptValue.Dialogue === "[Accept Quest]") {
						return true;
					}
					if (transcriptValue.Dialogue === "[Any option]") {
						return true;
					}
					return (
						value.text.trim().toLowerCase() ===
						transcriptValue.Dialogue.trim().toLowerCase()
					);
				});

				if (matchingOption) {
					console.log(`Matched option found: ${matchingOption.text}`);

					previousMatchingOption = matchingOption.text;

					if (transcriptValue.Dialogue === "[Accept Quest]") {
						startAcceptButtonFinder();
						compareTranscript.current.reverse().pop();
						compareTranscript.current.reverse();
						break;
					}

					if (transcriptValue.Dialogue === "[Any option]") {
						handleMatchedOption(matchingOption, transcriptValue);
						break;
					}

					handleMatchedOption(matchingOption, transcriptValue);
					break;
				} else {
					console.log("No match found for:", transcriptValue.Dialogue);
				}
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
