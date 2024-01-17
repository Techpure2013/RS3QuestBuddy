import * as a1lib from "alt1";

import { ImgRef } from "alt1/base";
import regNpcBox from "./../assets/DiagAssets/diagboxNpc.png";
import userSideCorner from "./../assets/DiagAssets/diagboxSelf.png";
import diagBoxContinueB from "./../assets/DiagAssets/continueReg.png";
import regBoxContinueBHov from "./../assets/DiagAssets/continueHover.png";
import legacyNpcCorner from "./../assets/DiagAssets/legacyNpcSide.png";
import legacyUserCorner from "./../assets/DiagAssets/legacyUserSide.png";
import legacyContinueHover from "./../assets/DiagAssets/legacyHoveredContinue.png";
import legacyContinueButton from "./../assets/DiagAssets/legacyContinueButtonAlt.png";
import generalbox from "./../assets/DiagAssets/genboximage.png";
import acceptButton from "./../assets/DiagAssets/AcceptButton.png";
import dialogOptionButton from "./../assets/DiagAssets/regularButton.png";
import fontHeavy from "./../assets/DiagAssets/Fonts/aa_8px_mono_allcaps.data.png";

export class diagFinder {
	legTitleColor = a1lib.mixColor(255, 152, 31);
	regTitleColor = a1lib.mixColor(255, 203, 5);
	NpcPos: a1lib.RectLike | null = null;
	UserPos: a1lib.RectLike | null = null;
	LNpcPos: a1lib.RectLike | null = null;
	LUserPos: a1lib.RectLike | null = null;
	genBoxPos: a1lib.RectLike | null = null;
	acceptbuttonPos: a1lib.RectLike | null = null;
	dialogOptionsPos: a1lib.RectLike | null = null;
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
			diagboxSide: await a1lib.imageDataFromUrl(regNpcBox),
			diagboxSideSelf: await a1lib.imageDataFromUrl(userSideCorner),
			legDiagBoxNpc: await a1lib.imageDataFromUrl(legacyNpcCorner),
			legDiagBoxUser: await a1lib.imageDataFromUrl(legacyUserCorner),
			diagboxContinueButton: await a1lib.imageDataFromUrl(diagBoxContinueB),
			diagBoxContinueHover: await a1lib.imageDataFromUrl(regBoxContinueBHov),
			legacyContButton: await a1lib.imageDataFromUrl(legacyContinueButton),
			legacyContinueButtonHover: await a1lib.imageDataFromUrl(
				legacyContinueHover
			),
			genbox: await a1lib.imageDataFromUrl(generalbox),
			acceptButton: await a1lib.imageDataFromUrl(acceptButton),
			dialogOptionButton: await a1lib.imageDataFromUrl(dialogOptionButton),
			fontH: await a1lib.imageDataFromUrl(fontHeavy),
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
		let npcBoxes: a1lib.PointLike[] = [];
		let userBoxes: a1lib.PointLike[] = [];
		let legacyNpcBoxes: a1lib.PointLike[] = [];
		let legacyUserBoxes: a1lib.PointLike[] = [];
		//let generalBoxes: a1lib.PointLike[] = [];
		let acceptButtonBoxes: a1lib.PointLike[] = [];
		let dialogOptionBoxes: a1lib.PointLike[] = [];
		for (let imgs of [this.imgPack]) {
			const NPos = imgref.findSubimage(imgs.diagboxSide);
			console.log(NPos);
			const UPos = imgref.findSubimage(imgs.diagboxSideSelf);
			const LNPos = imgref.findSubimage(imgs.legDiagBoxNpc);
			const LUPos = imgref.findSubimage(imgs.legDiagBoxUser);
			const GenBoxPos = imgref.findSubimage(imgs.genbox);
			const acceptButton = imgref.findSubimage(imgs.acceptButton);
			const diagOptions = imgref.findSubimage(imgs.dialogOptionButton);

			if (NPos.length > 0) {
				for (let a in NPos) {
					let p = NPos[a];
					if (imgref.findSubimage(imgs.diagboxSide).length !== 0) {
						npcBoxes.push({ ...p });
					} else {
						console.error("position not found for npc box");
					}
				}
			}
			if (UPos.length > 0) {
				for (let b in UPos) {
					let p2 = UPos[b];
					if (imgref.findSubimage(imgs.diagboxSideSelf).length !== 0) {
						userBoxes.push({ ...p2 });
					} else {
						console.error("position not found for user box");
					}
				}
			}
			if (LNPos.length > 0) {
				for (let c in LNPos) {
					let p3 = LNPos[c];
					if (imgref.findSubimage(imgs.legDiagBoxNpc).length !== 0) {
						legacyNpcBoxes.push({ ...p3 });
					} else {
						console.error("position not found for legacy npc box");
					}
				}
			}
			if (LUPos.length > 0) {
				for (let d in LUPos) {
					let p4 = LUPos[d];
					if (imgref.findSubimage(imgs.legDiagBoxUser).length !== 0) {
						legacyUserBoxes.push({ ...p4 });
					}
				}
			}
			if (GenBoxPos.length > 0 && diagOptions.length > 0) {
				for (let e in GenBoxPos) {
					let p5 = GenBoxPos[e];
					if (imgref.findSubimage(imgs.genbox).length !== 0) {
						legacyUserBoxes.push({ ...p5 });
					}
				}
				for (let g in diagOptions) {
					let p7 = diagOptions[g];
					if (imgref.findSubimage(imgs.dialogOptionButton).length !== 0) {
						dialogOptionBoxes.push({ ...p7 });
					}
				}
			}
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

		let npcBox = npcBoxes[0];
		let userBox = userBoxes[0];
		let legNBox = legacyNpcBoxes[0];
		let legUBox = legacyUserBoxes[0];
		//let generalBox = generalBoxes[0];
		let acceptButtonBox = acceptButtonBoxes[0];
		let dialogOptionBox = [];
		if (dialogOptionBoxes.length > 0) {
			for (let a in dialogOptionBoxes) {
				let pos = dialogOptionBoxes[a];
				dialogOptionBox.push({ ...pos });
			}
		}

		if (npcBox !== undefined) {
			this.NpcPos = {
				x: npcBox.x - 6,
				y: npcBox.y - 89,
				width: 510,
				height: 135,
			};

			// alt1.overLayRect(color, Math.round(241), 937, 510, 145, 5000, 1);
			//alt1.overLayRect(color, Math.round(817 / 2), 484, 536, 135, 5000, 1);
			return this.NpcPos;
		}
		if (userBox !== undefined && npcBox === undefined) {
			console.log(this.UserPos);
			this.UserPos = {
				x: userBox.x - 488,
				y: userBox.y - 82,
				width: 510,
				height: 135,
			};
			//788 start X 945 start Y, 791 end X 951 end Y RegContinueButton
			//The same Coords for RegContinueButtonHovered
			alt1.overLayRect(
				color,
				this.UserPos.x,
				this.UserPos.y,
				510,
				130,
				5000,
				10
			);
			return this.UserPos;
		}
		if (legNBox !== undefined) {
			this.LNpcPos = {
				x: legNBox.x - 5,
				y: legNBox.y - 81,
				width: 511,
				height: 130,
			};
			//Legacy X-Start: 792 Y-Start: 950, X-End: 791 Y-End: 950
			// alt1.overLayRect(color, this.LNpcPos.x, this.LNpcPos.y, 511, 32, 5000, 1);
			return this.LNpcPos;
		}
		if (legUBox !== undefined) {
			this.LUserPos = {
				x: legUBox.x - 484,
				y: legUBox.y - 88,
				width: 509,
				height: 130,
			};
			// alt1.overLayRect(
			// 	color,
			// 	this.LUserPos.x + 217,
			// 	this.LUserPos.y + 113,
			// 	74,
			// 	14,
			// 	5000,
			// 	1
			// );
			return this.LUserPos;
		}
		// if (generalBox !== undefined && dialogOptionBoxes) {
		// 	this.genBoxPos = {
		// 		x: generalBox.x,
		// 		y: generalBox.y,
		// 		width: 509,
		// 		height: 130,
		// 	};
		// 	return this.genBoxPos;
		// }
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
				1000,
				3
			);
			return this.acceptbuttonPos;
		}
	}
	// ensureImage(imgref: ImgRef | null | undefined) {
	// 	if (!this.NpcPos) {
	// 		return null;
	// 	} else {
	// 		if (imgref && a1lib.Rect.fromArgs(imgref).contains(this.NpcPos)) {
	// 			return imgref;
	// 		}
	// 	}
	// 	if (!this.UserPos) {
	// 		return null;
	// 	} else {
	// 		if (imgref && a1lib.Rect.fromArgs(imgref).contains(this.UserPos)) {
	// 			return imgref;
	// 		}
	// 	}
	// 	if (!this.LNpcPos) {
	// 		return null;
	// 	} else {
	// 		if (imgref && a1lib.Rect.fromArgs(imgref).contains(this.LNpcPos)) {
	// 			return imgref;
	// 		}
	// 	}
	// 	if (!this.LUserPos) {
	// 		return null;
	// 	} else {
	// 		if (imgref && a1lib.Rect.fromArgs(imgref).contains(this.LUserPos)) {
	// 			return imgref;
	// 		}
	// 	}
	// 	if (!this.genBoxPos) {
	// 		return null;
	// 	} else {
	// 		if (imgref && a1lib.Rect.fromArgs(imgref).contains(this.genBoxPos)) {
	// 			return imgref;
	// 		}
	// 	}

	// 	if (this.NpcPos !== undefined) {
	// 		return a1lib.captureHold(
	// 			this.NpcPos.x,
	// 			this.NpcPos.y,
	// 			this.NpcPos.width,
	// 			this.NpcPos.height
	// 		);
	// 	}
	// 	if (this.UserPos !== undefined) {
	// 		return a1lib.captureHold(
	// 			this.UserPos.x,
	// 			this.UserPos.y,
	// 			this.UserPos.width,
	// 			this.UserPos.height
	// 		);
	// 	}
	// 	if (this.LNpcPos !== undefined) {
	// 		return a1lib.captureHold(
	// 			this.LNpcPos.x,
	// 			this.LNpcPos.y,
	// 			this.LNpcPos.width,
	// 			this.LNpcPos.height
	// 		);
	// 	}
	// 	if (this.LUserPos !== undefined) {
	// 		return a1lib.captureHold(
	// 			this.LUserPos.x,
	// 			this.LUserPos.y,
	// 			this.LUserPos.width,
	// 			this.LUserPos.height
	// 		);
	// 	}
	// }

	// CheckDialog(imgref: ImgRef) {
	// 	// if (!this.NpcPos) {
	// 	// 	throw new Error("position not found yet");
	// 	// }
	// 	// if (!this.UserPos) {
	// 	// 	throw new Error("position not found yet");
	// 	// }
	// 	// if (!this.LNpcPos) {
	// 	// 	throw new Error("position not found yet");
	// 	// }
	// 	// if (!this.LUserPos) {
	// 	// 	throw new Error("position not found yet");
	// 	// }

	// 	let npcLocs: a1lib.PointLike[] = [];
	// 	let userLocs: a1lib.PointLike[] = [];
	// 	let legacyNpcLocs: a1lib.PointLike[] = [];
	// 	let legUserLoc: a1lib.PointLike[] = [];

	// 	if (this.NpcPos !== null) {
	// 		npcLocs = npcLocs.concat(
	// 			imgref.findSubimage(
	// 				imgPack.diagboxContinueButton,
	// 				this.NpcPos.x - imgref.x,
	// 				this.NpcPos.y - imgref.y,
	// 				this.NpcPos.width,
	// 				this.NpcPos.height
	// 			)
	// 		);
	// 		if (npcLocs.length == 0) {
	// 			npcLocs = npcLocs.concat(
	// 				imgref.findSubimage(
	// 					imgPack.diagBoxContinueHover,
	// 					this.NpcPos.x - imgref.x,
	// 					this.NpcPos.y - imgref.y,
	// 					this.NpcPos.width,
	// 					this.NpcPos.height
	// 				)
	// 			);
	// 		}

	// 		return npcLocs.length != 0;
	// 	}
	// 	if (this.UserPos !== null) {
	// 		userLocs = userLocs.concat(
	// 			imgref.findSubimage(
	// 				imgPack.diagboxContinueButton,
	// 				this.UserPos.x - imgref.x,
	// 				this.UserPos.y - imgref.y,
	// 				this.UserPos.width,
	// 				this.UserPos.height
	// 			)
	// 		);
	// 		//I spent 25 minutes looking at width and height they were switched around...
	// 		//Cannot find any locs without subtracting imgref X and Y
	// 		if (userLocs.length == 0) {
	// 			userLocs = userLocs.concat(
	// 				imgref.findSubimage(
	// 					imgPack.diagBoxContinueHover,
	// 					this.UserPos.x - imgref.x,
	// 					this.UserPos.y - imgref.y,
	// 					this.UserPos.width,
	// 					this.UserPos.height
	// 				)
	// 			);
	// 		}

	// 		return userLocs.length != 0;
	// 	}
	// 	if (this.LNpcPos !== null) {
	// 		legacyNpcLocs = legacyNpcLocs.concat(
	// 			imgref.findSubimage(
	// 				imgPack.legacyContButton,
	// 				this.LNpcPos.x - imgref.x,
	// 				this.LNpcPos.y - imgref.y,
	// 				this.LNpcPos.width,
	// 				this.LNpcPos.height
	// 			)
	// 		);

	// 		legacyNpcLocs = legacyNpcLocs.concat(
	// 			imgref.findSubimage(
	// 				imgPack.legacyContinueButtonHover,
	// 				this.LNpcPos.x - imgref.x,
	// 				this.LNpcPos.y - imgref.y,
	// 				this.LNpcPos.width,
	// 				this.LNpcPos.height
	// 			)
	// 		);
	// 		console.log(legacyNpcLocs);
	// 		console.log(legacyNpcLocs.length);
	// 		return legacyNpcLocs.length != 0;
	// 	}
	// 	if (this.LUserPos !== null) {
	// 		legUserLoc = legUserLoc.concat(
	// 			imgref.findSubimage(
	// 				imgPack.legacyContButton,
	// 				this.LUserPos.x - imgref.x,
	// 				this.LUserPos.y - imgref.y,
	// 				this.LUserPos.width,
	// 				this.LUserPos.height
	// 			)
	// 		);
	// 		legUserLoc = legUserLoc.concat(
	// 			imgref.findSubimage(
	// 				imgPack.legacyContinueButtonHover,
	// 				this.LUserPos.x - imgref.x,
	// 				this.LUserPos.y - imgref.y,
	// 				this.LUserPos.width,
	// 				this.LUserPos.height
	// 			)
	// 		);
	// 		return legUserLoc.length != 0;
	// 	}
	// }
	// readTitle(imgref: ImgRef) {
	// 	const font = ocr.loadFontImage(imgPack.fontH, {
	// 		basey: 13,
	// 		spacewidth: 5,
	// 		treshold: 0.6,
	// 		color: [255, 255, 255],
	// 		unblendmode: "raw",
	// 		shadow: false,
	// 		chars:
	// 			"!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~",
	// 		seconds: ",.-:;\"'|*",
	// 	});

	// 	if (this.NpcPos !== null) {
	// 		let buffer = imgref.toData(
	// 			this.NpcPos.x,
	// 			this.NpcPos.y,
	// 			this.NpcPos.width,
	// 			32
	// 		);
	// 		[[255, 203, 5]];
	// 		let readTitle = ocr.readSmallCapsBackwards(
	// 			buffer,
	// 			font,
	// 			[[255, 203, 5]],
	// 			this.NpcPos.x,
	// 			837
	// 		);
	// 		ocr.debugFont(font);

	// 		return readTitle.text.toLowerCase();
	// 	}
	// 	if (this.UserPos !== null) {
	// 		let buffer = imgref.toData(
	// 			this.UserPos.x,
	// 			this.UserPos.y,
	// 			this.UserPos.width,
	// 			32
	// 		);
	// 		let pos = ocr.findReadLine(
	// 			buffer,
	// 			font,
	// 			[[255, 203, 5]],
	// 			this.UserPos.x,
	// 			this.UserPos.y
	// 		);
	// 		let readTitle = ocr.readSmallCapsBackwards(
	// 			buffer,
	// 			font,
	// 			[[255, 203, 5]],
	// 			241,
	// 			20
	// 		);
	// 		console.log(pos.text);
	// 		return readTitle.text.toLowerCase();
	// 	}
	// 	if (this.genBoxPos !== null) {
	// 		let buffer = imgref.toData(
	// 			this.genBoxPos.x,
	// 			this.genBoxPos.y,
	// 			this.genBoxPos.width,
	// 			32
	// 		);

	// 		let readTitle = ocr.readSmallCapsBackwards(
	// 			buffer,
	// 			font,
	// 			[[255, 203, 5]],
	// 			Math.round(this.genBoxPos.width / 2) - 10,
	// 			20
	// 		);
	// 		console.log(readTitle.debugArea);
	// 		return readTitle.text.toLowerCase();
	// 	}
	// }
}
