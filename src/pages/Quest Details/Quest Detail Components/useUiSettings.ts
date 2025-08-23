import { useState, useEffect, useCallback } from "react";

export const useUiSettings = () => {
	const [settings, setSettings] = useState({
		toolTipEnabled: false,
		isHighlight: false,
		dialogOption: false,
		userColor: "",
		userLabelColor: "",
		userButtonColor: "",
		hasColor: false,
		hasLabelColor: false,
		hasButtonColor: false,
	});

	// FIX: Wrap the function in useCallback to stabilize its reference.
	// The empty dependency array [] means it will only be created once.
	const loadSettings = useCallback(() => {
		const isHighlight = JSON.parse(
			localStorage.getItem("isHighlighted") || "false",
		);
		const dialogOption = JSON.parse(
			localStorage.getItem("DialogSolverOption") || "false",
		);
		const toolTipEnabled = JSON.parse(localStorage.getItem("toolTip") || "false");
		const userColor = localStorage.getItem("textColorValue") || "";
		const userLabelColor = localStorage.getItem("labelColor") || "";
		const userButtonColor = localStorage.getItem("buttonColor") || "";

		setSettings({
			toolTipEnabled,
			isHighlight,
			dialogOption,
			userColor,
			userLabelColor,
			userButtonColor,
			hasColor: !!userColor,
			hasLabelColor: !!userLabelColor,
			hasButtonColor: !!userButtonColor,
		});
	}, []); // Empty dependency array is correct here.

	useEffect(() => {
		loadSettings();
	}, [loadSettings]); // It's best practice to include the memoized function here.

	return { settings, reloadSettings: loadSettings };
};
