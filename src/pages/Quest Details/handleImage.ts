import * as a1lib from "alt1";
import { ImgRef } from "alt1/base";

async function loadImageData() {
	require("./../../assets/DiagAssets/AcceptButton.png");
	const imgPack = {
		acceptButton: await a1lib.imageDataFromUrl("./assets/AcceptButton.png"),
	};
	return imgPack;
}

const imgPackPromise = loadImageData();

export class diagFinder {
	acceptbuttonPos: a1lib.RectLike | null = null;

	constructor() {
		this.find = this.find.bind(this);
	}

	async find(imgref?: ImgRef) {
		if (!imgref) {
			imgref = a1lib.captureHoldFullRs();
		}
		if (!imgref) {
			return null;
		}

		const imgPack = await imgPackPromise;
		const acceptButtonMatches = imgref.findSubimage(imgPack.acceptButton);

		if (acceptButtonMatches.length > 0) {
			const firstMatch = acceptButtonMatches[0];
			this.acceptbuttonPos = {
				x: firstMatch.x,
				y: firstMatch.y,
				width: 160,
				height: 25,
			};

			const color = a1lib.mixColor(255, 0, 0);
			alt1.overLayRect(
				color,
				this.acceptbuttonPos.x,
				this.acceptbuttonPos.y,
				this.acceptbuttonPos.width,
				this.acceptbuttonPos.height,
				700,
				3,
			);
			return this.acceptbuttonPos;
		}

		return false;
	}
}
