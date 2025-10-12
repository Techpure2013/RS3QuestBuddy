import { createContext, useContext, ReactNode } from "react";
import {
	useSettingsStore,
	SettingsState,
} from "./../../pages/Settings/Setting Components/useSettingsStore";

// --- WHY 1: Define the shape of our context data ---
// This includes the state itself and the functions to update it.
interface SettingsContextType {
	settings: SettingsState;
	updateSetting: <K extends keyof SettingsState>(
		key: K,
		value: SettingsState[K],
	) => void;
	addColorToSwatch: (
		swatchKey: "textSwatches" | "labelSwatches" | "buttonSwatches",
		colorToAdd: string,
	) => void;
	openSettingsModal: () => void;
	closeSettingsModal: () => void;
	toggleExpandedMode: () => void;
	toggleAutoScroll: () => void;
}

// --- WHY 2: Create the Context object ---
// We create it with `undefined` and will handle the null check in our consumer hook.
const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

// --- WHY 3: Create the Provider Component ---
// This component will wrap our app. It's where the settings state will actually LIVE.
// It calls `useSettingsStore` ONCE and provides its values to all children.
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
	const settingsData = useSettingsStore();

	return (
		<SettingsContext.Provider value={settingsData}>
			{children}
		</SettingsContext.Provider>
	);
};

// --- WHY 4: Create the Consumer Hook ---
// This is the new hook our components will use. It's a clean way to access the
// context data. If a component tries to use this hook outside of the provider,
// we throw a helpful error.
export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};
