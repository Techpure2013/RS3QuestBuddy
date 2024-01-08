interface RawResponse {
	error?: string;
	quests?: Quest[];
}

interface Quest {
	title: string;
	status: string;
	difficulty: number;
	members: boolean;
	quest_points: number;
	user_eligible: boolean;
}

export class PlayerQuests {
	private api_url: string = "https://apps.runescape.com/runemetrics/quests";

	static async main(): Promise<void> {
		const args: string[] = process.argv.slice(2);
		const res = await new PlayerQuests().run(args[0]);
		console.log(res);
	}

	async get(rsn: string): Promise<RawResponse> {
		const sanitized_rsn: string = rsn.replace(/ /g, "_");

		const response = await fetch(`${this.api_url}?user=${sanitized_rsn}`);
		console.log(response);
		if (!response.ok) {
			this.handleErrorResponse(response.status);
		}

		return response.json();
	}

	async run(rsn: string): Promise<{ [key: string]: Quest }> {
		const rawResponse: RawResponse = await this.get(rsn);

		if (rawResponse.error) {
			await this.onResponseError(rawResponse);
		}

		return await this.onResponseSuccess(rawResponse);
	}

	private handleErrorResponse(status: number): never {
		switch (status) {
			case 404:
				throw new Error(`Page not found: ${this.api_url}`);
			case 405:
				throw new Error(`Method not allowed: ${this.api_url}`);
			case 500:
				throw new Error(`Internal server error: ${this.api_url}`);
			default:
				throw new Error(`Unexpected response status: ${status}`);
		}
	}

	private async onResponseError(rawResponse: RawResponse): Promise<void> {
		const error: string = rawResponse.error || "";
		throw new Error(
			`Player quests cannot be retrieved: ${
				error.charAt(0).toUpperCase() + error.slice(1)
			}`
		);
	}

	private async onResponseSuccess(
		rawResponse: RawResponse
	): Promise<{ [key: string]: Quest }> {
		const res: { [key: string]: Quest } = {};

		for (const quest of rawResponse.quests || []) {
			res[quest.title] = {
				title: quest.title,
				status: quest.status.toLowerCase(),
				difficulty: quest.difficulty,
				members: quest.members,
				quest_points: quest.quest_points,
				user_eligible: quest.user_eligible,
			};
		}

		return res;
	}
}

(async () => {
	await PlayerQuests.main();
})();
