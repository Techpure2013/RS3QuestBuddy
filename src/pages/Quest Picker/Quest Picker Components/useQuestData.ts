import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { usePlayer } from "./../../../Fetchers/usePlayer";
import { useSortedPlayerQuests } from "./../../../Fetchers/sortPlayerQuests";

import {
	writeSession,
	loadPlayerSession,
	clearPlayerSession,
	type PlayerSession,
} from "./../../../idb/playerSessionStore";

import {
	saveQuestListAll,
	loadQuestListAll,
	type QuestListItem,
} from "./../../../idb/questListStore";

import type {
	PlayerQuestStatus,
	QuestAge,
	QuestSeries,
	Skills,
} from "./../../../state/types";

/* =====================
   Types
   ===================== */

export type QuestListItemDto = {
	id: number;
	quest_name: string;
	quest_series: QuestSeries;
	quest_age: QuestAge;
	quest_release_date: string | null;
	quest_points: number;
	quest_rewards: string[];
	created_at: string;
	updated_at: string;
};

export type QuestList = QuestListItem[];

export type EnrichedQuest = {
	questName: string;
	questAge: QuestAge;
	series: QuestSeries;
	releaseDate: string;
	title: string;
	status: "COMPLETED" | "NOT_STARTED" | "STARTED";
	difficulty: number;
	questPoints: number;
	userEligible: boolean;
	rewards: string[];
};

function getApiBase(): string {
	const cfg = window.__APP_CONFIG__;
	if (cfg?.API_BASE) {
		return cfg.API_BASE.endsWith("/") ? cfg.API_BASE.slice(0, -1) : cfg.API_BASE;
	}
	return "/api";
}

type AllFullResponse = {
	items: QuestListItemDto[];
	updatedAt?: string;
};

async function fetchAllQuestsFullRaw(): Promise<AllFullResponse> {
	const r = await fetch(`${getApiBase()}/quests/all-full`, {
		credentials: "same-origin",
	});
	if (!r.ok) throw new Error("all-full failed");
	return r.json();
}

function mapDtoToQuestList(items: QuestListItemDto[]): QuestList {
	return items.map((i) => ({
		questName: i.quest_name,
		questAge: i.quest_age,
		series: i.quest_series,
		releaseDate: i.quest_release_date ?? "",
		questPoints: String(i.quest_points ?? 0),
		rewards: Array.isArray(i.quest_rewards) ? i.quest_rewards : [],
	}));
}

/* =====================
   Hook
   ===================== */

export function useQuestData() {
	// Quest list (IDB first -> refresh)
	const [questState, setQuestState] = useState<{
		list: QuestList | null;
		updatedAt?: string;
	}>({
		list: null,
		updatedAt: undefined,
	});
	const questList = questState.list;
	const cachedSkillsRef = useRef<Skills | null>(null);

	// Player session (IDB + memory)
	const [playerName, setPlayerName] = useState<string>("");
	const [isSorted, setIsSorted] = useState<boolean>(false);
	const [playerFound, setPlayerFound] = useState<boolean>(false);
	const [hydratedEnriched, setHydratedEnriched] = useState<
		EnrichedQuest[] | null
	>(null);
	const setSortState = (sorted: boolean) => setIsSorted(sorted);
	// Consolidated player fetch (skills + quests via /api)
	const { skills, quests, loading, fetchPlayer, resetPlayer } = usePlayer();
	const skillLevels = skills ?? cachedSkillsRef.current ?? null;
	// Sorting on runemetrics quests
	const {
		alteredQuestData,
		totalQuestPoints,
		sortPlayerQuests,
		completedPlayerQuests,
	} = useSortedPlayerQuests();

	// Global loading = consolidated loading
	const isLoading = loading;

	/* Load quest list: IDB fast, then refresh */
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				// 1) IDB
				const cached = await loadQuestListAll();
				if (!cancelled && cached?.items?.length) {
					setQuestState((prev) => {
						if (prev.updatedAt === cached.updatedAt) return prev;
						return { list: cached.items, updatedAt: cached.updatedAt };
					});
				}

				// 2) API
				const freshResp = await fetchAllQuestsFullRaw();
				const fresh = mapDtoToQuestList(freshResp.items);
				const freshUpdated = freshResp.updatedAt ?? new Date().toISOString();

				if (!cancelled) {
					setQuestState((prev) => {
						const sameVersion = prev.updatedAt === freshUpdated;
						const sameLen = prev.list?.length === fresh.length;
						const sameNames =
							sameLen &&
							prev.list!.every((v, i) => v.questName === fresh[i].questName);
						if (sameVersion && sameNames) return prev;
						return { list: fresh, updatedAt: freshUpdated };
					});
					await saveQuestListAll({ items: fresh, updatedAt: freshUpdated });
				}
			} catch (e) {
				console.error("Failed to load/refresh quest list:", e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	/* Hydrate active player session from IDB*/
	useEffect(() => {
		(async () => {
			try {
				const session = await loadPlayerSession();
				if (session?.playerName) {
					setPlayerName(session.playerName);
					setPlayerFound(true);

					// 1) restore user’s sort choice
					if (typeof session.isSorted === "boolean") {
						setIsSorted(session.isSorted);
					} else {
						setIsSorted(false);
					}

					// in hydration effect (your snippet), after you load session:
					if (session?.skillLevels) {
						cachedSkillsRef.current = session.skillLevels; // keep cached skills
					}
					// 2) instant rebuild: merge cached remaining + completed into raw quests
					const cachedRaw: PlayerQuestStatus[] = [
						...(Array.isArray(session.remainingQuest) ? session.remainingQuest : []),
						...(Array.isArray(session.hasCompleted) ? session.hasCompleted : []),
					];
					if (cachedRaw.length > 0) {
						sortPlayerQuests(cachedRaw); // fills alteredQuestData quickly
					}

					// 3) optional immediate display fallback (do NOT force sort)
					if (
						Array.isArray(session.enrichedQuests) &&
						session.enrichedQuests.length > 0
					) {
						setHydratedEnriched(session.enrichedQuests as EnrichedQuest[]);
					}
				} else {
					setPlayerFound(false);
				}
			} catch (e) {
				console.error("Failed to load player session from IDB:", e);
				setPlayerFound(false);
			}
		})();
	}, [sortPlayerQuests]);

	/* Sort whenever consolidated quests change */
	useEffect(() => {
		if (quests?.length) {
			sortPlayerQuests(quests);
		} else {
			sortPlayerQuests(null);
		}
	}, [quests, sortPlayerQuests]);

	/* Base enrichment (no player) */
	const baseEnrichedQuests: EnrichedQuest[] = useMemo(() => {
		if (!questList) return [];
		return questList.map((q) => ({
			questName: q.questName,
			questAge: q.questAge as QuestAge,
			series: q.series as QuestSeries,
			releaseDate: q.releaseDate ?? "",
			title: q.questName,
			status: "NOT_STARTED" as const,
			difficulty: 0,
			userEligible: false,
			questPoints: Number.parseInt(q.questPoints, 10) || 0,
			rewards: Array.isArray(q.rewards) ? q.rewards : [],
		}));
	}, [questList]);

	/* Player enrichment (after sort hook) */
	const playerEnrichedQuests = useMemo(() => {
		if (!questList || !alteredQuestData?.length) return [];
		const map = new Map(questList.map((q) => [q.questName, q]));
		const merged = alteredQuestData
			.map((pq) => {
				const base = map.get(pq.title);
				if (!base) return null;
				return {
					...base,
					...pq,
					title: base.questName,
					questPoints: parseInt(base.questPoints, 10) || 0,
					rewards: Array.isArray(base.rewards) ? base.rewards : [],
				} as EnrichedQuest;
			})
			.filter(Boolean) as EnrichedQuest[];

		return merged;
	}, [questList, alteredQuestData]);
	console.log("useQuestData skills", skills);
	/* Remaining (eligible + not completed) when sorted */
	const remainingEligible = useMemo(() => {
		return playerEnrichedQuests.filter(
			(q) =>
				q.userEligible && (q.status === "NOT_STARTED" || q.status === "STARTED"),
		);
	}, [playerEnrichedQuests]);
	const remainingAll = useMemo(() => {
		return playerEnrichedQuests.filter((q) => q.status !== "COMPLETED");
	}, [playerEnrichedQuests]);
	const remainingQuests: EnrichedQuest[] =
		remainingEligible.length > 0 ? remainingEligible : remainingAll;

	/* Prefer hydrated enriched if present and we haven't recomputed yet */
	const preferHydrated =
		hydratedEnriched?.length &&
		playerFound &&
		alteredQuestData.length === 0 &&
		!isSorted;

	/* Display enrichment */
	const displayQuests: EnrichedQuest[] = useMemo(() => {
		if (preferHydrated) return hydratedEnriched!;
		return isSorted && playerFound ? remainingQuests : baseEnrichedQuests;
	}, [
		preferHydrated,
		hydratedEnriched,
		isSorted,
		playerFound,
		remainingQuests,
		baseEnrichedQuests,
	]);
	/* Search and persist to IDB */
	const searchForPlayer = useCallback(
		async (name: string) => {
			if (isLoading) return;
			const trimmed = name.trim();
			if (!trimmed) return;

			const ok = await fetchPlayer(trimmed); // sets quests + skills in usePlayer
			if (ok) {
				setPlayerName(trimmed);
				setPlayerFound(true);
				// Do not save here; wait for the persist effect (below)
			} else {
				setPlayerFound(false);
				try {
					await clearPlayerSession(); // only wipe on failed searches
				} catch {}
			}
		},
		[isLoading, fetchPlayer],
	);

	/* Persist enriched view + completed/remaining to IDB; only on real changes */
	const lastSavedRef = useRef<{
		completedLen: number;
		remainingLen: number;
		enrichedLen: number;
		hadSkills: boolean;
	} | null>(null);
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const current = await loadPlayerSession();
				if (cancelled) return;

				// Build a minimal base if we don't have a session yet
				const base: PlayerSession = current ?? {
					playerName: playerName || "",
					hasCompleted: [],
					remainingQuest: [],
					enrichedQuests: [],
					skillLevels: null,
					updatedAt: new Date().toISOString(),
				};

				if (base.isSorted === isSorted) {
					return;
				}

				await writeSession({
					...base,
					isSorted,
					updatedAt: new Date().toISOString(),
				});
			} catch (e) {
				console.error("Failed to persist isSorted:", e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isSorted, playerName]);
	useEffect(() => {
		(async () => {
			if (!playerFound || !playerName) return;

			const enriched = isSorted ? remainingQuests : playerEnrichedQuests;

			const haveSkills = !!skills;
			const completedNow = completedPlayerQuests ?? [];
			const haveCompleted = completedNow.length > 0;
			const haveRemaining = remainingQuests.length > 0;
			const haveEnriched = enriched.length > 0;

			// If nothing useful yet, and there's already a session, do not overwrite
			if (!haveSkills && !haveCompleted && !haveRemaining && !haveEnriched) {
				return;
			}

			// Avoid redundant saves: compare lengths + skills presence
			const sig = {
				completedLen: completedNow.length,
				remainingLen: remainingQuests.length,
				enrichedLen: enriched.length,
				hadSkills: haveSkills,
			};
			if (
				lastSavedRef.current &&
				lastSavedRef.current.completedLen === sig.completedLen &&
				lastSavedRef.current.remainingLen === sig.remainingLen &&
				lastSavedRef.current.enrichedLen === sig.enrichedLen &&
				lastSavedRef.current.hadSkills === sig.hadSkills
			) {
				return;
			}
			lastSavedRef.current = sig;

			// Merge with existing session to avoid wiping non-empty fields with empty
			const current = (await loadPlayerSession()) as PlayerSession | null;

			const session: PlayerSession = {
				playerName,
				hasCompleted: haveCompleted ? completedNow : (current?.hasCompleted ?? []),
				remainingQuest: haveRemaining
					? remainingQuests
					: (current?.remainingQuest ?? []),
				enrichedQuests: haveEnriched ? enriched : (current?.enrichedQuests ?? []),
				skillLevels: haveSkills ? skills! : (current?.skillLevels ?? null),
				updatedAt: new Date().toISOString(),
			};

			try {
				await writeSession(session);
			} catch (e) {
				console.error("Failed to save player session:", e);
			}
		})();
	}, [
		playerFound,
		playerName,
		isSorted,
		skills,
		remainingQuests,
		playerEnrichedQuests,
		completedPlayerQuests,
	]);

	const clearPlayerSearch = useCallback(() => {
		(async () => {
			try {
				await clearPlayerSession();
			} catch {}
			setPlayerName("");
			setIsSorted(false);
			setPlayerFound(false);
			setHydratedEnriched(null);
			sortPlayerQuests(null);
			resetPlayer();
		})();
	}, [sortPlayerQuests, resetPlayer]);

	return {
		questList,
		playerName,
		playerFound,
		isSorted,
		isLoading,
		questPoints: totalQuestPoints,
		displayQuests,
		remainingQuestsCount: remainingQuests.length,
		skillLevels: skillLevels,
		completedQuests: completedPlayerQuests ?? [],
		searchForPlayer,
		clearPlayerSearch,
		setSortState,
	};
}
