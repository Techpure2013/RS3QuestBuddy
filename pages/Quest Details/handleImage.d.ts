import * as a1lib from "alt1";
import { ImgRef } from "alt1/base";
export declare class diagFinder {
    legTitleColor: number;
    regTitleColor: number;
    NpcPos: a1lib.RectLike | null;
    UserPos: a1lib.RectLike | null;
    LNpcPos: a1lib.RectLike | null;
    LUserPos: a1lib.RectLike | null;
    genBoxPos: a1lib.RectLike | null;
    acceptbuttonPos: a1lib.RectLike | null;
    dialogOptionsPos: a1lib.RectLike | null;
    imgPack: any;
    constructor();
    initialize(): Promise<void>;
    loadImageData(): Promise<{
        diagboxSide: ImageData;
        diagboxSideSelf: ImageData;
        legDiagBoxNpc: ImageData;
        legDiagBoxUser: ImageData;
        diagboxContinueButton: ImageData;
        diagBoxContinueHover: ImageData;
        legacyContButton: ImageData;
        legacyContinueButtonHover: ImageData;
        genbox: ImageData;
        acceptButton: ImageData;
        dialogOptionButton: ImageData;
        fontH: ImageData;
    }>;
    find(imgref?: ImgRef): a1lib.RectLike | null | undefined;
}
