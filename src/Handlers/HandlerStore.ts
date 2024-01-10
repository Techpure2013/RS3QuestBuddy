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
	highestStep: number;
	currentActive: number;
	htmlID: HTMLElement | null;
	viewQuestImage: boolean;
	setViewImage: (visible: boolean) => void;
	questImageVis: () => void;
}

export const useQuestControllerStore = create<QuestControllerStore>((set) => ({
	questImageVis: () => {
		set((state) => ({
			viewQuestImage: !state.viewQuestImage,
		}));
	},
	setViewImage: (visible) => set({ viewQuestImage: visible }),
	viewQuestImage: false,
	htmlID: null,
	currentActive: 0,
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
	highestStep: 0,
}));
