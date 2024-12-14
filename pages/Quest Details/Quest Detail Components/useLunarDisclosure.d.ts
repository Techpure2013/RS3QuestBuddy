type Callbacks = {
    onOpen?(): void;
    onClose?(): void;
};
declare function useLunarGridDisclosure(initialState: boolean, callbacks?: Callbacks): [
    boolean,
    {
        openLunarGrid: () => void;
        closeLunarGrid: () => void;
        toggleLunarGrid: () => void;
    }
];
export default useLunarGridDisclosure;
