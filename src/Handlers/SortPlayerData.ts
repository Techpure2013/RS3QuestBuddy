import { PlayerQuestInfo, usePlayerStore } from "./PlayerFetch";

export class rsQuestSorter {
	private remainingQuests: string[] = [];
	constructor() {
		this.sortNotStartedQuests = this.sortNotStartedQuests.bind(this);
		this.sortCompletedQuests = this.sortCompletedQuests.bind(this);
		this.remainingQuests = this.remainingQuests;
	}

	public sortNotStartedQuests(playerInfo: PlayerQuestInfo[]): string[] {
		if (Array.isArray(playerInfo)) {
			const replacementMap: [string, string][] = [
				["Hermy and Bass", "That Old Black Magic: Hermy and Bass"],
				["Flesh and Bone", "That Old Black Magic: Flesh and Bone"],
				["Skelly by Everlight", "That Old Black Magic: Skelly by Everlight"],
				["My One and Only Lute", "That Old Black Magic: My One and Only Lute"],
				["Foreshadowing", "Once Upon a Time in Gielinor: Foreshadowing"],
				[
					"Defeating the Culinaromancer",
					"Recipe for Disaster: Defeating the Culinaromancer",
				],
				["Freeing Evil Dave", "Recipe for Disaster: Freeing Evil Dave"],
				["Freeing King Awowogei", "Recipe for Disaster: Freeing King Awowogei"],
				["Freeing Pirate Pete", "Recipe for Disaster: Freeing Pirate Pete"],
				["Freeing Sir Amik Varze", "Recipe for Disaster: Freeing Sir Amik Varze"],
				["Freeing Skrach Uglogwee", "Recipe for Disaster: Freeing Skrach Uglogwee"],
				[
					"Freeing the Goblin Generals",
					"Recipe for Disaster: Freeing the Goblin Generals",
				],
				[
					"Freeing the Lumbridge Sage",
					"Recipe for Disaster: Freeing the Lumbridge Sage",
				],
				[
					"Freeing the Mountain Dwarf",
					"Recipe for Disaster: Freeing the Mountain Dwarf",
				],
				["That Old Black Magic", ""],
				["Unstable Foundations", ""],
				["Once Upon a Time in Gielinor", ""],
				["Recipe for Disaster", ""],
				["Dimension of Disaster", ""],
				["Finale", "Once Upon a Time in Gielinor: Finale"],
				["flashback", "Once Upon a Time in Gielinor: Flashback"],
				["Foreshadowing", "Once Upon a Time in Gielinor: Foreshadowing"],
				["Fortunes", "Once Upon a Time in Gielinor: Fortunes"],
				["Raksha, The Shadow Colossus", "Raksha, The Shadow Colossus Quest"],
				["Helping Laniakea", "Helping Laniakea (miniquest)"],
				["Father and Son", "Father and Son (miniquest)"],
				["A Fairy Tale I - Growing Pains", "A Fairy Tale I: Growing Pains"],
				["A Fairy Tale II - Cure a Queen", "A Fairy Tale II: Cure a Queen"],
				[
					"A Fairy Tale III - Battle at Ork's Rift",
					"A Fairy Tale III: Battle at Ork's Rift",
				],
			];

			const replaceQuestTitle = (title: string) => {
				const lowerCaseTitle = title.toLowerCase();
				const replacement = replacementMap.find(
					([original]) => original.toLowerCase() === lowerCaseTitle
				);
				return replacement ? replacement[1] : title;
			};

			const replacedPlayerInfo = playerInfo.map((value) => {
				if (value && typeof value === "object" && value.title) {
					return { ...value, title: replaceQuestTitle(value.title) };
				} else {
					return value;
				}
			});

			const updatedReplacedPlayerInfo = replacedPlayerInfo.map((value) => {
				if (value && typeof value === "object" && value.title) {
					const questTitle = replaceQuestTitle(value.title).toLowerCase();

					// Switch statement for excluded quests
					switch (questTitle) {
						case "that old black magic":
						case "recipe for disaster":
						case "once upon a time in gielinor":
						case "unstable foundations":
						case "dimension of disaster":
							// Exclude quests that match any of the specified phrases
							return null;

						case "that old black magic: hermy and bass":
							value.questPoints = 2;
							break;

						case "dimension of disaster: curse of arrav":
							value.questPoints = 3;
							break;

						case "once upon a time in gielinor: finale":
							value.questPoints = 4;
							break;

						case "necromancy!":
							value.questPoints = 1;
							break;

						default:
							// Include all other quests
							break;
					}

					return value;
				} else {
					return null;
				}
			});

			// Remove null values (excluded quests)
			const filteredPlayerInfo = updatedReplacedPlayerInfo.filter(
				(value) => value !== null
			);

			// Now finalFilteredPlayerInfo contains the modified quest points

			const hasCompleteInfo = filteredPlayerInfo.filter((value) => {
				if (value && typeof value === "object" && value.title) {
					return value.status.toLowerCase() === "completed";
				} else {
					return false;
				}
			});
			const questPointsInfo = hasCompleteInfo.filter((value) => {
				if (value && typeof value === "object" && value.title) {
					return value.questPoints;
				} else {
					return false;
				}
			});
			const totalQuestPoints = questPointsInfo.reduce((total, value) => {
				if (
					value &&
					typeof value === "object" &&
					value.title &&
					typeof value.questPoints === "number"
				) {
					return total + value.questPoints;
				} else {
					return total;
				}
			}, 0);
			if (sessionStorage.getItem("questPoints") === null) {
				window.sessionStorage.setItem(
					"questPoints",
					JSON.stringify(totalQuestPoints)
				);
			}
			if (sessionStorage.getItem("hasCompleted") === null) {
				window.sessionStorage.setItem(
					"hasCompleted",
					JSON.stringify(hasCompleteInfo)
				);
			}
			const startedInfo = replacedPlayerInfo.filter((value) => {
				if (value && typeof value === "object" && value.title) {
					return value.status.toLowerCase() === "started";
				} else {
					return false;
				}
			});
			const newFiltersInfo = replacedPlayerInfo.filter((value) => {
				if (value && typeof value === "object" && value.title) {
					return value.status.toLowerCase() === "not_started";
				} else {
					return false;
				}
			});

			const lastFilter = newFiltersInfo.filter((value) => {
				if (value && typeof value === "object" && value.title) {
					return value.userEligible;
				} else {
					return false;
				}
			});

			const updatedRemainingQuests = lastFilter.map((value) => value.title);

			this.remainingQuests = updatedRemainingQuests;
			startedInfo.map((value) => this.remainingQuests.push(value.title));
		} else {
			console.warn("playerInfo is not an array:", playerInfo);
		}
		if (sessionStorage.getItem("remainingQuests") === null) {
			window.sessionStorage.setItem(
				"remainingQuests",
				JSON.stringify(this.remainingQuests)
			);
		}

		return this.remainingQuests;
	}
	public sortCompletedQuests(playerInfo: PlayerQuestInfo[]): void {
		if (Array.isArray(playerInfo)) {
			const replacementMap: [string, string][] = [
				["Hermy and Bass", "That Old Black Magic: Hermy and Bass"],
				["Flesh and Bone", "That Old Black Magic: Flesh and Bone"],
				["Skelly by Everlight", "That Old Black Magic: Skelly by Everlight"],
				["My One and Only Lute", "That Old Black Magic: My One and Only Lute"],
				["Foreshadowing", "Once Upon a Time in Gielinor: Foreshadowing"],
				[
					"Defeating the Culinaromancer",
					"Recipe for Disaster: Defeating the Culinaromancer",
				],
				["Freeing Evil Dave", "Recipe for Disaster: Freeing Evil Dave"],
				["Freeing King Awowogei", "Recipe for Disaster: Freeing King Awowogei"],
				["Freeing Pirate Pete", "Recipe for Disaster: Freeing Pirate Pete"],
				["Freeing Sir Amik Varze", "Recipe for Disaster: Freeing Sir Amik Varze"],
				["Freeing Skrach Uglogwee", "Recipe for Disaster: Freeing Skrach Uglogwee"],
				[
					"Freeing the Goblin Generals",
					"Recipe for Disaster: Freeing the Goblin Generals",
				],
				[
					"Freeing the Lumbridge Sage",
					"Recipe for Disaster: Freeing the Lumbridge Sage",
				],
				[
					"Freeing the Mountain Dwarf",
					"Recipe for Disaster: Freeing the Mountain Dwarf",
				],
				["That Old Black Magic", ""],
				["Unstable Foundations", ""],
				["Once Upon a Time in Gielinor", ""],
				["Recipe for Disaster", ""],
				["Dimension of Disaster", ""],
				["Finale", "Once Upon a Time in Gielinor: Finale"],
				["flashback", "Once Upon a Time in Gielinor: Flashback"],
				["Foreshadowing", "Once Upon a Time in Gielinor: Foreshadowing"],
				["Fortunes", "Once Upon a Time in Gielinor: Fortunes"],
				["Raksha, The Shadow Colossus", "Raksha, The Shadow Colossus Quest"],
				["Helping Laniakea", "Helping Laniakea (miniquest)"],
				["Father and Son", "Father and Son (miniquest)"],
				["A Fairy Tale I - Growing Pains", "A Fairy Tale I: Growing Pains"],
				["A Fairy Tale II - Cure a Queen", "A Fairy Tale II: Cure a Queen"],
				[
					"A Fairy Tale III - Battle at Ork's Rift",
					"A Fairy Tale III: Battle at Ork's Rift",
				],
			];

			const replaceQuestTitle = (title: string) => {
				const lowerCaseTitle = title.toLowerCase();
				const replacement = replacementMap.find(
					([original]) => original.toLowerCase() === lowerCaseTitle
				);
				return replacement ? replacement[1] : title;
			};

			const replacedPlayerInfo = playerInfo.map((value) => {
				if (value && typeof value === "object" && value.title) {
					return { ...value, title: replaceQuestTitle(value.title) };
				} else {
					return value;
				}
			});

			const updatedReplacedPlayerInfo = replacedPlayerInfo.map((value) => {
				if (value && typeof value === "object" && value.title) {
					const questTitle = replaceQuestTitle(value.title).toLowerCase();

					// Switch statement for excluded quests
					switch (questTitle) {
						case "that old black magic":
						case "recipe for disaster":
						case "once upon a time in gielinor":
						case "unstable foundations":
						case "dimension of disaster":
							// Exclude quests that match any of the specified phrases
							return null;

						case "that old black magic: hermy and bass":
							value.questPoints = 2;
							break;

						case "dimension of disaster: curse of arrav":
							value.questPoints = 3;
							break;

						case "once upon a time in gielinor: finale":
							value.questPoints = 4;
							break;

						case "necromancy!":
							value.questPoints = 1;
							break;

						default:
							// Include all other quests
							break;
					}

					return value;
				} else {
					return null;
				}
			});

			// Remove null values (excluded quests)
			const filteredPlayerInfo = updatedReplacedPlayerInfo.filter(
				(value) => value !== null
			);

			const hasCompleteInfo = filteredPlayerInfo.filter((value) => {
				if (value && typeof value === "object" && value.title) {
					return value.status.toLowerCase() === "completed";
				} else {
					return false;
				}
			});
			//Filters out Quest Points
			const questPointsInfo = hasCompleteInfo.filter((value) => {
				if (value && typeof value === "object" && value.title) {
					return value.questPoints;
				} else {
					return false;
				}
			});
			//combines questpoints to total
			const totalQuestPoints = questPointsInfo.reduce((total, value) => {
				if (
					value &&
					typeof value === "object" &&
					value.title &&
					typeof value.questPoints === "number"
				) {
					return total + value.questPoints;
				} else {
					return total;
				}
			}, 0);
			//Window Session Storage
			if (sessionStorage.getItem("questPoints") === null) {
				window.sessionStorage.setItem(
					"questPoints",
					JSON.stringify(totalQuestPoints)
				);
			}
			//Window Session Storage
			if (sessionStorage.getItem("hasCompleted") === null) {
				window.sessionStorage.setItem(
					"hasCompleted",
					JSON.stringify(hasCompleteInfo)
				);
			}
			console.warn("This is for debugging purposes on users end", hasCompleteInfo);
			usePlayerStore.getState().grabbedSkills = true;
		}
	}
}
