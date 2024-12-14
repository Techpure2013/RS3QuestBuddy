type Callbacks = {
    onOpen?(): void;
    onClose?(): void;
};
declare function usePOGDisclosure(initialState: boolean, callbacks?: Callbacks): [
    boolean,
    {
        pogModOpen: () => void;
        pogModClose: () => void;
        toggledPog: () => void;
    }
];
export default usePOGDisclosure;
