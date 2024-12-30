import * as a1lib from "alt1";

import { ImgRef } from "alt1/base";
require("./../../assets/DiagAssets/AcceptButton.png");

export class diagFinder {
	acceptbuttonPos: a1lib.RectLike | null = null;
	imgPack: any;

	constructor() {
		this.find = this.find.bind(this);
		this.initialize();
	}

	async initialize() {
		this.imgPack = await this.loadImageData();
	}

	async loadImageData() {
		const imgPack = {
			acceptButton: await a1lib.imageDataFromUrl("./assets/AcceptButton.png"),
		};
		return (this.imgPack = imgPack);
	}
	find(imgref?: ImgRef) {
		if (!imgref) {
			imgref = a1lib.captureHoldFullRs();
		}
		if (!imgref) {
			return null;
		}
		let acceptButtonBoxes: a1lib.PointLike[] = [];
		for (let imgs of [this.imgPack]) {
			const acceptButton = imgref.findSubimage(imgs.acceptButton);
			if (acceptButton.length > 0) {
				for (let f in acceptButton) {
					let p6 = acceptButton[f];
					if (imgref.findSubimage(imgs.acceptButton).length !== 0) {
						acceptButtonBoxes.push({ ...p6 });
					}
				}
			}
		}
		const color = a1lib.mixColor(255, 0, 0);
		let acceptButtonBox = acceptButtonBoxes[0];
		if (acceptButtonBox !== undefined) {
			this.acceptbuttonPos = {
				x: acceptButtonBox.x,
				y: acceptButtonBox.y,
				width: 160,
				height: 25,
			};
			alt1.overLayRect(
				color,
				this.acceptbuttonPos.x,
				this.acceptbuttonPos.y,
				this.acceptbuttonPos.width,
				this.acceptbuttonPos.height,
				700,
				3
			);
			return this.acceptbuttonPos;
		} else {
			return false;
		}
	}
}
