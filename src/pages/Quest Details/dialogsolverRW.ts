import * as a1libs from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import { useCompareTranscript } from "./../../Fetchers/useCompareTranscript";
import { diagFinder } from "./handleImage";
type Color = {
	r: string;
	g: string;
	b: string;
	a: string;
};
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
	const initialize = async () => {
		await getCompareTranscript(questName);

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
			if (readOptions !== null) {
				activeOption = readOptions.find((value) => value.active);
			}
		}, 200);
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
	function startReadDialog(transcriptValue: any) {
		readDialogueID = setInterval(() => {
			readNPCDialog = readDialog();
			if (readNPCDialog !== undefined) {
				stopOverlay();
				stopDialogueReader();
				stopReadCapture();

				if (
					activeOption?.text.toLowerCase().trim() ===
					compareTranscript.current[0].Dialogue.toLowerCase().trim()
				) {
					console.log(`Active Option Read: ${activeOption}`);
					const index = compareTranscript.current.findIndex(
						(value) => value.Dialogue === transcriptValue
					);
					console.log(`Index used under Not Undefined NPC Dialog ${index}`);
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
					if (!questionedOption) {
						stopOverlay();
						stopDialogueReader();
						stopReadCapture();
						if (
							//returns if the option that you went into is the next option in the compare transcript array
							testCapture.some(
								(value) =>
									value.text.toLowerCase().trim() ===
									compareTranscript.current[0 + 1].Dialogue.toLowerCase().trim()
							)
						) {
							const index = compareTranscript.current.findIndex(
								(value) => value.Dialogue === transcriptValue
							);
							console.log(`Am before deleting index under test capture ${index}`);
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
		}, 900);
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
		compareTranscript,
	} as const;
};
