import * as a1libs from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import {
	CTranscript,
	useCompareTranscript,
} from "../../Fetchers/useCompareTranscript";
import { diagFinder } from "./handleImage";
import { useRef, useState } from "react";
type Color = {
	r: string;
	g: string;
	b: string;
	a: string;
};
export const useDialogSolver = () => {
	const dialogReader = new DialogReader();
	const mixedColor = a1libs.mixColor(255, 255, 0);
	let optionsRead: DialogButton[] | null | undefined = null;
	let optionsReadID: NodeJS.Timeout | null = null;
	let currentStep = useRef<string>("");
	let currentStepChatOptions = useRef<number[]>([]);
	let overlayID: NodeJS.Timeout | null = null;

	function run() {
		if (optionsReadID) return;

		optionsReadID = setInterval(() => {
			const rsScreenCapture = a1libs.captureHoldFullRs();
			optionsRead = readOptionBox(rsScreenCapture);
			if (optionsRead !== null && optionsRead !== undefined) {
				if (optionsReadID) {
					clearInterval(optionsReadID);
				}
				optionsReadID = null;
				console.log(optionsRead);
				useOptionsRead(optionsRead);
			}
		}, 600);
	}
	function getChatOptions(currentStep: string) {
		let match = currentStep.match(/\(Chat\s*([\d~•✓]*)\)/);
		if (match !== null) {
			const splitValues = match[1].split("•").filter((value) => value !== "✓"); // Remove "✓"
			const numericValues = splitValues.map(Number);
			currentStepChatOptions.current.splice(
				0,
				currentStepChatOptions.current.length
			);
			currentStepChatOptions.current.push(...numericValues);
			run();
			console.log(currentStepChatOptions.current);
		}
	}
	function stepCapture(step: string) {
		currentStep.current = step;
		getChatOptions(currentStep.current);
		console.log("Step Captured:", currentStep.current);
	}
	function startOverlay(option: DialogButton) {
		if (optionsReadID) {
			optionsReadID = null;
		}
		console.log(option);
		overlayID = setInterval(() => {
			alt1.overLayRect(
				mixedColor,
				option.x,
				option.y,
				option.width,
				option.buttonx,
				900,
				2
			);
		}, 1200);
	}
	function useOptionsRead(options: undefined | DialogButton[] | null) {
		if (options === null) return console.log("i've returned");
		if (options === undefined) return console.log("i've returned");
		console.log("I am past option check");
		if (currentStepChatOptions.current[0] === 1) {
			startOverlay(options[0]);
		}
		if (currentStepChatOptions.current[1] === 2) {
			startOverlay(options[1]);
		}
		if (currentStepChatOptions.current[2] === 3) {
			console.log("");
			startOverlay(options[2]);
		}
		if (currentStepChatOptions.current[3] === 4) {
			startOverlay(options[3]);
		}
		if (currentStepChatOptions.current[4] === 5) {
			startOverlay(options[4]);
		}
	}
	function readOptionBox(capture: a1libs.ImgRefBind) {
		dialogReader.find(capture);
		if (!capture) return;
		try {
			let optionBoxLoc = dialogReader.findOptions(capture);
			if (!optionBoxLoc) return;
			let optionsFound = dialogReader.readOptions(capture, optionBoxLoc);
			return optionsFound;
		} catch (e) {
			console.info(e);
		}
	}
	return { run, stepCapture };
};
