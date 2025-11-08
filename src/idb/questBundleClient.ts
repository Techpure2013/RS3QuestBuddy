import { bundleToQuest, type Quest, type QuestBundle } from "./../state/types";

const cache = new Map<string, Quest>(); // key: questName (trimmed)

function getApiBase(): string {
	const override = (window as any).__APP_CONFIG__?.API_BASE;
	return override ?? "/api";
}

export function getCachedQuest(name: string): Quest | null {
	const key = name.trim();
	return cache.get(key) ?? null;
}

export function setCachedQuest(name: string, quest: Quest) {
	cache.set(name.trim(), quest);
}

export async function fetchQuestBundleNormalized(name: string): Promise<Quest> {
	const key = name.trim();
	const hit = cache.get(key);
	if (hit) return hit;

	const res = await fetch(
		`${getApiBase()}/quests/${encodeURIComponent(key)}/bundle`,
		{ credentials: "same-origin" },
	);
	if (!res.ok) {
		throw new Error(`bundle fetch failed: ${res.status} ${res.statusText}`);
	}
	const bundle = (await res.json()) as QuestBundle;
	const quest = bundleToQuest(bundle);
	cache.set(key, quest);
	return quest;
}
