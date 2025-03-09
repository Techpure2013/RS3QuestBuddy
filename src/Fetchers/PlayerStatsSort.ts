import { useRef } from "react";

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

export const usePlayerSortStats = () => {
	let sortedPlayerStats = useRef<Skills[] | null>(null);
	const filterPlayerStats = (playerStats: string[]) => {
		const filterOutNewLine = playerStats.filter(
			(string) => !string.includes("\n")
		);
		const start = performance.now(); // Start measuring
		sortedPlayerStats.current = [
			{
				rank: parseInt(filterOutNewLine[0], 10),
				totalLevel: parseInt(filterOutNewLine[1], 10),
				attack: parseInt(filterOutNewLine[2], 10),
				defence: parseInt(filterOutNewLine[3], 10),
				strength: parseInt(filterOutNewLine[4], 10),
				constitution: parseInt(filterOutNewLine[5], 10),
				range: parseInt(filterOutNewLine[6], 10),
				prayer: parseInt(filterOutNewLine[7], 10),
				magic: parseInt(filterOutNewLine[8], 10),
				cooking: parseInt(filterOutNewLine[9], 10),
				woodcutting: parseInt(filterOutNewLine[10], 10),
				fletching: parseInt(filterOutNewLine[11], 10),
				fishing: parseInt(filterOutNewLine[12], 10),
				firemaking: parseInt(filterOutNewLine[13], 10),
				crafting: parseInt(filterOutNewLine[14], 10),
				smithing: parseInt(filterOutNewLine[15], 10),
				mining: parseInt(filterOutNewLine[16], 10),
				herblore: parseInt(filterOutNewLine[17], 10),
				agility: parseInt(filterOutNewLine[18], 10),
				thieving: parseInt(filterOutNewLine[19], 10),
				slayer: parseInt(filterOutNewLine[20], 10),
				farming: parseInt(filterOutNewLine[21], 10),
				runecrafting: parseInt(filterOutNewLine[22], 10),
				hunter: parseInt(filterOutNewLine[23], 10),
				construction: parseInt(filterOutNewLine[24], 10),
				summoning: parseInt(filterOutNewLine[25], 10),
				dungeoneering: parseInt(filterOutNewLine[26], 10),
				divination: parseInt(filterOutNewLine[27], 10),
				invention: parseInt(filterOutNewLine[28], 10),
				archaeology: parseInt(filterOutNewLine[29], 10),
				necromancy: parseInt(filterOutNewLine[30], 10),
			},
		];
		const end = performance.now();
		console.log(`filterPlayerStats took ${end - start}ms to execute`);
	};
	return { sortedPlayerStats, filterPlayerStats } as const;
};
