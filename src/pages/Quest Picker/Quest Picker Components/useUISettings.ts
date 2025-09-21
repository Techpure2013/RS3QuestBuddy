import { useState, useEffect, useCallback } from "react";

export interface UIState {
	isCompact: boolean;
	isHighlight: boolean;
	hasColor: boolean;
	hasButtonColor: boolean;
	hasLabelColor: boolean;
	userID: string;
	userColor: string;
	userLabelColor: string;
	userButtonColor: string;
}

// Helper function to read from localStorage safely
const getInitialUIState = (): UIState => {
	// Guard against running on a server where localStorage is not available
	if (typeof window === "undefined") {
		return {
			isCompact: false,
			isHighlight: false,
			hasColor: false,
			hasButtonColor: false,
			hasLabelColor: false,
			userID: "",
			userColor: "",
			userLabelColor: "",
			userButtonColor: "",
		};
	}

	try {
		const isCompact = JSON.parse(localStorage.getItem("isCompact") || "false");
		const isHighlight = JSON.parse(
			localStorage.getItem("isHighlighted") || "false",
		);
		const userID = localStorage.getItem("userID") || "";
		const userColor = localStorage.getItem("textColorValue") || "";
		const userLabelColor = localStorage.getItem("labelColor") || "";
		const userButtonColor = localStorage.getItem("buttonColor") || "";

		return {
			isCompact,
			isHighlight,
			userID,
			userColor,
			userLabelColor,
			userButtonColor,
			hasColor: !!userColor,
			hasLabelColor: !!userLabelColor,
			hasButtonColor: !!userButtonColor,
		};
	} catch (error) {
		console.error("Failed to parse UI settings from localStorage", error);
		// Return default state on error
		return {
			isCompact: false,
			isHighlight: false,
			hasColor: false,
			hasButtonColor: false,
			hasLabelColor: false,
			userID: "",
			userColor: "",
			userLabelColor: "",
			userButtonColor: "",
		};
	}
};

export function useUISettings() {
	// Initialize state directly from our helper function.
	// This runs ONCE before the first render.
	const [uiState, setUiState] = useState<UIState>(getInitialUIState);

	// This function is still useful for refreshing settings from another component
	const loadUserSettings = useCallback(() => {
		setUiState(getInitialUIState());
	}, []);

	// This effect is no longer strictly necessary for the initial load,
	// but it's good practice to keep it in case localStorage
	// is changed by another browser tab.
	useEffect(() => {
		const handleStorageChange = () => {
			loadUserSettings();
		};
		window.addEventListener("storage", handleStorageChange);
		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, [loadUserSettings]);

	return { uiState, loadUserSettings };
}
