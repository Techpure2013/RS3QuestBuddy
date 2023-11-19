import { Getter, Lens, lens, Setter } from "@dhmk/zustand-lens";
import { StoreApi } from "zustand";
import { StoreState } from "./store";

const state = {
    counter: 0,
    msg: "",
};

export type State = typeof state;

export type Actions = {
    increase: (by: number) => void;
    newMsg: () => void;
};

export type OtherStore = State & Actions;

function makeid(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}

const actions: (
    set: Setter<OtherStore>,
    get: Getter<OtherStore>,
    api: StoreApi<StoreState>,
    path: ReadonlyArray<string>
) => Actions = (set, get, api): Actions => {
    return {
        increase: (by) => {
            set({ counter: get().counter + by });
            api.getState().example.increase(by * 2);
        },
        newMsg: () => {
            set({ msg: makeid(15) });
        },
    };
};

const slice: Lens<OtherStore, StoreState> = (set, get, api, path) => {
    return {
        ...state,
        ...actions(set, get, api, path),
    };
};

export default lens(slice);
