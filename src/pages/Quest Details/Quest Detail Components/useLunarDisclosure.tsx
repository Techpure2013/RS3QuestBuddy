import { useState } from "react";

type Callbacks = {
	onOpen?(): void;
	onClose?(): void;
};

function useLunarGridDisclosure(
	initialState: boolean,
	callbacks?: Callbacks
): [
	boolean,
	{
		openLunarGrid: () => void;
		closeLunarGrid: () => void;
		toggleLunarGrid: () => void;
	}
] {
	const [isOpen, setIsOpen] = useState(initialState);

	const openLunarGrid = () => {
		setIsOpen(true);
		callbacks?.onOpen?.();
	};

	const closeLunarGrid = () => {
		setIsOpen(false);
		callbacks?.onClose?.();
	};

	const toggleLunarGrid = () => {
		setIsOpen((prev) => !prev);
		isOpen ? callbacks?.onClose?.() : callbacks?.onOpen?.();
	};

	return [isOpen, { openLunarGrid, closeLunarGrid, toggleLunarGrid }];
}

export default useLunarGridDisclosure;
