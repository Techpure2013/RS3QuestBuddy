import * as a1lib from "alt1";
import DialogReader, { DialogButton } from "alt1/dialog";
import { TypedEmitter } from "./../Handlers/TypeEmitter";
import { diagFinder } from "../Handlers/handleImage";

/**
 *
 * @property x - The x-coordinate of the point.
 * @property y - The y-coordinate of the point.
 */
type Points = {
	x: number;
	y: number;
	width: number;
	buttonX: number;
	displayIndex: number;
};

/**
 * Defines the structure of the events emitted by a reader component.
 * @property change - Event triggered when there is a change in the reader state.
 * @property error - Event triggered when an error occurs in the reader.
 * @property return - Event triggered when the reader returns some data.
 */
type readerEvents = {
	change: {
		/**
		 * Title of the dialog box.
		 */
		dialogTitle: string;

		/**
		 * Options available for the dialog buttons.
		 */
		readOption: DialogButton[] | null;

		/**
		 * Optional character dialog to be displayed.
		 */
		charDialog: string | undefined;

		/**
		 * X-coordinate of the best matching point.
		 */
		bestMatchX: Points["x"];

		/**
		 * Y-coordinate of the best matching point.
		 */
		bestMatchY: Points["y"];

		/**
		 * Array of current best matching points.
		 */
		currentBestMatches: Points[];

		/**
		 * Array of previous best matching points.
		 */
		previousBestMatches: Points[];
		ReadOptionStart: () => void;
	};
};
/**
 * DiagReader class responsible for reading dialogues and emitting events.
 * Extends TypedEmitter to handle typed events.
 */

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

	/**
	 * Constructs a new DiagReader instance.
	 * Initializes properties and binds methods.
	 */
	constructor() {
		super();
		// Bind methods to the current instance
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
	/**
	 * Retrieves the current state of the DiagReader.
	 * @returns The current state as a 'change' event object.
	 */
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
	/**
	 * Toggles the interval for option reading.
	 * @param run - Whether to start or stop the interval.
	 * @param action - The action to be performed at each interval.
	 * @param interval - The interval duration in milliseconds.
	 */
	public toggleOptionInterval(
		run: boolean,

		interval: number
	) {
		try {
			if (run && this.optionInterval == 1) {
				// Start a new interval timer and store its reference in the record
				this.optionInterval = +setInterval(() => {
					this.start();
				}, interval);
				this.intervalIds.push(this.optionInterval);
			} else if (!run && this.optionInterval) {
				// Clear the interval timer if it exists
				clearInterval(this.optionInterval);
				this.optionInterval = 1; // Reset the interval reference
			}
		} catch (error) {
			console.error("Error toggling option interval:", error);
		}
	}

	/**
	 * Toggles the option reading process. () => this.readDiagOptions() at 600ms pulses
	 * @param run - Boolean True Only
	 */
	toggleOptionRun(run: boolean): void {
		this.toggleOptionInterval(run, 600);
	}

	private readDiagOptions() {
		// Capture the full RS screen
		const diagboxcapture = a1lib.captureHoldFullRs();

		// If position data is not available, find the dialog
		if (!this.diagReader!.pos) {
			this.diagReader.find(diagboxcapture);
		}

		// Update the dimensions of the dialog
		this.updateDiagDimensions();

		// Emit a 'change' event with the current state
		this.emit("change", this.getCState());

		// If dimensions are available, find options and update the state
		if (this.diagH !== 0 && this.diagW !== 0) {
			try {
				const findOptions = this.diagReader.findOptions(diagboxcapture);

				// Validate findOptions before proceeding
				if (findOptions) {
					this.readOption = this.diagReader.readOptions(diagboxcapture, findOptions);

					this.emit("change", this.getCState());
				} else {
					console.error("findOptions not found or invalid."); // Log an error if findOptions is not valid
				}

				// Process dialog and matching points
				this.processDialog(diagboxcapture);
				this.processMatching();
			} catch (error) {
				console.warn("Cannot See Options Normal Response", error);
			}
		} else {
			console.error("Invalid diagH or diagW values."); // Log an error if diagH or diagW is invalid
		}
	}

	/**
	 * Updates the dimensions of the dialog from the reader's position data.
	 * The dimensions are stored in 'diagH' (height) and 'diagW' (width) properties.
	 */
	private updateDiagDimensions(): void {
		this.diagH = this.diagReader.pos?.height!;
		this.diagW = this.diagReader.pos?.width!;
		this.diagX = this.diagReader.pos?.x!;
		this.diagY = this.diagReader.pos?.y!;
	}

	/**
	 * Processes the captured dialog box to extract character dialog and title.
	 * Updates the state with the extracted data and emits a 'change' event.
	 * If the character dialog is empty, it logs a warning and resets variables.
	 * @param diagboxcapture - The captured dialog box data.
	 */
	private processDialog(diagboxcapture: any): void {
		// Check the captured dialog box
		const checked = this.diagReader.checkDialog(diagboxcapture);
		// Read the character dialog
		const charDialogArray = this.diagReader.readDialog(diagboxcapture, checked);
		// Join the array to form the character dialog
		this.charDialog = charDialogArray?.join(" ");
		// Emit a 'change' event with the updated state
		this.emit("change", this.getCState());

		// Read and set the dialog title
		this.diagTitle = this.diagReader.readTitle(diagboxcapture);

		// Emit a 'change' event with the updated state
		this.emit("change", this.getCState());

		// Check if the character dialog is empty and log a warning
		if (this.charDialog?.length === 0) {
			console.warn("Did not find Character Dialog");
			// Reset variables if needed
			this.resetVariables();
		}
	}

	/**
	 * Processes matching points based on stored values and dialog options.
	 * Finds the best match index for each stored value and updates the current best matches.
	 * Emits a 'change' event after updating the state.
	 * Logs an assertion error if the transcript could not be found.
	 */

	private bestMatchIndex: number = 0;
	private maxIteration: number = 1;
	private iterationCount: number = 0;
	private processMatching(): void {
		this.iterationCount = 0;
		// Check if stored values and dialog options are available
		console.log(this.cTStore);
		if (this.cTStore.length !== 0 && this.readOption!.length !== 0) {
			for (const value of this.cTStore) {
				this.bestMatchIndex = this.findBestMatchIndex(value.toLowerCase());

				// Update current best matches if a match is found
				if (this.bestMatchIndex !== -1) {
					const usedIndex = this.cTStore.indexOf(value);

					// Remove the used value from its current position and add it to the end

					const length = this.readOption!.length;
					let width = 220; // Default width for lengths 2 and 3
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

					// Check if the maximum iterations have been reached before updating the store
					if (this.iterationCount < this.maxIteration) {
						const usedValue = this.cTStore.splice(usedIndex, 1)[0];
						this.cTStore.push(usedValue);
					}

					this.emit("change", this.getCState());
					this.anyOption = false;

					// Increment the iteration count after processing a value
					this.iterationCount++;
				}

				// Check if the maximum iterations have been reached before continuing the loop
				if (this.iterationCount >= this.maxIteration) {
					break;
				}
			}
			if (this.currentBestMatches.length === 0) {
				const randomIndex = Math.floor(Math.random() * this.readOption!.length);
				const randomCoordinate = this.readOption![randomIndex];

				// Update current best matches with the random coordinate
				this.currentBestMatches.push({
					x: randomCoordinate.x,
					y: randomCoordinate.y,
					width: randomCoordinate.width,
					buttonX: randomCoordinate.buttonx,
					displayIndex: this.currentBestMatches.length,
				});
				this.anyOption = true;
			}
			// Populate unique coordinates based on the current best matches
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
	/**
	 * Finds the best match index for a given value among dialog options.
	 * Uses Levenshtein distance to determine the similarity between values.
	 * Returns the index of the best match or -1 if no match is found.
	 * @param value - The value to find the best match for.
	 * @returns The index of the best match or -1.
	 */
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
	/**
	 * Calculates the Levenshtein distance between two strings.
	 * The Levenshtein distance represents the minimum number of single-character edits
	 * (insertions, deletions, or substitutions) required to change one string into another.
	 * @param a - The first string for comparison.
	 * @param b - The second string for comparison.
	 * @returns The Levenshtein distance between the two strings.
	 */
	public levenshteinDistance(a: string, b: string): number {
		const matrix: number[][] = [];

		// Initialize matrix with 0-based index values
		for (let i = 0; i <= a.length; i++) {
			matrix[i] = [i];
		}
		for (let j = 0; j <= b.length; j++) {
			matrix[0][j] = j;
		}

		// Fill the matrix
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1, // Deletion
					matrix[i][j - 1] + 1, // Insertion
					matrix[i - 1][j - 1] + cost // Substitution
				);
			}
		}

		// Return the bottom-right value of the matrix
		return matrix[a.length][b.length];
	}
	/**
	 * Resets the variables related to best matches and dialog box dimensions.
	 * Clears the current best matches, previous best matches, box X and Y coordinates.
	 */
	private resetVariables() {
		this.currentBestMatches = [];
		this.previousBestMatches = [];
	}
	/**
	 * Populates unique coordinates based on the current best matches.
	 * Updates the unique coordinates and their counts.
	 * Toggles the dialogue and option reading based on coordinate counts.
	 * Displays the overlay rectangle for each unique coordinate with a delay.
	 */
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

	/**
	 * Displays the overlay rectangle with a delay.
	 * Uses setTimeout to stagger the timings and display each option.
	 */
	private handleCoordinates() {
		if (this.uniqueCoordinates["0,0,0,0"]) {
			delete this.uniqueCoordinates["0,0,0,0"];
		}

		// Get the keys of coordinateCounts
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

		if (!this.anyOption) {
			alt1.overLayText(
				`Select --->`,
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
		} else {
			alt1.overLayText(
				`Any Option`,
				this.textColor,
				13,
				this.buttonX - 95,
				this.coordY - 13,
				1000
			);
			alt1.overLayRect(
				this.color,
				this.buttonX,
				this.coordY - 10,
				this.widthBox,
				this.diagH / 2 - 40,
				1000,
				3
			);
		}

		// Use setTimeout to introduce a delay before displaying the overlay rectangle

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
