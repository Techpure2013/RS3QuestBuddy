// hooks/useUISettings.ts
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

export function useUISettings() {
	const [uiState, setUiState] = useState<UIState>({
		isCompact: false,
		isHighlight: false,
		hasColor: false,
		hasButtonColor: false,
		hasLabelColor: false,
		userID: "",
		userColor: "",
		userLabelColor: "",
		userButtonColor: "",
	});

	const loadUserSettings = useCallback(() => {
		const isCompact = JSON.parse(localStorage.getItem("isCompact") || "false");
		const userID = localStorage.getItem("userID") || "";
		const userColor = localStorage.getItem("textColorValue") || "";
		const userLabelColor = localStorage.getItem("labelColor") || "";
		const userButtonColor = localStorage.getItem("buttonColor") || "";

		setUiState({
			isCompact,
			isHighlight: JSON.parse(localStorage.getItem("isHighlighted") || "false"),
			userID,
			userColor,
			userLabelColor,
			userButtonColor,
			hasColor: !!userColor,
			hasLabelColor: !!userLabelColor,
			hasButtonColor: !!userButtonColor,
		});
	}, []);

	useEffect(() => {
		loadUserSettings();
	}, [loadUserSettings]);

	return { uiState, loadUserSettings };
}
