// RS3QuestBuddy app: src/utils/editorLinks.ts
type EditorAppConfig = {
	EDITOR_BASE_URL?: string; // e.g. http://127.0.0.1:3000/RS3QuestBuddyEditor
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

export function getEditorBaseUrl(): string {
	// 1) Prefer injected config from your index.html
	const cfg = window.__APP_CONFIG__;
	if (cfg?.EDITOR_BASE_URL) return normalizeBase(cfg.EDITOR_BASE_URL);

	// 2) Fallbacks: dev vs prod
	if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
		// Dev default where the editor runs
		return normalizeBase("http://127.0.0.1:3000/RS3QuestBuddyEditor");
	}

	// Prod default on your domain (adjust if needed)
	return normalizeBase("https://techpure.dev/RS3QuestBuddyEditor");
}

export function buildPlotLink(questName: string, stepIndex: number): string {
	const base = getEditorBaseUrl();
	return `${base}plot/${encodeURIComponent(questName)}/${stepIndex + 1}`;
}
export {};
