// src/idb/questListStore.ts
export type QuestListItem = {
	questName: string;
	questAge: string;
	series: string;
	releaseDate: string;
	questPoints: string;
	rewards: string[];
};

export type QuestListCache = {
	items: QuestListItem[];
	updatedAt: string; // ISO string
};

const DB_NAME = "RS3QB_IDB";
const DB_VERSION = 2;
const STORE = "quest_list";
const KEY = "all";

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			// Create both stores safely
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE);
			}
			if (!db.objectStoreNames.contains("player_session")) {
				db.createObjectStore("player_session");
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function saveQuestListAll(cache: QuestListCache) {
	const db = await openDB();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(cache, KEY);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}

export async function loadQuestListAll(): Promise<QuestListCache | null> {
	const db = await openDB();
	const res = await new Promise<QuestListCache | null>((resolve, reject) => {
		const tx = db.transaction(STORE, "readonly");
		const req = tx.objectStore(STORE).get(KEY);
		req.onsuccess = () => resolve((req.result as QuestListCache) ?? null);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return res;
}
