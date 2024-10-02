import { useState } from "react";

type Callbacks = {
	onOpen?(): void;
	onClose?(): void;
};

function usePOGDisclosure(
	initialState: boolean,
	callbacks?: Callbacks
): [
	boolean,
	{ pogModOpen: () => void; pogModClose: () => void; toggledPog: () => void }
] {
	const [isOpen, setIsOpen] = useState(initialState);

	const pogModOpen = () => {
		setIsOpen(true);
		if (callbacks?.onOpen) {
			callbacks.onOpen();
		}
	};

	const pogModClose = () => {
		setIsOpen(false);
		if (callbacks?.onClose) {
			callbacks.onClose();
		}
	};

	const toggledPog = () => {
		setIsOpen((prev) => !prev);
		if (isOpen && callbacks?.onClose) {
			callbacks.onClose();
		} else if (!isOpen && callbacks?.onOpen) {
			callbacks.onOpen();
		}
	};

	return [isOpen, { pogModOpen, pogModClose, toggledPog }];
}

export default usePOGDisclosure;
