type Callbacks = {
    onOpen?(): void;
    onClose?(): void;
};
declare function useCatchUpDisclosure(initialState: boolean, callbacks?: Callbacks): [
    boolean,
    {
        openCatchUp: () => void;
        closeCatchUp: () => void;
        toggleCatchUp: () => void;
    }
];
export default useCatchUpDisclosure;
