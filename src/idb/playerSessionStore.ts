// src/idb/playerSessionStore.ts
import type { PlayerQuestStatus, Skills } from "./../state/types";
import type { EnrichedQuest } from "./../state/playerModel";
export type PlayerSession = {
	playerName: string;
	hasCompleted?: PlayerQuestStatus[];
	remainingQuest?: PlayerQuestStatus[];
	skillLevels?: Skills | null; // if you want to persist skills
	enrichedQuests?: EnrichedQuest[];
	isSorted?: boolean;
	updatedAt: string;
};

const DB_NAME = "RS3QB_IDB";
const DB_VERSION = 2;
const STORE = "player_session";
const KEY = "active";

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			// Create both stores safely
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE);
			}
			if (!db.objectStoreNames.contains("quest_list")) {
				db.createObjectStore("quest_list");
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function savePlayerSession(data: PlayerSession) {
	const db = await openDB();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(data, KEY);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}

export async function loadPlayerSession(): Promise<PlayerSession | null> {
	const db = await openDB();
	const res = await new Promise<PlayerSession | null>((resolve, reject) => {
		const tx = db.transaction(STORE, "readonly");
		const req = tx.objectStore(STORE).get(KEY);
		req.onsuccess = () => resolve((req.result as PlayerSession) ?? null);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return res;
}

export async function clearPlayerSession() {
	const db = await openDB();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).delete(KEY);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
export async function writeSession(patch: Partial<PlayerSession>) {
	const current = (await loadPlayerSession()) as PlayerSession | null;
	const merged: PlayerSession = {
		playerName: current?.playerName ?? "",
		hasCompleted: current?.hasCompleted ?? [],
		remainingQuest: current?.remainingQuest ?? [],
		enrichedQuests: current?.enrichedQuests ?? [],
		skillLevels: current?.skillLevels ?? null,
		isSorted: current?.isSorted, // keep existing flag
		updatedAt: new Date().toISOString(),
		...patch, // override only what you intend to change
	};
	await savePlayerSession(merged);
}
