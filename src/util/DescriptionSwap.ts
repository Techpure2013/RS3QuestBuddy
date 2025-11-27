import { useMemo } from "react";
import { QuestStep } from "./../state/types";
import { usePlayerSelector } from "./../state/usePlayerSelector";

export interface QuestStepSwap {
	description: string;
	chat: string;
	refQuest: string;
	deletedIf: string;
}

export type QuestSwapMap = Record<string, QuestStepSwap[]>;

function normalize(text: string) {
	if (!text) return "";
	return text
		.replace(/[’']/g, "'")
		.replace(/[^a-z0-9'\s]/gi, "")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}

export function getQuestSwaps(name: string) {
	if (!name) return [];
	const normalized = name.trim().toLowerCase();
	const exact = questSwapMap[name];
	if (exact) return exact;
	const key = Object.keys(questSwapMap).find(
		(k) => k.trim().toLowerCase() === normalized,
	);
	return key ? questSwapMap[key] : [];
}

export function useQuestConditionalSwap(questName: string, step: QuestStep) {
	const completedPlayerQuests = usePlayerSelector((_, d) => d.completedQuests());

	return useMemo(() => {
		if (!completedPlayerQuests || !completedPlayerQuests.length || !step) {
			return null;
		}

		const swaps = getQuestSwaps(questName);
		if (!swaps.length) return null;
		const stepTextContent = [
			step.stepDescription,
			...(step.additionalStepInformation || []),
		].join(" ");
		const normalizedStepText = normalize(stepTextContent);

		for (const swap of swaps) {
			// The primary condition is the completion of the reference quest.
			const normalizedRefQuest = normalize(swap.refQuest);
			const isRefQuestCompleted = completedPlayerQuests.some(
				(pq) => normalize(pq.title) === normalizedRefQuest,
			);

			if (isRefQuestCompleted) {
				// We use `deletedIf` as the anchor to find the correct step.
				const normalizedDeletedIf = normalize(swap.deletedIf);

				if (
					normalizedDeletedIf &&
					normalizedStepText.includes(normalizedDeletedIf)
				) {
					return {
						activeChat: swap.chat,
						textToDelete: swap.deletedIf, // Return the original string for a precise removal.
					};
				}
			}
		}

		return null;
	}, [questName, step, completedPlayerQuests]);
}

export function replaceChatTag(text: string, newChat: string): string {
	const regexGlobal = /\(Chat[^\)]*\)/gi;
	const matches = text.match(regexGlobal);
	if (!matches || matches.length === 0) {
		return `${text.trim()} (${newChat})`;
	}
	const lastMatch = matches[matches.length - 1];
	const lastIndex = text.lastIndexOf(lastMatch);
	const before = text.substring(0, lastIndex);
	const after = text.substring(lastIndex + lastMatch.length);
	return `${before}(${newChat})${after}`;
}

export function removeTextFragment(
	sourceText: string,
	textToRemove: string,
): string {
	if (!sourceText || !textToRemove) {
		return sourceText;
	}

	// 1. Trim the input string to remove leading/trailing whitespace.
	const trimmedTextToRemove = textToRemove.trim();
	if (!trimmedTextToRemove) {
		return sourceText;
	}

	// 2. Build the regex from the trimmed string.
	const regex = new RegExp(
		trimmedTextToRemove.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
		"gi",
	);

	// 3. Replace and trim the final result.
	return sourceText.replace(regex, "").trim();
}

export const questSwapMap: QuestSwapMap = {
	"A Fairy Tale I: Growing Pains": [
		{
			description:
				"Teleport to Port Sarim and talk to Malignius Mortifer about a Tanglefoot. (Chat 2)",
			chat: "1",
			refQuest: "Swan Song",
			deletedIf: "(Chat 1) if Swan Song has been completed.",
		},
	],
	"A Void Dance": [
		{
			description: "Speak with Gerrant in the fishing shop. (Chat 1)",
			chat: "2",
			refQuest: "Heroes'",
			deletedIf: "if Heroes' Quest is complete (Chat 2)",
		},
		{
			description: "Talk to Sir Tiffy Cashien. (Chat 1)",
			chat: "2",
			refQuest: "Slug Menace",
			deletedIf: "(Chat 2) if Slug Menace has been completed.",
		},
		{
			description: "Speak with Sir Tiffy to get a commorb. (Chat 1)",
			chat: "2",
			refQuest: "Slug Menace",
			deletedIf: "(Chat 2) If Slug Menace has been completed.",
		},
	],
	"Buyers and Cellars": [
		{
			description:
				"Speak to Father Urhney in his house, south in the Lumbridge Swamp. (Chat 3•3)",
			chat: "Chat 4•3",
			refQuest: "The Restless Ghost",
			deletedIf: "If The Restless Ghost has been completed, (Chat 4•3)",
		},
		{
			description:
				"Talk to Urhney and mention the chalice then the fire. (Chat 3•4)",
			chat: "Chat 4•4",
			refQuest: "The Restless Ghost",
			deletedIf: "If The Restless Ghost has been completed, (Chat 4•4)",
		},
	],
	"Between a Rock": [
		{
			description:
				"Smith a gold helmet on the anvil in the same room which requires three gold bars.",
			chat: "Chat 2",
			refQuest: "Legends' Quest",
			deletedIf: "If you are proceeding or completed Legends' Quest. (Chat 2)",
		},
	],
	"Beneath Cursed Tides": [
		{
			description:
				"Unequip your weapons and dismiss followers and then talk to Wizard Myrtle. (Chat 1•2•1)",
			chat: "Chat 1•1•2•1",
			refQuest: "Recipe for Disaster: Freeing Pirate Pete",
			deletedIf:
				"If you have completed the Freeing Pirate Pete Recipe for Disaster subquest, or have built any kind of diving suit in the Aquarium. (Chat 1•1•2•1)",
		},
	],
	"Defender of Varrock": [
		{
			description: "Talk to Reldo in the library on the 1st floor[US]. (Chat 4)",
			chat: "Chat 5",
			refQuest: "TokTz-Ket-Dill",
			deletedIf: "(Chat 5) if TokTz-Ket-Dill has been completed.",
		},
		{
			description: "King Roald, southeast corner, 1st floor[US] (Chat 1)",
			chat: "Chat 2",
			refQuest: "The Lord of Vampyrium",
			deletedIf: "(Chat 2) if Lord of Vampyrium has been completed",
		},
	],
	"Glorious Memories": [
		{
			description:
				"Talk to Brundt the Chieftain back in Rellekka Longhall. (Chat 1)",
			chat: "Chat 2",
			refQuest: "Lunar Diplomacy",
			deletedIf: "If Lunar Diplomacy has been started (Chat 2)",
		},
		{
			description:
				"Talk to Brundt the Chieftain in the longhall to give him the unfinished astral rune. (Chat 1)",
			chat: "Chat 2",
			refQuest: "Lunar Diplomacy",
			deletedIf: "(Chat 2) If Lunar Diplomacy has been completed.",
		},
	],
	"Quiet Before the Swarm": [
		{
			description:
				"Speak to Sir Tiffy Cashien in the Falador Park about the void knights. (Chat 1•✓) ",
			chat: "Chat 2•✓",
			refQuest: "The Slug Menace",
			deletedIf: "If Slug Menace isn't complete (Chat 2•✓)",
		},
		{
			description:
				"Bank all your items, both equipped and in your inventory. Dismiss any pets or familiars and return to Sir Tiffy and talk about Void Knights. (Chat 1)",
			chat: "Chat 1",
			refQuest: "The Slug Menace",
			deletedIf: "If Slug Menace isn't complete (Chat 2)",
		},
	],
	"Ritual of the Mahjarrat": [
		{
			description:
				"Talk to Sir Tiffy and explain the situation to him. (Chat 1•3•✓)",
			chat: "Chat 2•3•✓",
			refQuest: "Quiet Before the Swarm",
			deletedIf:
				"If you haven't completed Quiet Before the Swarm then (Chat 1•3•✓)",
		},
		{
			description: "Read the message, then take it to Sir Tiffy. (Chat 1)",
			chat: "Chat 2",
			refQuest: "Quiet Before the Swarm",
			deletedIf: "If you have completed Quiet before the Swarm then (Chat 2)",
		},
		{
			description: "Talk to Sir Tiffy. (Chat 1)",
			chat: "Chat 2",
			refQuest: "Quiet Before the Swarm",
			deletedIf: "If Quiet Before the Swarm is completed (Chat 2)",
		},
		{
			description: "Read the message, then take it to Sir Tiffy. (Chat 1) ",
			chat: "Chat 2",
			refQuest: "Quiet Before the Swarm",
			deletedIf: "If Quiet Before the Swarm is completed (Chat 2)",
		},
		{
			description: "Talk to Sir Tiffy. (Chat 2)",
			chat: "Chat 1",
			refQuest: "Quiet Before the Swarm",
			deletedIf: "If Quiet before the Swarm isn't completed (Chat 1).",
		},
	],
	"While Guthix Sleeps": [
		{
			description: "Talk to Sir Tiffy Cashien in the Falador Park. (Chat 1)",
			chat: "Chat 2",
			refQuest: "The Slug Menace",
			deletedIf: "(Chat 2) if Slug Menace hasn't been completed.",
		},
		{
			description: "Talk to Reldo in the Varrock Library.(Chat 4•1•2•3•4)",
			chat: "Chat 2•4•1•2•3•4",
			refQuest: "Desperate Times",
			deletedIf:
				"If Desperate Times is completed, you need to choose one more chat option before proceed the aforementioned quest dialogue. (Chat 2•4•1•2•3•4)",
		},
	],
	"Land of the Goblins": [
		{
			description: "Talk to Aggie in Draynor Village. (Chat 4•2•4)",
			chat: "Chat 5•2•4",
			refQuest: "Vampyre Slayer",
			deletedIf: "(Chat 5•2•4) If Vampyre Slayer is complete.",
		},
	],
	"Shield of Arrav": [
		{
			description: "Talk to King Roald who is located in Varrock Palace. (Chat 1)",
			chat: "Chat 2",
			refQuest: "Priest in Peril",
			deletedIf: "If you have completed Priest in Peril (Chat 2)",
		},
	],
	"Tears of Guthix": [
		{
			description:
				"Talk to Juna in the Lumbridge Swamp Caves. You need to have your hands empty. (Chat 1•✓)",
			chat: "Chat 4•~•1•✓",
			refQuest: "The Chosen Commander",
			deletedIf:
				"If you've already completed The Chosen Commander. (Chat 4•~•1•✓)",
		},
		{
			description:
				"Talk to Juna in the Lumbridge Swamp Caves. You need to have your hands empty. (Chat 1•✓)",
			chat: "Chat 2•1•✓",
			refQuest: "The World Wakes",
			deletedIf: "If you completed World Wakes (Chat 2•1•✓)",
		},
	],
	"One Small Favour": [
		{
			description:
				"Go to the H.A.M. Hideout. Pick the lock on the old mine entrance, and climb down. Head to the southern cavern and speak to Johanhus Ulsbrecht. (Chat 4•3•2)",
			chat: "Chat 2•4•3•2",
			refQuest: "The Chosen Commander",
			deletedIf: "If player has completed The Chosen Commander. (Chat 2•4•3•2)",
		},
		{
			description:
				"Go to Taverley and talk with Sanfew, located in the house slightly south-west of Pikkupstix's Summoning Shop. (Chat 2•2•3•1)",
			chat: "Chat 3•2•3•1",
			refQuest: "Eadgar's Ruse",
			deletedIf: "If Eadgar's Ruse is completed. (Chat 3•2•3•1)",
		},
		{
			description: "Talk to Sanfew in Taverley. (Chat 2) ",
			chat: "Chat 3",
			refQuest: "Eadgar's Ruse",
			deletedIf: "(Chat 3) If the player has completed Eadgar's Ruse.",
		},
	],
	"The Giant Dwarf": [
		{
			description:
				"Talk to Thurgo in his small hut (fairy ring AIQ), south of Port Sarim, and north of Mudskipper Point. (Chat 2•2•2•1)",
			chat: "Chat 2•2•1",
			refQuest: "The Knight's Sword",
			deletedIf: "If The Knight's Sword is complete (Chat 2•2•1)",
		},
	],
	"The Lost Tribe": [
		{
			description: "Talk to Duke Horacio (Chat 3)",
			chat: "Chat 4",
			refQuest: "Dragon Slayer",
			deletedIf: "(Chat 4) If Dragon Slayer has been started/completed.",
		},
		{
			description: "Show the brooch to the Duke. (Chat 3)",
			chat: "Chat 4",
			refQuest: "Dragon Slayer",
			deletedIf: "(Chat 4) if Dragon Slayer has been started.",
		},
		{
			description: "Talk to the Cook, just downstairs. (Chat 4)",
			chat: "Chat 2",
			refQuest: "Recipe for Disaster: Another Cook's Quest",
			deletedIf:
				"(Chat 2) If Recipe for Disaster has been started but not finished.",
		},
		{
			description: "Talk to the Cook, just downstairs. (Chat 4)",
			chat: "Chat 5",
			refQuest: "Cook's Assistant",
			deletedIf: "(Chat 5) If Cook's Assistant has not started.",
		},
	],
	"Eadgar's Ruse": [
		{
			description:
				"Start the quest by speaking to Sanfew, who lives on the east side of Taverley, south-west of the summoning shop. (Chat 2•1•✓)",
			chat: "Chat 1•✓",
			refQuest: "Zogre Flesh Eaters",
			deletedIf:
				"If Zogre Flesh Eaters is not complete, use the following option: (Chat 1•✓)",
		},
	],
};
