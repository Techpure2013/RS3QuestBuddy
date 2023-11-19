import { Getter, Lens, lens, Setter } from "@dhmk/zustand-lens";
import { StoreApi } from "zustand";
import { StoreState } from "./store";

const state = {
    counter: 0,
    msg: {
        id: 0,
        quote: "",
        author: "",
    },
};

export type State = typeof state;

export type Actions = {
    increase: (by: number) => void;
    getMsg: () => void;
};

export type ExampleStore = State & Actions;

const actions: (
    set: Setter<ExampleStore>,
    get: Getter<ExampleStore>,
    api: StoreApi<StoreState>,
    path: ReadonlyArray<string>
) => Actions = (set, get): Actions => {
    return {
        increase: (by) => {
            set({ counter: get().counter + by });
        },
        getMsg: async () => {
            const apiResponse = (await (
                await fetch("https://dummyjson.com/quotes")
            ).json()) as {
                quotes: {
                    id: number;
                    quote: string;
                    author: string;
                }[];
            };

            set({
                msg: apiResponse.quotes[
                    Math.floor(Math.random() * apiResponse.quotes.length)
                ],
            });
        },
    };
};

const slice: Lens<ExampleStore, StoreState> = (set, get, api, path) => {
    return {
        ...state,
        ...actions(set, get, api, path),
    };
};

export default lens(slice);
