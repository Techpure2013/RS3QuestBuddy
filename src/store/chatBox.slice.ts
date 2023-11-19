import { Getter, Lens, lens, Setter } from "@dhmk/zustand-lens";
import { StoreApi } from "zustand";
import { StoreState } from "./store";

export type State = {
    msg: string[];
};

const state: State = {
    msg: [],
};

export type Actions = {
    setMsg: (msgs: string[]) => void;
};

export type ChatboxStore = State & Actions;

const actions: (
    set: Setter<ChatboxStore>,
    get: Getter<ChatboxStore>,
    api: StoreApi<StoreState>,
    path: ReadonlyArray<string>
) => Actions = (set, get): Actions => {
    return {
        setMsg: (msgs) => {
            set({ msg: [...get().msg, ...msgs].slice(-10) });
        },
    };
};

const slice: Lens<ChatboxStore, StoreState> = (set, get, api, path) => {
    return {
        ...state,
        ...actions(set, get, api, path),
    };
};

export default lens(slice);
