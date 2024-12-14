import * as a1lib from "alt1/base";
import { ImgRef } from "alt1/base";
type DialogButtonLocation = {
    x: number;
    y: number;
    hover: boolean;
    active: boolean;
};
export type DialogButton = DialogButtonLocation & {
    text: string;
    width: number;
    buttonx: number;
};
export default class DialogReader {
    pos: a1lib.RectLike & {
        legacy: boolean;
    } | null;
    find(imgref?: ImgRef): false | (a1lib.RectLike & {
        legacy: boolean;
    }) | null;
    ensureimg(imgref: ImgRef | null | undefined): a1lib.ImgRef | null;
    read(imgref?: ImgRef | null | undefined): false | {
        text: string[] | null;
        opts: DialogButton[] | null;
        title: string;
    } | null;
    readTitle(imgref: ImgRef): string;
    checkDialog(imgref: ImgRef): boolean;
    readDialog(imgref: ImgRef | undefined | null, checked: boolean): string[] | null;
    findOptions(imgref: ImgRef): DialogButtonLocation[];
    readOptions(imgref: ImgRef | null | undefined, locs: ReturnType<DialogReader["findOptions"]>): DialogButton[] | null;
}
export {};
