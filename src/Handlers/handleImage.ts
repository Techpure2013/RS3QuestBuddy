import * as a1lib from "alt1";

import { ImgRef } from "alt1/base";
import diagboxRegCorner from "./../assets/DiagAssets/diagboxNpc.png";
import userSideCorner from "./../assets/DiagAssets/diagboxSelf.png";
import legacyNpcCorner from "./../assets/DiagAssets/npcSidelegskin.png";
import legacyUserCorner from "./../assets/DiagAssets/legacyUserSide.png";

let optionSelected = {
	diagboxSide: await a1lib.imageDataFromUrl(diagboxRegCorner),
	diagboxSideSelf: await a1lib.imageDataFromUrl(userSideCorner),
	legDiagBoxNpc: await a1lib.imageDataFromUrl(legacyNpcCorner),
	legDiagBoxUser: await a1lib.imageDataFromUrl(legacyUserCorner),
};
export class diagFinder {
	NpcPos: a1lib.RectLike | null = null;
	UserPos: a1lib.RectLike | null = null;
	LNpcPos: a1lib.RectLike | null = null;
	LUserPos: a1lib.RectLike | null = null;
	constructor() {
		this.find = this.find.bind(this);
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
		for (let imgs of [optionSelected]) {
			const NPos = imgref.findSubimage(imgs.diagboxSide);
			const UPos = imgref.findSubimage(imgs.diagboxSideSelf);
			const LNPos = imgref.findSubimage(imgs.legDiagBoxNpc);
			const LUPos = imgref.findSubimage(imgs.legDiagBoxUser);
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
		}

		const color = a1lib.mixColor(255, 255, 0);
		let npcBox = npcBoxes[0];
		let userBox = userBoxes[0];
		let legNBox = legacyNpcBoxes[0];
		let legUBox = legacyUserBoxes[0];
		if (npcBox !== undefined) {
			this.NpcPos = {
				x: npcBox.x - 122,
				y: npcBox.y - 35,
				width: 506,
				height: 130,
			};
			alt1.overLayRect(color, this.NpcPos.x, this.NpcPos.y, 1, 1, 5000, 1);
			return this.NpcPos;
		}
		if (userBox !== undefined && npcBox === undefined) {
			this.UserPos = {
				x: userBox.x - 371,
				y: userBox.y - 34,
				width: 515,
				height: 141,
			};
			alt1.overLayRect(color, this.UserPos.x, this.UserPos.y, 1, 1, 5000, 1);
			return this.UserPos;
		}
		if (legNBox !== undefined) {
			this.LNpcPos = {
				x: legNBox.x - 121,
				y: legNBox.y - 35,
				width: 515,
				height: 141,
			};
			alt1.overLayRect(
				color,
				this.LNpcPos.x,
				this.LNpcPos.y,
				515,
				141,
				5000,
				1
			);
			return this.LNpcPos;
		}
		if (legUBox !== undefined) {
			this.LUserPos = {
				x: legUBox.x - 373,
				y: legUBox.y - 31,
				width: 515,
				height: 141,
			};
			alt1.overLayRect(
				color,
				this.LUserPos.x,
				this.LUserPos.y,
				515,
				141,
				5000,
				1
			);
		}
	}
}
