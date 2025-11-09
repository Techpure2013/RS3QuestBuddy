export function getApiBase(): string {
	// In dev: call /api (devServer proxy handles it)
	// In prod: same-origin /api behind NGINX
	return "/api";
}

// If you still want to support explicit base override via window.__APP_CONFIG__:
export function getApiBaseWithOverride(): string {
	const w = window as any;
	if (w.__APP_CONFIG__?.API_BASE) return w.__APP_CONFIG__.API_BASE as string;
	return "/api";
}
const API_BASE = getApiBase();
export async function fetchAllQuestsFull() {
	const r = await fetch(`127.0.0.1:42069/api/quests/all-full`);
	if (!r.ok) throw new Error("all-full failed");
	const json = await r.json();
	return json.items as Array<{
		id: number;
		total_steps: number;
		quest_name: string;
		quest_series: string;
		quest_age: string;
		quest_release_date: string | null;
		quest_points: number;
		quest_rewards: string[];
		created_at: string;
		updated_at: string;
	}>;
}

export async function fetchQuestBundleByName(name: string) {
	const r = await fetch(
		`${getApiBase()}/quests/${encodeURIComponent(name)}/bundle`,
	);
	if (!r.ok) throw new Error("bundle failed");
	return r.json();
}
