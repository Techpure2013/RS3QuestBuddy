/* ==========================================================================
   RS3 Quest Buddy - Types
   ========================================================================== */

/* ==========================================================================
   Enums
   ========================================================================== */
//Player Status from Runemetrics
export type PlayerQuestStatus = {
	title: string;
	status: "COMPLETED" | "NOT_STARTED" | "STARTED";
	difficulty: number;
	questPoints: number;
	userEligible: boolean;
};
//Player Stats Skills
export type Skills = {
	rank: number;
	totalLevel: number;
	attack: number;
	defence: number;
	strength: number;
	constitution: number;
	range: number;
	prayer: number;
	magic: number;
	cooking: number;
	woodcutting: number;
	fletching: number;
	fishing: number;
	firemaking: number;
	crafting: number;
	smithing: number;
	mining: number;
	herblore: number;
	agility: number;
	thieving: number;
	slayer: number;
	farming: number;
	runecrafting: number;
	hunter: number;
	construction: number;
	summoning: number;
	dungeoneering: number;
	divination: number;
	invention: number;
	archaeology: number;
	necromancy: number;
};

// Keep in sync with server enums (server handlers/db/schema.ts)
export type QuestSeries =
	| "No Series"
	| "Delrith"
	| "Pirate"
	| "Fairy"
	| "Camelot"
	| "Gnome"
	| "Elf (Prifddinas)"
	| "Ogre"
	| "Elemental Workshop"
	| "Myreque"
	| "Troll"
	| "Fremennik"
	| "Desert"
	| "Cave Goblin"
	| "Dwarf (Red Axe)"
	| "Temple Knight"
	| "Enchanted Key"
	| "Odd Old Man"
	| "Wise Old Man"
	| "Penguin"
	| "TzHaar"
	| "Summer"
	| "Thieves' Guild"
	| "Void Knight"
	| "Fremennik Sagas"
	| "Ozan"
	| "Doric's Tasks"
	| "Boric's Tasks"
	| "Ariane"
	| "Tales of the Arc"
	| "Violet Tendencies"
	| "Seasons"
	| "Mahjarrat Mysteries"
	| "Sliske's Game"
	| "The Elder God Wars"
	| "Legacy of Zamorak"
	| "Fort Forinthry"
	| "The First Necromancer"
	| "City of Um";

export type QuestAge =
	| "Ambiguous"
	| "None"
	| "Fifth or Sixth Age"
	| "Fifth Age"
	| "Ambiguous (Fits into Either Ages)"
	| "Sixth Age"
	| "Age of Chaos";

export type MemberRequirement = "Free to Play" | "Members Only";

export type OfficialLength =
	| "Very Short"
	| "Short"
	| "Short to Medium"
	| "Medium"
	| "Medium to Long"
	| "Long"
	| "Very Long"
	| "Very Very Long";

/* ==========================================================================
   Highlights (NPC / Object)
   ========================================================================== */

export type NpcLocation = { lat: number; lng: number };

export type NpcWanderRadius = {
	bottomLeft: NpcLocation;
	topRight: NpcLocation;
};

export type NpcHighlight = {
	id?: number;
	npcName: string;
	npcLocation: NpcLocation;
	wanderRadius?: NpcWanderRadius;
};

export type ObjectLocationPoint = {
	lat: number;
	lng: number;
	color?: string;
	numberLabel?: string;
};

export type ObjectRadius = {
	bottomLeft: NpcLocation;
	topRight: NpcLocation;
};

export type ObjectHighlight = {
	id?: number;
	name: string;
	objectLocation: ObjectLocationPoint[];
	objectRadius?: ObjectRadius;
};

export type QuestHighlights = {
	npc: NpcHighlight[];
	object: ObjectHighlight[];
};

/* ==========================================================================
   Clipboard (discriminated union)
   ========================================================================== */

export type Clipboard =
	| { type: "none"; data: null }
	| { type: "npc"; data: NpcHighlight }
	| { type: "object"; data: ObjectHighlight }
	| { type: "npc-list"; data: NpcHighlight[] }
	| { type: "object-list"; data: ObjectHighlight[] };

/* ==========================================================================
   Quest Details / Steps / Images
   ========================================================================== */

export type QuestDetails = {
	Quest: string;
	StartPoint: string;
	MemberRequirement: MemberRequirement;
	OfficialLength: OfficialLength;
	Requirements: string[];
	ItemsRequired: string[];
	Recommended: string[];
	EnemiesToDefeat: string[];
};

export type QuestStep = {
	stepDescription: string;
	itemsNeeded?: string[];
	itemsRecommended?: string[];
	additionalStepInformation?: string[];
	highlights: QuestHighlights;
	floor: number;
};

export type QuestImage = {
	step: number;
	src: string;
	height: number;
	width: number;
	stepDescription: string;
};

/* ==========================================================================
   Editor Shape (flat quest)
   ========================================================================== */

export type Quest = {
	questName: string;
	questSteps: QuestStep[];
	questDetails: QuestDetails;
	questImages: QuestImage[];
};

/* ==========================================================================
   Bundle / Normalized Shapes (API & IDB)
   ========================================================================== */

export type NormalizedQuestStep = {
	stepDescription: string;
	itemsNeeded: string[];
	itemsRecommended: string[];
	additionalStepInformation: string[];
	highlights: QuestHighlights;
	floor: number;
};

export type QuestBundle = {
	quest: { name: string };
	details: QuestDetails;
	steps: QuestStep[];
	images: QuestImage[];
};

export type QuestBundleNormalized = {
	quest: { name: string };
	details: QuestDetails;
	steps: NormalizedQuestStep[];
	images: QuestImage[];
};

/* ==========================================================================
   Mappers: Bundle <-> Editor Quest
   ========================================================================== */
type StepIn = {
	stepNumber?: number;
	stepDescription?: string;
	itemsNeeded?: unknown;
	itemsRecommended?: unknown;
	additionalStepInformation?: unknown;
	highlights?: QuestHighlights;
	floor?: number;
};

const toLinesArray = (v: unknown): string[] => {
	if (Array.isArray(v)) return v.map((x) => String(x ?? "")).filter(Boolean);
	if (v == null) return [];
	const raw = String(v);

	const looksJsonString =
		(raw.startsWith('"') && raw.endsWith('"')) ||
		(raw.startsWith("'") && raw.endsWith("'")) ||
		raw.includes('\\"');

	if (looksJsonString) {
		try {
			const parsed = JSON.parse(raw);
			return String(parsed)
				.split(/\r?\n/)
				.map((s) => s.trim())
				.filter(Boolean);
		} catch {
			// ignore
		}
	}

	return raw
		.split(/\r?\n/)
		.map((s) => s.trim())
		.filter(Boolean);
};
export function bundleToQuest(b: QuestBundle): Quest {
	if (!b || !b.quest || !b.details) {
		throw new Error(`Invalid quest bundle: missing required data`);
	}
	const stepsIn = (b.steps as StepIn[] | undefined) ?? [];
	const sorted = stepsIn
		.slice()
		.sort((s1, s2) => (s1.stepNumber ?? 0) - (s2.stepNumber ?? 0));

	return {
		questName: b.quest.name,
		questSteps: sorted.map((s) => ({
			stepDescription: s.stepDescription ?? "",
			itemsNeeded: toLinesArray(s.itemsNeeded),
			itemsRecommended: toLinesArray(s.itemsRecommended),
			additionalStepInformation: toLinesArray(s.additionalStepInformation),
			highlights: s.highlights ?? { npc: [], object: [] },
			floor: Number.isFinite(s.floor as number) ? (s.floor as number) : 0,
		})),
		questDetails: {
			Quest: b.details.Quest,
			StartPoint: b.details.StartPoint ?? "",
			MemberRequirement: b.details.MemberRequirement,
			OfficialLength: b.details.OfficialLength,
			Requirements: b.details.Requirements ?? [],
			ItemsRequired: b.details.ItemsRequired ?? [],
			Recommended: b.details.Recommended ?? [],
			EnemiesToDefeat: b.details.EnemiesToDefeat ?? [],
		},
		questImages: b.images ?? [],
	};
}

export function questToBundle(q: Quest): QuestBundleNormalized {
	return {
		quest: { name: q.questName },
		details: {
			Quest: q.questDetails.Quest,
			StartPoint: q.questDetails.StartPoint ?? "",
			MemberRequirement: q.questDetails.MemberRequirement,
			OfficialLength: q.questDetails.OfficialLength,
			Requirements: q.questDetails.Requirements ?? [],
			ItemsRequired: q.questDetails.ItemsRequired ?? [],
			Recommended: q.questDetails.Recommended ?? [],
			EnemiesToDefeat: q.questDetails.EnemiesToDefeat ?? [],
		},
		steps: (q.questSteps ?? []).map((s) => ({
			stepDescription: s.stepDescription ?? "",
			itemsNeeded: toLinesArray(s.itemsNeeded),
			itemsRecommended: toLinesArray(s.itemsRecommended),
			additionalStepInformation: toLinesArray(s.additionalStepInformation),
			highlights: s.highlights ?? { npc: [], object: [] },
			floor: Number.isFinite(s.floor) ? s.floor : 0,
		})),
		images: q.questImages ?? [],
	};
}
