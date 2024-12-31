import * as a1lib from "alt1";
import { ImgRef } from "alt1/base";
export declare class diagFinder {
    acceptbuttonPos: a1lib.RectLike | null;
    imgPack: any;
    constructor();
    initialize(): Promise<void>;
    loadImageData(): Promise<{
        acceptButton: ImageData;
    }>;
    find(imgref?: ImgRef): false | a1lib.RectLike | null;
}
