import { useEffect, useCallback } from "react";
import * as a1lib from "alt1";
import { useQuestControllerStore } from "./../../Handlers/HandlerStore";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./../../Entrance/Entrance Components/socketContext";

// FIX 1: Define constants that never change OUTSIDE the hook.
// This ensures they have a stable reference and are only created once.
const IGNORED_REQUIREMENTS = new Set([
	"Meet Naressa in Senntisten",
	"Unabridged",
	"Ironmen",
	"Ironman",
	"Be ",
	"Access",
	"Ability to",
	"Time Served",
	"Find",
	"Complete",
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
	"Rescue Mad Eadgar from the Troll Stronghold",
]);

const openDiscord = (): void => {
	const newWindow = window.open(
		"https://discord.gg/qFftZF7Usa",
		"_blank",
		"noopener,noreferrer",
	);
	if (newWindow) newWindow.opener = null;
};

const openWikiQuest = (questName: string): void => {
	if (questName === "Another Slice of HAM")
		questName = "Another Slice of H.A.M.";
	if (questName === "Raksha, The Shadow Colossus Quest")
		questName = "Raksha, the Shadow Colossus (quest)";
	if (questName === "Between a Rock") questName = "Between a Rock...";
	const newWindow = window.open(
		`https://runescape.wiki/w/${encodeURIComponent(questName)}/Quick_guide`,
		"_blank",
		"noopener,noreferrer",
	);
	if (newWindow) newWindow.opener = null;
};

const openCoffee = (): void => {
	const newWindow = window.open("https://buymeacoffee.com/rs3questbuddy");
	if (newWindow) newWindow.opener = null;
};

export const useQuestPageFunctions = () => {
	const socket = useSocket();
	const hist = useNavigate();
	const handles = useQuestControllerStore();

	const useAlt1Listener = (callback: () => void) => {
		useEffect(() => {
			const handleAlt1Pressed = () => {
				if (alt1.rsActive) {
					callback();
				}
			};
			a1lib.on("alt1pressed", handleAlt1Pressed);
			return () => a1lib.removeListener("alt1pressed", handleAlt1Pressed);
		}, [callback]);
	};

	// FIX 2: Wrap functions that depend on other hooks in useCallback.
	// This prevents them from being recreated on every render unless their own dependencies change.
	const handleBackButton = useCallback(
		(userID: string | null, questname: string) => {
			if (socket?.connected) {
				socket.emit("removeTempURL", { userID: userID, questName: questname });
			}
			hist("/");
			if (handles.popOutWindow) {
				handles.popOutWindow.close();
			}
		},
		[socket, hist, handles.popOutWindow],
	);

	return {
		ignoredRequirements: IGNORED_REQUIREMENTS,
		useAlt1Listener,
		handleBackButton,
		openDiscord,
		openWikiQuest,
		openCoffee,
	} as const;
};
