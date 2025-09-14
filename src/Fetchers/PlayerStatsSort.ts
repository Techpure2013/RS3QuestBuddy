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

export const parsePlayerStats = (rawData: string): Skills | null => {
	if (!rawData) {
		return null;
	}

	const statsArray = rawData.split(/\s+/).map((line) => line.split(","));
	const levels = statsArray.map((skillData) => parseInt(skillData[1], 10));

	const overallRank = parseInt(statsArray[0][0], 10);
	const totalLevel = parseInt(statsArray[0][1], 10);

	if (isNaN(totalLevel) || levels.length < 30) {
		console.error("Failed to parse player stats. Data was invalid.");
		return null;
	}
	const skills: Skills = {
		rank: overallRank,
		totalLevel: totalLevel,
		attack: levels[1],
		defence: levels[2],
		strength: levels[3],
		constitution: levels[4],
		range: levels[5],
		prayer: levels[6],
		magic: levels[7],
		cooking: levels[8],
		woodcutting: levels[9],
		fletching: levels[10],
		fishing: levels[11],
		firemaking: levels[12],
		crafting: levels[13],
		smithing: levels[14],
		mining: levels[15],
		herblore: levels[16],
		agility: levels[17],
		thieving: levels[18],
		slayer: levels[19],
		farming: levels[20],
		runecrafting: levels[21],
		hunter: levels[22],
		construction: levels[23],
		summoning: levels[24],
		dungeoneering: levels[25],
		divination: levels[26],
		invention: levels[27],
		archaeology: levels[28],
		necromancy: levels[29],
	};

	return skills;
};
