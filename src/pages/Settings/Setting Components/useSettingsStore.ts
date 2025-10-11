import { useState, useEffect, useCallback } from "react";

export interface SettingsState {
	isSettingsModalOpen: boolean;
	isCompact: boolean;
	dialogSolverEnabled: boolean;
	toolTipsEnabled: boolean;
	textColor: string;
	labelColor: string;
	buttonColor: string;
	textSwatches: string[];
	labelSwatches: string[];
	buttonSwatches: string[];
}

const SETTINGS_KEY = "appSettings";
const MAX_SWATCHES = 7;

const defaultSettings: SettingsState = {
	isSettingsModalOpen: false,
	isCompact: false,
	dialogSolverEnabled: false,
	toolTipsEnabled: true,
	textColor: "",
	labelColor: "",
	buttonColor: "",
	textSwatches: [],
	labelSwatches: [],
	buttonSwatches: [],
};

export const useSettingsStore = () => {
	const [settings, setSettings] = useState<SettingsState>(() => {
		try {
			const savedSettings = localStorage.getItem(SETTINGS_KEY);
			if (savedSettings) {
				// Merge saved settings with defaults to prevent crashes
				return { ...defaultSettings, ...JSON.parse(savedSettings) };
			}
		} catch (error) {
			console.error("Failed to parse settings from localStorage", error);
		}
		return defaultSettings;
	});

	// --- WHY 4: One effect to save them all ---
	// This single useEffect watches the entire `settings` object. Any time it
	// changes, it saves the whole object to localStorage. This is far more
	// efficient and maintainable than multiple effects.
	useEffect(() => {
		try {
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		} catch (error) {
			console.error("Failed to save settings to localStorage", error);
		}
	}, [settings]);

	// --- WHY 5: A single, generic update function ---
	// This function allows the UI to update any setting by its key.
	// We use `useCallback` to ensure this function's reference is stable.
	const updateSetting = useCallback(
		<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
			setSettings((prev) => ({
				...prev,
				[key]: value,
			}));
		},
		[],
	);
	const openSettingsModal = useCallback(() => {
		updateSetting("isSettingsModalOpen", true);
	}, [updateSetting]);

	const closeSettingsModal = useCallback(() => {
		updateSetting("isSettingsModalOpen", false);
	}, [updateSetting]);
	// --- WHY 6: Encapsulate complex logic like swatch updates ---
	// The UI component doesn't need to know how to update swatches; it just
	// calls this function. This keeps the component clean.
	const addColorToSwatch = useCallback(
		(
			swatchKey: "textSwatches" | "labelSwatches" | "buttonSwatches",
			colorToAdd: string,
		) => {
			setSettings((prev) => {
				const currentSwatches = prev[swatchKey];
				// If the color is already in our history, do nothing.
				if (currentSwatches.includes(colorToAdd)) {
					return prev;
				}
				// Otherwise, add the new color to the front and trim the array.
				const newSwatches = [colorToAdd, ...currentSwatches].slice(0, MAX_SWATCHES);
				return {
					...prev,
					[swatchKey]: newSwatches,
				};
			});
		},
		[],
	);

	return {
		settings,
		updateSetting,
		addColorToSwatch,
		openSettingsModal,
		closeSettingsModal,
	};
};
