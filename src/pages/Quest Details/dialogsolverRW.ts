import * as a1libs from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import { diagFinder } from "./handleImage";
import { useRef } from "react";

export const useDialogSolver = () => {
	const dialogReader = new DialogReader();
	const diagHelp = new diagFinder();
	const mixedColor = a1libs.mixColor(255, 255, 0);
	let optionsRead: DialogButton[] | null | undefined = null;

	let currentStep = useRef<string>("");
	let currentStepChatOptions = useRef<number[]>([]);

	let activeOption: DialogButton | undefined = undefined;
	let activeStep: boolean = false;
	const intervalIds = useRef<Record<string, NodeJS.Timeout | null>>({
		optionsRead: null,
		overlay: null,
		secondRead: null,
	});
	//Currently has issues with Multiple steps clicked at a time. Cannot seem to clear intervals before
	//they are called again.
	const clearIntervalById = (key: keyof typeof intervalIds.current) => {
		if (intervalIds.current[key]) {
			clearInterval(intervalIds.current[key]!);
			intervalIds.current[key] = null;
			console.log(`Cleared interval: ${key}`);
		}
	};

	const clearAllIntervals = () => {
		Object.keys(intervalIds.current).forEach((key) =>
			clearIntervalById(key as keyof typeof intervalIds.current)
		);
		console.log("Cleared all intervals");
	};
	/**
	 * @Description Run's the first capture of each step.
	 */
	function run() {
		clearAllIntervals();
		intervalIds.current.optionsRead = setInterval(() => {
			activeStep = true;
			const rsScreenCapture = a1libs.captureHoldFullRs();
			diagHelp.find();
			optionsRead = readOptionBox(rsScreenCapture);
			if (optionsRead !== null && optionsRead !== undefined) {
				useOptionsRead(optionsRead);
			}
		}, 600);
	}
	/**
	 *
	 * @param currentStep
	 * @Description Filters out Chat Options on Step String returned from stepCapture
	 */
	function getChatOptions(currentStep: string) {
		let match = currentStep.match(/\(Chat\s*([\d~•✓]*)\)/);
		if (match !== null) {
			let splitValues: string[] = match[1]
				.split("•")
				.filter((value) => value !== "✓") // Remove "✓"
				.map((value) => (value === "~" ? "1" : value)) // Replace "~" with "1"
				.filter((value) => value !== undefined);
			const numericValues = splitValues.map(Number);
			currentStepChatOptions.current.splice(
				0,
				currentStepChatOptions.current.length
			);
			currentStepChatOptions.current.push(...numericValues);
			clearAllIntervals();
			run();
			console.log(currentStepChatOptions.current);
		}
	}
	/**
	 *@Description Captures the current step through alt1 hotkey or click of step on main questpage
	 */
	function stepCapture(step: string) {
		currentStep.current = step;
		getChatOptions(currentStep.current);
		console.log("Step Captured:", currentStep.current);
	}
	/**
	 *
	 * @param option
	 * @returns Void
	 * @Description Tries to capture the active state of the Option buttons on screen. Sets activeOption.
	 */
	function overlayReadCapture(option: DialogButton) {
		const rsCapture = a1libs.captureHoldFullRs();
		console.log(rsCapture);
		if (rsCapture.handle === 0) {
			clearIntervalById("overlay");
			clearIntervalById("secondRead");
		}
		const optionBoxLoc = dialogReader.findOptions(rsCapture);
		console.log(optionBoxLoc);
		if (optionBoxLoc.length === 0) {
			//If optionBoxLoc: DialogButtonLocation[] === 0 only
			clearIntervalById("overlay");
			clearIntervalById("secondRead");
			clearIntervalById("optionsRead");
			getChatOptions(currentStep.current);
		}
		const options = dialogReader.readOptions(rsCapture, optionBoxLoc);
		activeOption = options?.find((value) => value.active); // Assigns active value to activeOption
		if (activeOption !== undefined) {
			if (activeOption?.active) {
				console.log(activeOption);

				if (activeOption.text === option.text) {
					clearIntervalById("overlay");
					currentStepChatOptions.current.splice(0, 1);
					activeStep = false;
				}
			}
			clearIntervalById("secondRead");
			if (currentStepChatOptions.current.length > 0) {
				console.log(currentStepChatOptions);
				activeStep = false;
				run();
			} else {
				return;
			}
		}
		console.log(activeOption);
	}
	function runOverlayReadCapture(option: DialogButton) {
		intervalIds.current.secondRead = setInterval(() => {
			overlayReadCapture(option);
		}, 50); // So far captures option button quite regularly
	}
	/**
	 *
	 * @param option
	 * @Description  Starts a Capture of options
	 */
	function calculateOverlayStop(option: DialogButton) {
		runOverlayReadCapture(option);
	}
	/**
	 * @Description Stops original Options Capture. Starts overlay with Options: Dialogbutton
	 */
	function startOverlay(option: DialogButton) {
		clearIntervalById("optionsRead");
		calculateOverlayStop(option);
		if (option !== undefined) {
			intervalIds.current.overlay = setInterval(() => {
				alt1.overLaySetGroup("Overlay"); // Test
				alt1.overLayRect(
					mixedColor,
					option.buttonx,
					Math.round(option.y - 10), //If is negative throws out of bounds error
					Math.round(option.x / 2), //If is negative throws out of bounds error
					25,
					600,
					4
				);
			}, 900);
		} else {
			alt1.overLayClearGroup("Overlay"); // Test
		}
	}
	/**
	 *
	 * @param options
	 * @Description Sends Options[0] and CurrentStepChatOptions[0] to StartOverlay
	 */
	function useOptionsRead(options: undefined | DialogButton[] | null) {
		if (!options || options.length === 0) {
			return console.log("Looking for options");
		}
		if (currentStepChatOptions.current.length < 0)
			return console.log("No Current Options");
		console.log(options);
		for (let index = 0; index < currentStepChatOptions.current.length; index++) {
			const currentStepChatOption = currentStepChatOptions.current[index];

			switch (
				currentStepChatOption //Switch Statement
			) {
				case 1: //Captures a [1]
					startOverlay(options[0]); // First Option Box
					return;
				case 2: //Captures a [2]
					startOverlay(options[1]); // Second Option Box
					return;
				case 3: //Captures a [3]
					startOverlay(options[2]); // Third Option Box
					return;
				case 4: //Captures a [4]
					startOverlay(options[3]); // Fourth Option Box
					return;
				case 5: //Captures a [5]
					startOverlay(options[4]); // Fifth Option Box
					return;
			}
			//So far I have not seen 6 option choices at once.
		}
	}
	/**
	 *
	 *
	 * @param {a1libs.ImgRefBind} capture
	 * @return {DialogButton[] | null}
	 */
	function readOptionBox(capture: a1libs.ImgRefBind) {
		dialogReader.find(capture);
		if (!capture) return;
		try {
			let optionBoxLoc = dialogReader.findOptions(capture);
			if (!optionBoxLoc) {
				console.warn("No options found");
			}
			let optionsFound = dialogReader.readOptions(capture, optionBoxLoc);
			return optionsFound;
		} catch (e) {} //Supresses No Option Box Present because (!optionBoxLoc doesnt have a .Length to match to 0)
	}
	return { run, stepCapture };
};
