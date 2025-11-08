import { useCallback, useMemo, useRef, useState } from "react";
import { getApiBase } from "./../api/base";
import { parsePlayerStats, type Skills } from "./PlayerStatsSort";
import {
	loadPlayerSession,
	writeSession,
	type PlayerSession,
} from "./../idb/playerSessionStore";

// Reuse your PlayerQuestStatus from your sorted hook
export type PlayerQuestStatus = {
	title: string;
	status: "COMPLETED" | "NOT_STARTED" | "STARTED";
	difficulty: number;
	questPoints: number;
	userEligible: boolean;
};

type RunemetricsResponse = { quests?: PlayerQuestStatus[]; error?: string };

export function usePlayer() {
	const [name, setName] = useState<string>("");
	const [skills, setSkills] = useState<Skills | null>(null);
	const [quests, setQuests] = useState<PlayerQuestStatus[]>([]);
	const [loading, setLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	const api = getApiBase();

	const fetchPlayer = useCallback(
		async (playerName: string): Promise<boolean> => {
			if (!playerName?.trim()) return false;

			// abort in-flight
			abortRef.current?.abort();
			const ctrl = new AbortController();
			abortRef.current = ctrl;

			setLoading(true);
			setName(playerName);

			try {
				// Parallel fetch hiscores (text) + runemetrics (json)
				const [hiscoresRes, rmRes] = await Promise.all([
					fetch(`${api}/hiscores?player=${encodeURIComponent(playerName)}`, {
						signal: ctrl.signal,
						credentials: "same-origin",
					}),
					fetch(`${api}/runemetrics/quests?user=${encodeURIComponent(playerName)}`, {
						signal: ctrl.signal,
						credentials: "same-origin",
					}),
				]);

				// Hiscores
				let parsedSkills: Skills | null = null;
				if (hiscoresRes.ok) {
					const text = await hiscoresRes.text();
					parsedSkills = parsePlayerStats(text);
				} else {
					console.warn("Hiscores upstream error:", hiscoresRes.status);
				}

				// Runemetrics
				let rmQuests: PlayerQuestStatus[] = [];
				if (rmRes.ok) {
					const json = (await rmRes.json()) as RunemetricsResponse;
					if (!json.error && Array.isArray(json.quests)) {
						rmQuests = json.quests;
					} else {
						console.warn("Runemetrics error:", json.error);
					}
				} else {
					console.warn("Runemetrics upstream error:", rmRes.status);
				}

				setSkills(parsedSkills);
				setQuests(rmQuests);

				// Persist to IDB (unify the "active" player session)
				try {
					const current = (await loadPlayerSession()) as PlayerSession | null;

					const session: PlayerSession = {
						playerName: playerName,
						hasCompleted:
							current?.hasCompleted ??
							rmQuests.filter((q) => q.status === "COMPLETED"),
						remainingQuest:
							current?.remainingQuest ??
							rmQuests.filter((q) => q.status !== "COMPLETED"),
						skillLevels: parsedSkills ?? current?.skillLevels ?? null,
						enrichedQuests: current?.enrichedQuests ?? [], // your other computed view if needed
						updatedAt: new Date().toISOString(),
					};
					await writeSession(session);
				} catch (e) {
					console.warn("Failed to save player session to IDB:", e);
				}

				setLoading(false);
				return parsedSkills !== null || rmQuests.length > 0;
			} catch (err) {
				if ((err as any).name === "AbortError") {
					// silent on abort
				} else {
					console.error("Failed to fetch player data:", err);
				}
				setSkills(null);
				setQuests([]);
				setLoading(false);
				return false;
			}
		},
		[api],
	);

	const resetPlayer = useCallback(async () => {
		// For "New Player" workflow: clear only here
		try {
			// Optional: call clearPlayerSession() if you want to wipe IDB
			// await clearPlayerSession();
			setName("");
			setSkills(null);
			setQuests([]);
		} catch {}
	}, []);

	const completed = useMemo(
		() => quests.filter((q) => q.status === "COMPLETED"),
		[quests],
	);
	const remaining = useMemo(
		() => quests.filter((q) => q.status !== "COMPLETED"),
		[quests],
	);

	return {
		name,
		skills,
		quests,
		completed,
		remaining,
		loading,
		fetchPlayer,
		resetPlayer,
	};
}
