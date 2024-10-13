import * as a1lib from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import { TypedEmitter } from "./../Handlers/TypeEmitter";
import { diagFinder } from "../Handlers/handleImage";

type Points = {
	x: number;
	y: number;
	width: number;
	buttonX: number;
	displayIndex: number;
};
type readerEvents = {
	change: {
		dialogTitle: string;
		readOption: DialogButton[] | null;
		charDialog: string | undefined;
		bestMatchX: Points["x"];
		bestMatchY: Points["y"];
		currentBestMatches: Points[];
		previousBestMatches: Points[];
		ReadOptionStart: () => void;
	};
};
export class DiagReader extends TypedEmitter<readerEvents> {
	diagInterval: number = 0;
	color = a1lib.mixColor(255, 0, 0);
	textColor = a1lib.mixColor(255, 255, 255);
	diagW: number = 0;
	diagH: number = 0;
	diagX: number = 0;
	diagY: number = 0;
	charDialog: string | undefined = "";
	readOption: DialogButton[] | null = [];
	currentBestMatches: Points[] = [
		{ x: 0, y: 0, width: 0, buttonX: 0, displayIndex: 1 },
	];
	previousBestMatches: Points[] = [
		{ x: 0, y: 0, width: 0, buttonX: 0, displayIndex: 1 },
	];
	bestMatchX: Points["x"] = 0;
	bestMatchY: Points["y"] = 0;
	diagTitle: string = "";
	coordX: number = 0;
	coordY: number = 0;
	buttonX: number = 0;
	diagReader = new DialogReader();
	cTStore: string[] = [];
	uniqueCoordinates: Record<string, { x: number; y: number }> = {};
	coordinateCounts: Record<string, number> = {};
	optionInterval: number | null = 1;
	dialogInterval: number = 1;
	displayNumber: number = 1;
	widthBox: number = 0;
	anyOption: boolean = false;
	dialogHelp = new diagFinder();
	intervalIds: any[] = [];
	prevTitle: string = "";
	timeoutID: NodeJS.Timeout | undefined;
	intervalId: NodeJS.Timeout | undefined;
	optionFound = false;
	constructor() {
		super();
		this.readDiagOptions = this.readDiagOptions.bind(this);
		this.displayBox = this.displayBox.bind(this);
		this.toggleOptionInterval = this.toggleOptionInterval.bind(this);
		this.toggleOptionRun = this.toggleOptionRun.bind(this);
		this.getCState = this.getCState.bind(this);
		this.displayBox = this.displayBox.bind(this);
		this.levenshteinDistance = this.levenshteinDistance.bind(this);
		this.processDialog = this.processDialog.bind(this);
		this.processMatching = this.processMatching.bind(this);
		this.findBestMatchIndex = this.findBestMatchIndex.bind(this);
		this.updateDiagDimensions = this.updateDiagDimensions.bind(this);
		this.emit = this.emit.bind(this);
		this.on = this.on.bind(this);
		this.off = this.off.bind(this);
		this.populateUniqueCoordinates = this.populateUniqueCoordinates.bind(this);
		this.readCapture = this.readCapture.bind(this);
	}
	public start() {
		this.readDiagOptions();
	}
	public getCState(): readerEvents["change"] {
		return {
			ReadOptionStart: () => this.readDiagOptions(),
			readOption: this.readOption,
			dialogTitle: this.diagTitle,
			charDialog: this.charDialog,
			bestMatchX: this.bestMatchX,
			bestMatchY: this.bestMatchY,
			previousBestMatches: this.previousBestMatches,
			currentBestMatches: this.currentBestMatches,
		};
	}

	public toggleOptionInterval(
		run: boolean,

		interval: number
	) {
		try {
			if (run && this.optionInterval == 1) {
				this.optionInterval = +setInterval(() => {
					this.start();
				}, interval);
				this.intervalIds.push(this.optionInterval);
			} else if (!run && this.optionInterval) {
				clearInterval(this.optionInterval);
				this.optionInterval = 1;
			}
		} catch (error) {
			console.error("Error toggling option interval:", error);
		}
	}
	toggleOptionRun(run: boolean): void {
		this.toggleOptionInterval(run, 600);
	}

	private readDiagOptions() {
		const diagboxcapture = a1lib.captureHoldFullRs();
		if (!this.diagReader!.pos) {
			this.diagReader.find(diagboxcapture);
		}
		this.updateDiagDimensions();
		this.emit("change", this.getCState());
		if (this.diagH !== 0 && this.diagW !== 0) {
			try {
				const findOptions = this.diagReader.findOptions(diagboxcapture);
				if (findOptions) {
					this.readOption = this.diagReader.readOptions(diagboxcapture, findOptions);

					this.emit("change", this.getCState());
				} else {
					console.error("findOptions not found or invalid.");
				}
				this.processDialog(diagboxcapture);
				this.processMatching();
			} catch (error) {
				console.warn("Cannot See Options Normal Response", error);
			}
		} else {
			console.error("Invalid diagH or diagW values.");
		}
	}
	private updateDiagDimensions(): void {
		this.diagH = this.diagReader.pos?.height!;
		this.diagW = this.diagReader.pos?.width!;
		this.diagX = this.diagReader.pos?.x!;
		this.diagY = this.diagReader.pos?.y!;
	}
	private processDialog(diagboxcapture: any): void {
		const checked = this.diagReader.checkDialog(diagboxcapture);
		const charDialogArray = this.diagReader.readDialog(diagboxcapture, checked);
		this.charDialog = charDialogArray?.join(" ");
		this.emit("change", this.getCState());
		this.diagTitle = this.diagReader.readTitle(diagboxcapture);
		this.emit("change", this.getCState());
		if (this.charDialog?.length === 0) {
			console.warn("Did not find Character Dialog");
			this.resetVariables();
		}
	}
	private bestMatchIndex: number = 0;
	private maxIteration: number = 1;
	private iterationCount: number = 0;
	private processMatching(): void {
		this.iterationCount = 0;
		if (this.cTStore.length !== 0 && this.readOption!.length !== 0) {
			for (const value of this.cTStore) {
				this.bestMatchIndex = this.findBestMatchIndex(value.toLowerCase());
				if (this.bestMatchIndex !== -1) {
					const usedIndex = this.cTStore.indexOf(value);
					const length = this.readOption!.length;
					let width = 220;
					if (length === 4) {
						width = 315;
					} else if (length === 5) {
						width = 288;
					}
					this.readOption![this.bestMatchIndex].width = width;
					this.currentBestMatches.push({
						x: this.readOption![this.bestMatchIndex].x,
						y: this.readOption![this.bestMatchIndex].y,
						width: this.readOption![this.bestMatchIndex].width,
						buttonX: this.readOption![this.bestMatchIndex].buttonx,
						displayIndex: this.currentBestMatches.length,
					});
					if (this.iterationCount < this.maxIteration) {
						const usedValue = this.cTStore.splice(usedIndex, 1)[0];
						this.cTStore.push(usedValue);
					}
					this.emit("change", this.getCState());
					this.anyOption = false;
					this.iterationCount++;
				}
				if (this.iterationCount >= this.maxIteration) {
					break;
				}
			}
			if (this.currentBestMatches.length === 0) {
				const randomIndex = Math.floor(Math.random() * this.readOption!.length);
				const randomCoordinate = this.readOption![randomIndex];
				this.currentBestMatches.push({
					x: randomCoordinate.x,
					y: randomCoordinate.y,
					width: randomCoordinate.width,
					buttonX: randomCoordinate.buttonx,
					displayIndex: this.currentBestMatches.length,
				});
				this.anyOption = true;
			}
			this.populateUniqueCoordinates();
		} else {
			this.timeoutID = setTimeout(() => {
				this.dialogHelp.find();
			}, 2000);

			console.warn(
				"Transcript Could not be found because there are no readoptions on screen"
			);
		}
	}
	private findBestMatchIndex(value: string): number {
		let bestMatchDistance = Infinity;
		let bestMatchIndex = -1;
		for (let i = 0; i < this.readOption!.length; i++) {
			const option = this.readOption![i].text.toLowerCase();
			const distance = this.levenshteinDistance(value, option);
			const similarityThreshold = 2;

			if (distance <= similarityThreshold && distance < bestMatchDistance) {
				bestMatchDistance = distance;
				bestMatchIndex = i;
			}
		}
		return bestMatchIndex;
	}
	public levenshteinDistance(a: string, b: string): number {
		const matrix: number[][] = [];
		for (let i = 0; i <= a.length; i++) {
			matrix[i] = [i];
		}
		for (let j = 0; j <= b.length; j++) {
			matrix[0][j] = j;
		}
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j - 1] + cost
				);
			}
		}
		return matrix[a.length][b.length];
	}
	private resetVariables() {
		this.currentBestMatches = [];
		this.previousBestMatches = [];
	}
	private populateUniqueCoordinates() {
		for (const coord of this.currentBestMatches) {
			const key = `${coord.x},${coord.y},${coord.width},${coord.buttonX}`;
			this.uniqueCoordinates[key] = { ...coord };
		}
		this.currentBestMatches = [];

		this.displayBox();
	}
	private readCapture() {
		const diagboxcapture = a1lib.captureHoldFullRs();
		const findReadOptions = this.diagReader.findOptions(diagboxcapture);
		const readingOptions = this.diagReader.readOptions(
			diagboxcapture,
			findReadOptions
		);
		let readCount = 0;
		if (readingOptions?.length == 0) {
			if (readingOptions?.length == 0 && readCount > 2) {
				this.toggleOptionInterval(true, 600);
			}
			readCount = readCount + 1;
		}
	}
	private handleCoordinates() {
		if (this.uniqueCoordinates["0,0,0,0"]) {
			delete this.uniqueCoordinates["0,0,0,0"];
		}
		const keys = Object.keys(this.uniqueCoordinates);

		if (keys.length > 0) {
			const [x, y, width, buttonX] = keys[0]
				.split(",")
				.map((value) => Number(value.trim()));
			this.coordX = x;
			this.coordY = y;
			this.widthBox = width;
			this.buttonX = buttonX;
		}
	}
	private displayBox() {
		this.handleCoordinates();
		const delay = 1000; // 2 seconds
		this.toggleOptionRun(false);
		const text = this.anyOption ? "Any Option" : "Select --->";

		alt1.overLayText(
			text,
			this.textColor,
			13,
			this.buttonX - 95,
			this.coordY - 13,
			1000
		);
		alt1.overLayRect(
			this.color,
			this.buttonX,
			this.coordY - 13,
			this.widthBox,
			this.diagH / 2 - 40,
			1000,
			3
		);
		this.timeoutID = setTimeout(() => {
			delete this.uniqueCoordinates[
				`${this.coordX},${this.coordY},${this.widthBox},${this.buttonX}`
			];

			if (Object.keys(this.uniqueCoordinates).length === 0) {
				this.displayNumber = 1;

				this.toggleOptionInterval(true, 600);

				return;
			}
			this.displayBox();
		}, delay);
	}
	//notes
	// Iterate over the keys
	//Five Options:
	//X1: 586  X2: 569 X3: 599 X4: 608 X5: 536
	//Y1: 708  Y2: 727 Y3: 746 Y4: 765 Y5: 784
	//W1: 288  W2: 288 W3: 288 W4: 376 W5: 288
	// H: 130 --------------------------------
	//Four Options:
	//X1: 769  X2: 766 X3: 704 X4: 746  BUTTON X: 673
	//Y1: 884  Y2: 907 Y3: 930 Y4: 953  BUTTON X: 673
	//W1: 311  W2: 311 W3: 311 W4: 385  BUTTON X: 673
	// H: 130   H: 130  H: 130 H4: 130  BUTTON X: 673
	//////Three Options:
	//  First   Second    Third
	//X1: 800   X2: 744   X3: 800   BUTTON  X: 731
	//Y1: 947   Y2: 919   Y3: 947   BUTTON  X: 731
	// W: 196    W: 196    W: 196   BUTTON  X: 731
	// H: 130    H: 130    H: 130   BUTTON  X: 731
	///////////////////////////
	//Two Options:
	//X1: 753 X2: 783   BUTTON  X: 720
	//Y1: 905 Y2: 933
	//W1: 332 W2: 234
	// H: 130  H: 130
}
