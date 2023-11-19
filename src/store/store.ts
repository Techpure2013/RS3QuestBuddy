import { create } from "zustand";
import { withLenses } from "@dhmk/zustand-lens";
import exampleSlice, { ExampleStore } from "./example.slice";
import otherSlice, { OtherStore } from "./other.slice";
import chatBoxSlice, { ChatboxStore } from "./chatBox.slice";

export type StoreState = {
    example: ExampleStore;
    other: OtherStore;
    chatBox: ChatboxStore;
};

export const useStore = create<StoreState>(
    withLenses({
        example: exampleSlice,
        other: otherSlice,
        chatBox: chatBoxSlice,
    })
);
