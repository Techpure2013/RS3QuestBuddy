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
	let optionsRead: DialogButton[] | null = null;
	function readOptionBox(capture: a1libs.ImgRefBind) {
		dialogReader.find(capture);
		if (!capture) return Error("Cannot Locate RS Screen");
		let optionBoxLoc = dialogReader.findOptions(capture);
		if (!optionBoxLoc) return Error("No Options Found");
		let optionsFound = dialogReader.readOptions(capture, optionBoxLoc);
		return optionsFound;
	}
	function run() {
		const rsScreenCapture = a1libs.captureHoldFullRs();
		while (optionsRead!.length < 0) {
			optionsRead = readOptionBox(rsScreenCapture);
		}
	}
};
