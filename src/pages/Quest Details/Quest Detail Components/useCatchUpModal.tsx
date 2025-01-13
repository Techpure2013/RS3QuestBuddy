import { useState } from "react";

type Callbacks = {
	onOpen?(): void;
	onClose?(): void;
};

function useCatchUpDisclosure(
	initialState: boolean,
	callbacks?: Callbacks
): [
	boolean,
	{
		openCatchUp: () => void;
		closeCatchUp: () => void;
		toggleCatchUp: () => void;
	}
] {
	const [isCatchOpen, setIsCatchOpen] = useState(initialState);

	const openCatchUp = () => {
		setIsCatchOpen(true);
		callbacks?.onOpen?.();
	};

	const closeCatchUp = () => {
		setIsCatchOpen(false);
		callbacks?.onClose?.();
	};

	const toggleCatchUp = () => {
		setIsCatchOpen((prev) => !prev);
		isCatchOpen ? callbacks?.onClose?.() : callbacks?.onOpen?.();
	};

	return [isCatchOpen, { openCatchUp, closeCatchUp, toggleCatchUp }];
}

export default useCatchUpDisclosure;
