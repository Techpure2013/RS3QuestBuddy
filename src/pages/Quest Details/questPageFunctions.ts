import { useEffect } from "react";
import * as a1lib from "alt1";
import { useQuestControllerStore } from "./../../Handlers/HandlerStore";
import { useNavigate } from "react-router-dom";
export const useQuestPageFunctions = () => {
	const hist = useNavigate();
	const handles = useQuestControllerStore();
	const create_ListUUID = () => {
		var dt = new Date().getTime();
		var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			function (c) {
				var r = (dt + Math.random() * 16) % 16 | 0;
				dt = Math.floor(dt / 16);
				return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
			}
		);
		return uuid;
	};
	const useAlt1Listener = (callback: () => void) => {
		useEffect(() => {
			const handleAlt1Pressed = () => {
				callback();
			};

			// Attach event listener once when component mounts

			a1lib.on("alt1pressed", handleAlt1Pressed);

			// Clean up the listener on unmount
			return () => {
				a1lib.removeListener("alt1pressed", handleAlt1Pressed);
			};
		}, [callback]); // Only re-run if callback changes
	};
	const handleBackButton = () => {
		// Navigate to home
		hist("/");

		// Check if popOutWindow exists and close it
		if (handles.popOutWindow) {
			handles.popOutWindow.close();
		} else {
			console.warn("popOutWindow is null or undefined.");
		}
	};
	const openDiscord = (): void => {
		const newWindow = window.open(
			"https://discord.gg/qFftZF7Usa",
			"_blank",
			"noopener,noreferrer"
		);
		if (newWindow) newWindow.opener = null;
	};
	const ignoredRequirements = new Set([
		"Ironmen",
		"Ironman",
		"Be ",
		"Access",
		"Ability to",
		"Time Served",
		"Find",
		"Complete the base camp tutorial on Anachronia",
		"Rescue Mad Eadgar from the Troll Stronghold",
		"Able To",
		"Claim Kudos",
		"You must be using the standard spells or be able to use Spellbook Swap",
		"Completion of",
		"To make",
		"Achieve",
		"Bring Leela to Senliten's tomb",
		"If Icthlarin's Little Helper was completed prior to the addition of Stolen Hearts and Diamond in the Rough, they must be completed before Contact! can be started (or completed).",
		"For Ironmen",
	]);
	return {
		ignoredRequirements,
		create_ListUUID,
		useAlt1Listener,
		handleBackButton,
		openDiscord,
	} as const;
};
