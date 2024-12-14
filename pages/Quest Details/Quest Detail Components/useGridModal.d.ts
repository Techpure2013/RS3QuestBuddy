type Callbacks = {
    onOpen?(): void;
    onClose?(): void;
};
declare function useGridDisclosure(initialState: boolean, callbacks?: Callbacks): [
    boolean,
    {
        openGrid: () => void;
        closeGrid: () => void;
        toggleGrid: () => void;
    }
];
export default useGridDisclosure;
