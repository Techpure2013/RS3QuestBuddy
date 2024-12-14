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
    settingsIsOpen: (open: boolean) => void;
    settingsOpen: boolean;
    viewQuestImage: boolean;
    setViewImage: (visible: boolean) => void;
    questImageVis: () => void;
}
export declare const useQuestControllerStore: import("zustand").UseBoundStore<import("zustand").StoreApi<QuestControllerStore>>;
export {};
