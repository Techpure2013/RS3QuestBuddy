import * as a1libs from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import {
	CTranscript,
	useCompareTranscript,
} from "./../../Fetchers/useCompareTranscript";
import { diagFinder } from "./handleImage";
type Color = {
	r: string;
	g: string;
	b: string;
	a: string;
};
export const useDialogSolver = () => {
	const dialogReader = new DialogReader();

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
	let compareTranscript: CTranscript[] = [];
	// function getRectColor() {
	// 	let rgbaColor = localStorage.getItem("dialogSolverColor");
	// 	if (rgbaColor !== null) {
	// 		const [r, g, b, a] = rgbaColor
	// 			.replace("rgba", "")
	// 			.replace("(", "")
	// 			.replace(")", "")
	// 			.split(",")
	// 			.map((value) => value.trim());

	// 		// Create the Color object
	// 		const rgbaColorObject: Color = {
	// 			r,
	// 			g,
	// 			b,
	// 			a,
	// 		};
	// 		console.log(rgbaColorObject); // Debug or use the object as needed
	// 		return rgbaColorObject;
	// 	} else {
	// 		const rgbaColorObject: Color = {
	// 			r: "255",
	// 			g: "255",
	// 			b: "0",
	// 			a: "99",
	// 		};
	// 		return rgbaColorObject;
	// 	}
	// }

	/**
	 * @description Initializes the Compare Transcript
	 */
	const initialize = () => {
		compareTranscript = JSON.parse(
			localStorage.getItem("CompareTranscript") || ""
		);
		console.log("Initializing Solver");
		startSolver();
	};
	/**
	 *
	 * @returns DialogButton[]
	 */
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
	/**
	 *
	 * @returns NPC Dialog
	 */
	function readDialog() {
		const diagboxCapture = a1libs.captureHoldFullRs();
		const findDialogue = dialogReader.checkDialog(diagboxCapture);
		if (findDialogue) {
			const readDialogue = dialogReader.readDialog(diagboxCapture, findDialogue);
			return readDialogue;
		}
	}
	/**
	 *
	 * Looks for Options on screen. On an active option Assigns activeOption to its Active Option
	 */
	function startReadCapture() {
		if (readCaptureID) {
			console.log("Interval already running, skipping...");
			return;
		}

		readCaptureID = setInterval(() => {
			let readOptions = readCapture();
			console.log(readOptions);
			if (readOptions !== null) {
				activeOption = readOptions.find((value) => value.active);
			}
		}, 600);
	}
	function stopReadCapture() {
		if (readCaptureID) {
			clearInterval(readCaptureID);
			readCaptureID = null;
		}
	}
	/**
	 *
	 * @param transcriptValue Holds the CompareTranscript[0].Dialogue value
	 * @description Looks for NPC Dialogue to Stop Overlay, Stop Dialogue Reader (Itself), and ReadCapture
	 *
	 */

	function startReadDialog(transcriptValue: string) {
		// Clear previous interval to prevent multiple active intervals
		let testCapture: DialogButton[] | null = null;
		let readNPCDialog: string[] | null | undefined = null;
		let questionedOption: boolean = false;
		while (readNPCDialog === undefined || null) {
			readNPCDialog = readDialog();
			testCapture = readCapture();
			if (!readNPCDialog) {
				break;
			}
			if (testCapture) {
				stopOverlay();
				questionedOption = testCapture.some(
					(value) => value.text === previousMatchingOption
				);
				if (!questionedOption) {
					const nextOptionDialogue =
						compareTranscript[1]?.Dialogue?.toLowerCase().trim();

					if (
						nextOptionDialogue &&
						testCapture.some(
							(value) => value.text.toLowerCase().trim() === nextOptionDialogue
						)
					) {
						const index = compareTranscript.findIndex(
							(value) => value.Dialogue === transcriptValue
						);
						if (index !== -1) {
							compareTranscript.splice(index, 1);
							console.log(`Removed dialogue before test capture at index: ${index}`);
							startSolver();
							return;
						}
					}
				}
			}
		}
		stopOverlay();

		// Simplified condition to handle transcript and active option check
		// const firstDialogue = compareTranscript[0]?.Dialogue?.toLowerCase().trim();
		// const activeOptionText = activeOption?.text?.toLowerCase().trim();

		// if (firstDialogue && activeOptionText === firstDialogue) {
		// 	console.log(`Active Option Read: ${activeOption}`);

		// 	// Directly remove from compareTranscript using the index
		// 	const index = compareTranscript.findIndex(
		// 		(value) => value.Dialogue === transcriptValue
		// 	);
		// 	if (index !== -1) {
		// 		compareTranscript.splice(index, 1);
		// 		console.log(`Removed dialogue at index: ${index}`);
		// 	}

		// 	previousOptions = null;
		// 	startSolver();
		// } else if (
		// 	firstDialogue?.startsWith("[Any option]") &&
		// 	activeOption?.active
		// ) {
		// 	const index = compareTranscript.findIndex(
		// 		(value) => value.Dialogue === transcriptValue
		// 	);
		// 	if (index !== -1) {
		// 		compareTranscript.splice(index, 1);
		// 		console.log(`Removed dialogue under 'Any option' at index: ${index}`);
		// 	}

		// 	previousOptions = null;
		// 	startSolver();
		// } else {
		// 	startSolver();
		// }
		// // Start a new interval
		// readDialogueID = setInterval(() => {
		// 	readDialog();
		// 	console.log(readNPCDialog);

		// 	if (readNPCDialog !== undefined) {
		// 		// Stop unnecessary processes early
		// 	} else {
		// 		const testCapture = readCapture();
		// 		if (testCapture) {
		// 			const questionedOption = testCapture.some(
		// 				(value) => value.text === previousMatchingOption
		// 			);

		// 			if (!questionedOption) {
		// 				stopOverlay();
		// 				stopDialogueReader();
		// 				stopReadCapture();

		// 				previousOptions = null;
		// 				startSolver();
		// 			}
		// 		}
		// 	}
		// }, 600); // You may also want to experiment with a slightly longer interval for better performance (e.g., 300ms).
	}

	function stopDialogueReader() {
		if (readDialogueID) {
			clearInterval(readDialogueID);
			readDialogueID = null;
		}
	}
	/**
	 *
	 * @param option DialogButton holds an Array of {Text, active, buttonx, x , y}
	 * @param color Color of the a1libs.mixColor
	 */
	function startOverlay(option: DialogButton, color: number) {
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
		}, 600);
	}
	function stopOverlay() {
		if (overlayID) {
			clearInterval(overlayID);
			overlayID = null;
		}
	}
	/**
	 *
	 * @description Starts the dialog solver initially
	 */
	function startSolver() {
		if (!compareTranscript || compareTranscript.length === 0) {
			console.warn("Transcript data not available. Ensure it's loaded.");
			return;
		}
		if (captureID) {
			clearInterval(captureID);
			captureID = null;
		}
		compareTranscript = compareTranscript.filter(
			(option) => option.Dialogue !== "[Accept Quest]"
		);
		captureID = setInterval(() => {
			const options = readCapture();
			if (acceptButtonFinder.find() !== undefined) {
				acceptButtonFinder.find();
			}
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
		}, 600);
	}

	// Update handleMatchedOption to expect a single DialogButton
	/**
	 *
	 * @param option
	 * @param transcriptValue
	 * @description Is a median between useReadOptions and Start Overlay, Read Dialog, and readCapture(ReadOptions)
	 */
	function handleMatchedOption(option: DialogButton, transcriptValue: any) {
		let mixColor = a1libs.mixColor(255, 0, 255);

		// let color = a1libs.mixColor(
		// 	Number(mixColor.r),
		// 	Number(mixColor.g),
		// 	Number(mixColor.b),
		// 	Math.round(Number(mixColor.a) * 100)
		// );
		startOverlay(option, mixColor);
		startReadDialog(transcriptValue);
		startReadCapture();
	}
	/**
	 *
	 * @param options DialogButton[]
	 * @description Compares the CompareTranscript[0].Dialogue to All option boxes available.
	 */
	function useReadOptions(options: DialogButton[]) {
		if (compareTranscript.length > 0) {
			let matchingOption: DialogButton | null = null;
			for (let index = 0; index < options.length; index++) {
				const option = options[index];
				if (
					option.text.toLowerCase().trim() ===
					compareTranscript[0].Dialogue.toLowerCase().trim()
				) {
					matchingOption = option;
					break;
				}
				if (compareTranscript[0].Dialogue === "[Any option]") {
					matchingOption = options[0];
					break;
				}
			}

			if (matchingOption) {
				previousMatchingOption = matchingOption.text;

				handleMatchedOption(matchingOption, compareTranscript[0].Dialogue);
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
		compareTranscript,
	} as const;
};
