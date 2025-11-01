export type QuestAge =
	| "Ambiguous"
	| "None"
	| "Fifth or Sixth Age"
	| "Fifth Age"
	| "Ambiguous (Fits into Either Ages)"
	| "Sixth Age"
	| "Age of Chaos";
export type OfficialLength =
	| "Very Short"
	| "Short"
	| "Short to Medium"
	| "Medium"
	| "Medium to Long"
	| "Long"
	| "Very Long"
	| "Very Very Long";
export type MembersRequirement = "Free to Play" | "Members Only";
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
export type QuestList = {
	questName: string;
	questAge: string;
	series: string;
	questPoints: string;
	releaseDate: string;
};
export type QuestRewards = {
	questName: string;
	questPoints: number;
	rewards: string[];
};
export type questImage = {
	step: number;
	src: string;
	height: number;
	width: number;
	stepDescription: string;
};
export type QuestDetails = {
	questName: string;
	startPoint: string;
	membersRequirement: string;
	officialLength: string;
	questRequirements: string[];
	itemsRequired: string[];
	itemsRecommended: string[];
	enemiesToDefeat: string[];
};
