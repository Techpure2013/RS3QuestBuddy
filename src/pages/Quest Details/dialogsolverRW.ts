import * as a1libs from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import { useCompareTranscript } from "./../../Fetchers/useCompareTranscript";
import { diagFinder } from "./handleImage";
export const useDialogSolver = (questName: string) => {
	const dialogReader = new DialogReader();
	const { compareTranscript, getCompareTranscript } = useCompareTranscript();
	let captureID: NodeJS.Timeout | null = null;
	let overlayID: NodeJS.Timeout | null = null;
	let acceptButtonFinder = new diagFinder();
	let readOptions: DialogButton[] | null = null;
	let readNPCDialog: string[] | null | undefined = null;
	let previousOptions: DialogButton[] | null = null;
	let previousMatchingOption: string | null = null;
	let readDialogueID: NodeJS.Timeout | null = null;
	let readCaptureID: NodeJS.Timeout | null = null;
	let activeOption: DialogButton | undefined = undefined;
	const red = a1libs.mixColor(252, 45, 75, 99);
	// Ensure `compareTranscript` is loaded before starting the interval
	const initialize = async () => {
		await getCompareTranscript(questName);
		startSolver();
	};

	function readCapture(): DialogButton[] | null {
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
	}
	function readDialog() {
		const diagboxCapture = a1libs.captureHoldFullRs();
		const findDialogue = dialogReader.checkDialog(diagboxCapture);
		if (findDialogue) {
			const readDialogue = dialogReader.readDialog(diagboxCapture, findDialogue);
			return readDialogue;
		}
	}
	function startReadCapture() {
		if (readCaptureID) {
			console.log("Interval already running, skipping...");
			return;
		}

		readCaptureID = setInterval(() => {
			let readOptions = readCapture();
			console.log(readOptions);
			if (readOptions !== null) {
				for (let index = 0; index < readOptions!.length; index++) {
					let value = readOptions[index];
					if (value.active) {
						activeOption = value;
						break;
					}
				}
			}
		}, 300);
	}
	function stopReadCapture() {
		if (readCaptureID) {
			clearInterval(readCaptureID);
			readCaptureID = null;
		}
	}
	function startReadDialog(transcriptValue: any) {
		readDialogueID = setInterval(() => {
			readNPCDialog = readDialog();

			console.log(readNPCDialog);
			if (readNPCDialog !== undefined) {
				stopOverlay();
				stopDialogueReader();
				stopReadCapture();

				if (
					activeOption?.text.toLowerCase().trim() ===
					compareTranscript.current[0].Dialogue.toLowerCase().trim()
				) {
					const index = compareTranscript.current.findIndex(
						(value) => value.Dialogue === transcriptValue
					);

					if (index !== -1) {
						compareTranscript.current.splice(index, 1);
					}
					previousOptions = null;
					startSolver();
				} else {
					startSolver();
				}
			} else {
				let testCapture = readCapture();
				if (testCapture) {
					let questionedOption = testCapture.some(
						(value) => value.text === previousMatchingOption
					);
					console.log(compareTranscript);
					if (!questionedOption) {
						stopOverlay();
						stopDialogueReader();
						stopReadCapture();
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
		}, 300);
	}
	function stopDialogueReader() {
		if (readDialogueID) {
			clearInterval(readDialogueID);
			readDialogueID = null;
		}
	}
	function startOverlay(
		option: DialogButton,
		color: number,
		transcriptValue: any
	) {
		stopSolver();

		overlayID = setInterval(() => {
			if (!dialogReader.find(a1libs.captureHoldFullRs())) {
				stopOverlay();
				stopDialogueReader();
				stopReadCapture();
				previousOptions = null;
				startSolver();
			}
			alt1.overLayRect(
				color,
				option.buttonx,
				Math.round(option.y - 10),
				Math.round(option.x / 2),
				25,
				600,
				4
			);
		}, 900);
	}
	function stopOverlay() {
		if (overlayID) {
			clearInterval(overlayID);
			overlayID = null;
		}
	}
	function startSolver() {
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
				}
			}
		}, 300);
	}

	// Update handleMatchedOption to expect a single DialogButton
	function handleMatchedOption(option: DialogButton, transcriptValue: any) {
		startOverlay(option, red, transcriptValue);
		startReadDialog(transcriptValue);
		startReadCapture();
	}
	function useReadOptions(options: DialogButton[]) {
		if (compareTranscript.current.length > 0) {
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
				previousMatchingOption = matchingOption.text;

				handleMatchedOption(matchingOption, compareTranscript.current[0].Dialogue);
			}
		}
	}

	function stopSolver() {
		if (captureID) {
			clearInterval(captureID);
			captureID = null;
		}
	}
	function stopEverything() {
		if (captureID) {
			clearInterval(captureID);
			captureID = null;
		}
		if (overlayID) {
			clearInterval(overlayID);
			overlayID = null;
		}
		if (readDialogueID) {
			clearInterval(readDialogueID);
			readDialogueID = null;
		}
		if (readCaptureID) {
			clearInterval(readCaptureID);
			readCaptureID = null;
		}
	}
	return {
		startSolver: initialize,
		stopEverything,
	} as const;
};
