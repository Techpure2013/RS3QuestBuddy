import { useState } from "react";

type Callbacks = {
	onOpen?(): void;
	onClose?(): void;
};

function useNotesDisclosure(
	initialState: boolean,
	callbacks?: Callbacks
): [
	boolean,
	{ openNotes: () => void; closedNotes: () => void; toggledNotes: () => void }
] {
	const [isOpen, setIsOpen] = useState(initialState);

	const openNotes = () => {
		setIsOpen(true);
		if (callbacks?.onOpen) {
			callbacks.onOpen();
		}
	};

	const closedNotes = () => {
		setIsOpen(false);
		if (callbacks?.onClose) {
			callbacks.onClose();
		}
	};

	const toggledNotes = () => {
		setIsOpen((prev) => !prev);
		if (isOpen && callbacks?.onClose) {
			callbacks.onClose();
		} else if (!isOpen && callbacks?.onOpen) {
			callbacks.onOpen();
		}
	};

	return [isOpen, { openNotes, closedNotes, toggledNotes }];
}

export default useNotesDisclosure;
