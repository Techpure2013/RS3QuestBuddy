import { create } from "zustand";

interface QuestControllerStore {
	popOutWindow: Window | null;
	buttonVisible: boolean;
	popOutClicked: boolean;
	setPopOutWindow: (window: Window | null) => void;
	setButtonVisible: (visible: boolean) => void;
	setPopOutClicked: (clicked: boolean) => void;
	showImageCaro: boolean;
	toggleImageCaro: () => void;
	showStepReq: boolean;
	toggleShowStepReq: () => void;
	showControlPopOut: boolean;
	toggleShowControlPopOut: () => void;
	showAccordian: boolean;
	toggleAccordian: () => void;
	findDialogBoxTimer: NodeJS.Timeout | null;
	setFindDialogBoxTimer: (timer: NodeJS.Timeout | null) => void;
}

export const useQuestControllerStore = create<QuestControllerStore>((set) => ({
	findDialogBoxTimer: null,
	setFindDialogBoxTimer: (timer) => set({ findDialogBoxTimer: timer }),
	popOutWindow: null,
	showAccordian: false,
	buttonVisible: true,
	popOutClicked: false,
	setPopOutWindow: (window) => set({ popOutWindow: window }),
	setButtonVisible: (visible) => set({ buttonVisible: visible }),
	setPopOutClicked: (clicked) => set({ popOutClicked: clicked }),
	showImageCaro: true,
	toggleImageCaro: () =>
		set((state) => ({ showImageCaro: !state.showImageCaro })),
	showStepReq: true,
	toggleShowStepReq: () =>
		set((state) => ({ showStepReq: !state.showStepReq })),
	showControlPopOut: false,
	toggleShowControlPopOut: () =>
		set((state) => ({ showControlPopOut: !state.showControlPopOut })),
	toggleAccordian: () =>
		set((state) => ({ showControlPopOut: !state.showControlPopOut })),
}));
