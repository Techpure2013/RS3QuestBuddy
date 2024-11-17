import { useState } from "react";

type Callbacks = {
	onOpen?(): void;
	onClose?(): void;
};

function useImageDisclosure(
	initialState: boolean,
	callbacks?: Callbacks
): [
	boolean,
	{ imgModOpen: () => void; imgModClose: () => void; toggledImages: () => void }
] {
	const [isOpen, setIsOpen] = useState(initialState);

	const imgModOpen = () => {
		setIsOpen(true);
		if (callbacks?.onOpen) {
			callbacks.onOpen();
		}
	};

	const imgModClose = () => {
		setIsOpen(false);
		if (callbacks?.onClose) {
			callbacks.onClose();
		}
	};

	const toggledImages = () => {
		setIsOpen((prev) => !prev);
		if (isOpen && callbacks?.onClose) {
			callbacks.onClose();
		} else if (!isOpen && callbacks?.onOpen) {
			callbacks.onOpen();
		}
	};

	return [isOpen, { imgModOpen, imgModClose, toggledImages }];
}

export default useImageDisclosure;
