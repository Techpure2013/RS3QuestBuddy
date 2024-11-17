import { useState } from "react";

type Callbacks = {
	onOpen?(): void;
	onClose?(): void;
};

function useGridDisclosure(
	initialState: boolean,
	callbacks?: Callbacks
): [
	boolean,
	{ openGrid: () => void; closeGrid: () => void; toggleGrid: () => void }
] {
	const [isOpen, setIsOpen] = useState(initialState);

	const openGrid = () => {
		setIsOpen(true);
		callbacks?.onOpen?.();
	};

	const closeGrid = () => {
		setIsOpen(false);
		callbacks?.onClose?.();
	};

	const toggleGrid = () => {
		setIsOpen((prev) => !prev);
		isOpen ? callbacks?.onClose?.() : callbacks?.onOpen?.();
	};

	return [isOpen, { openGrid, closeGrid, toggleGrid }];
}

export default useGridDisclosure;
