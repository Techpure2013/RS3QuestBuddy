// RS3QuestBuddy app: src/util/plotLinks.ts
type EditorAppConfig = {
	EDITOR_BASE_URL?: string; // e.g. http://127.0.0.1:3000/RS3QuestBuddyEditor
	API_BASE?: string; // fallback if you also inject this here
};

declare global {
	interface Window {
		__APP_CONFIG__?: EditorAppConfig;
	}
}

function normalizeBase(url: string): string {
	if (!url) return "";
	const withSlash = url.endsWith("/") ? url : url + "/";
	return withSlash.replace(/([^:]\/)\/+/g, "$1");
}

function getApiBase(): string {
	const cfg = window.__APP_CONFIG__;
	if (cfg?.API_BASE) return normalizeBase(cfg.API_BASE);
	if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
		return normalizeBase("http://127.0.0.1:42069");
	}
	// production default
	return normalizeBase(`${location.origin}`);
}

export function getEditorBaseUrl(): string {
	const cfg = window.__APP_CONFIG__;
	if (cfg?.EDITOR_BASE_URL) return normalizeBase(cfg.EDITOR_BASE_URL);
	if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
		return normalizeBase("http://127.0.0.1:3000/RS3QuestBuddyEditor");
	}
	return normalizeBase("https://techpure.dev/RS3QuestBuddyEditor");
}

const mem = new Map<string, number>(); // cache quest|step -> stepId

export async function resolveStepId(
	questName: string,
	oneBasedStep: number,
): Promise<number | null> {
	const key = `${questName.toLowerCase()}|${oneBasedStep}`;
	if (mem.has(key)) return mem.get(key)!;

	const base = getApiBase(); // IMPORTANT: includes /api base host
	const qs = new URLSearchParams({
		questName,
		stepNumber: String(oneBasedStep),
	});
	// Use /api/steps/resolve path (server exposes this)
	const res = await fetch(`${base}api/steps/resolve?${qs.toString()}`, {
		method: "GET",
		credentials: "omit",
		cache: "no-store",
		headers: { "Cache-Control": "no-store" },
	});
	if (!res.ok) return null;
	const json = (await res.json()) as { ok: boolean; stepId?: number };
	const id = json.ok && typeof json.stepId === "number" ? json.stepId : null;
	if (id) mem.set(key, id);
	return id;
}

// Build a plot link that may include ?stepId=<id> if resolve succeeds.
// Do not re-append ?stepId at call sites.
export async function buildPlotLinkAsync(
	questName: string,
	stepIndex: number,
): Promise<string> {
	const base = getEditorBaseUrl();
	const oneBased = stepIndex + 1;
	const stepId = await resolveStepId(questName, oneBased).catch(() => null);
	const qp = stepId && stepId > 0 ? `?stepId=${stepId}` : "";
	return `${base}plot/${encodeURIComponent(questName)}/${oneBased}${qp}`;
}

// Synchronous fallback (no stepId)
export function buildPlotLink(questName: string, stepIndex: number): string {
	const base = getEditorBaseUrl();
	return `${base}plot/${encodeURIComponent(questName)}/${stepIndex + 1}`;
}
