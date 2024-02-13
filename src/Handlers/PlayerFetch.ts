import { create } from "zustand";

export type PlayerQuestInfo = {
	title: string;
	status: string;
	difficulty: number;
	members: boolean;
	questPoints: number;
	userEligible: boolean;
};
export type Skills = {
	skillID: number;
	skillName: string;
	skillLevel: number;
	xpAmount: number;
	rank: number;
};

interface PlayerQuest {
	playerQuestInfo: PlayerQuestInfo[];
	setPlayerQuestInfo: (player: PlayerQuestInfo[]) => void;
	title: string;
	setTitle: (qTitle: string) => void;
	qStatus: string;
	setQStatus: (status: string) => void;
	difficulty: number;
	setDifficulty: (difficulty: number) => void;
	members: boolean;
	setMembers: (members: boolean) => void;
	questPoints: number;
	setQuestPoints: (questPoints: number) => void;
	userEligible: boolean;
	setUserEligible: (userEligible: boolean) => void;
	playerReponseOK: boolean;
	grabbedSkills: boolean;
}

export const usePlayerStore = create<PlayerQuest>((set) => ({
	playerQuestInfo: [],
	setPlayerQuestInfo: (QuestInfo) => set({ playerQuestInfo: QuestInfo }),
	title: "",
	setTitle: (qTitle) => set({ title: qTitle }),
	qStatus: "",
	setQStatus: (status) => set({ qStatus: status }),
	difficulty: 0,
	setDifficulty: (difficulty) => set({ difficulty }),
	members: false,
	setMembers: (members) => set({ members }),
	questPoints: 0,
	setQuestPoints: (questPoints) => set({ questPoints }),
	userEligible: false,
	setUserEligible: (userEligible) => set({ userEligible }),
	playerReponseOK: false,
	grabbedSkills: false,
}));
export class PlayerQuests {
	constructor() {
		this.fetchPlayerInfo = this.fetchPlayerInfo.bind(this);
		this.getQTitle = this.getQTitle.bind(this);
		this.getMember = this.getMember.bind(this);
		this.getStatus = this.getStatus.bind(this);
		this.getDifficulty = this.getDifficulty.bind(this);
		this.getQuestPoints = this.getQuestPoints.bind(this);
	}
	private url =
		"https://corsproxy.io/?" +
		encodeURIComponent("https://apps.runescape.com/runemetrics/quests");
	private url2 =
		"https://corsproxy.io/?" +
		encodeURIComponent(
			"https://secure.runescape.com/m=hiscore/index_lite.ws?player="
		);
	//private api_url: string = "https://apps.runescape.com/runemetrics/quests";
	//private api_LocaltoPublicCOR: string = "https://cors-anywhere.herokuapp.com/"; //Disable or Comment out for Production
	//private api_LocaltoPublicCOR: string = "https://raw.githubusercontent.com/";
	//private api_url3: string =
	//g"https://secure.runescape.com/m=hiscore/index_lite.ws?player=";
	public async fetchPlayerInfo(playername: string) {
		let response = await fetch(this.url + `?user=${playername}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch player info: ${response.status}`);
		}

		let data = await response.json();

		// Check if data is an object with 'quests' property
		if (typeof data === "object" && Array.isArray(data.quests)) {
			// Use the 'quests' array directly
			usePlayerStore.getState().setPlayerQuestInfo(data.quests);
		} else {
			console.warn("Unexpected data structure:", data);
			// Handle the unexpected data structure accordingly
		}
	}
	public getQTitle() {
		const usePlayer = usePlayerStore().playerQuestInfo;

		for (let index = 0; index < usePlayer.length; index++) {
			const element = usePlayer[index];
			usePlayerStore.getState().setTitle(element.title);
		}
	}
	public getStatus() {
		const usePlayer = usePlayerStore().playerQuestInfo;

		for (let index = 0; index < usePlayer.length; index++) {
			const element = usePlayer[index];
			usePlayerStore.getState().setQStatus(element.status);
		}
	}
	public getDifficulty() {
		const usePlayer = usePlayerStore().playerQuestInfo;

		for (let index = 0; index < usePlayer.length; index++) {
			const element = usePlayer[index];
			usePlayerStore.getState().setDifficulty(element.difficulty);
		}
	}
	public getMember() {
		const usePlayer = usePlayerStore().playerQuestInfo;

		for (let index = 0; index < usePlayer.length; index++) {
			const element = usePlayer[index];
			usePlayerStore.getState().setMembers(element.members);
		}
	}
	public getQuestPoints() {
		const usePlayer = usePlayerStore().playerQuestInfo;

		for (let index = 0; index < usePlayer.length; index++) {
			const element = usePlayer[index];
			usePlayerStore.getState().setQuestPoints(element.questPoints);
		}
	}
	public getUserEligible() {
		const usePlayer = usePlayerStore().playerQuestInfo;

		for (let index = 0; index < usePlayer.length; index++) {
			const element = usePlayer[index];
			usePlayerStore.getState().setUserEligible(element.userEligible);
		}
	}
	public async fetchPlayerSkills(playername: string): Promise<String[]> {
		try {
			let response = await fetch(this.url2 + `${playername}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch player info: ${response.status}`);
			}

			let data = await response.text();

			const skillNames: string[] = [
				"Total Level",
				"Attack",
				"Defence",
				"Strength",
				"Constitution",
				"Range",
				"Prayer",
				"Magic",
				"Cooking",
				"Woodcutting",
				"Fletching",
				"Fishing",
				"Firemaking",
				"Crafting",
				"Smithing",
				"Mining",
				"Herblore",
				"Agility",
				"Thieving",
				"Slayer",
				"Farming",
				"Runecrafting",
				"Hunter",
				"Construction",
				"Summoning",
				"Dungeoneering",
				"Divination",
				"Invention",
				"Archaeology",
				"Necromancy",
			];
			const limit = 30;
			const parsedSkills: Skills[] = data
				.split("\n")
				.map((line, index) => {
					if (index >= limit) return null; // Skip after reaching the limit
					const [rank, skillLevel, xpAmount] = line.split(",").map(Number);
					const skillName = skillNames[index];
					return { skillLevel, skillName, xpAmount, rank };
				})
				.filter((skill) => skill !== null) as Skills[];
			// Convert the Skills array to an array of strings
			const skillStrings: string[] = parsedSkills.map(
				(skill) => `${skill.skillLevel} ${skill.skillName}`
			);
			window.sessionStorage.setItem("skillLevels", JSON.stringify(skillStrings));
			return skillStrings;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
}
