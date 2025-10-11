import { useState } from "react";

type Callbacks = {
	onOpen?(): void;
	onClose?(): void;
};

function useStorageDisclosure(
	initialState: boolean,
	callbacks?: Callbacks,
): [
	boolean,
	{
		openStorage: () => void;
		closeStorage: () => void;
		toggleStorage: () => void;
	},
] {
	const [isOpen, setIsOpen] = useState(initialState);

	const openStorage = () => {
		setIsOpen(true);
		callbacks?.onOpen?.();
	};

	const closeStorage = () => {
		setIsOpen(false);
		callbacks?.onClose?.();
	};

	const toggleStorage = () => {
		setIsOpen((prev) => !prev);
		isOpen ? callbacks?.onClose?.() : callbacks?.onOpen?.();
	};

	return [isOpen, { openStorage, closeStorage, toggleStorage }];
}

export default useStorageDisclosure;
