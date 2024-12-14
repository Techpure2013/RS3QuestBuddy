type Callbacks = {
    onOpen?(): void;
    onClose?(): void;
};
declare function useNotesDisclosure(initialState: boolean, callbacks?: Callbacks): [
    boolean,
    {
        openNotes: () => void;
        closedNotes: () => void;
        toggledNotes: () => void;
    }
];
export default useNotesDisclosure;
