import { useState, useEffect, useCallback } from "react";

export interface SettingsState {
	isExpandedMode: boolean;
	isSettingsModalOpen: boolean;
	isCompact: boolean;
	dialogSolverEnabled: boolean;
	toolTipsEnabled: boolean;
	autoScrollEnabled: boolean;
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
	isExpandedMode: false,
	autoScrollEnabled: true,
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
	const toggleExpandedMode = useCallback(() => {
		setSettings((prev) => ({
			...prev,
			isExpandedMode: !prev.isExpandedMode,
		}));
	}, []);
	const toggleAutoScroll = useCallback(() => {
		setSettings((prev) => ({
			...prev,
			autoScrollEnabled: !prev.autoScrollEnabled,
		}));
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		} catch (error) {
			console.error("Failed to save settings to localStorage", error);
		}
	}, [settings]);

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
		toggleExpandedMode,
		toggleAutoScroll,
	};
};
