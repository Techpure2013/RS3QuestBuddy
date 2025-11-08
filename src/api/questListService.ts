import { get, set } from "idb-keyval";
import { QuestListFullCache } from "../state/questList";
const KEY = "quest-list-all-full-v1";

export async function loadQuestListFullCache(): Promise<QuestListFullCache | null> {
	return ((await get(KEY)) as QuestListFullCache | null) ?? null;
}

export async function saveQuestListFullCache(
	cache: QuestListFullCache,
): Promise<void> {
	await set(KEY, cache);
}
