export function getApiBase(): string {
	const cfg = window.__APP_CONFIG__;
	if (cfg?.API_BASE) {
		// ensure trailing slash handling is consistent
		return cfg.API_BASE.endsWith("/") ? cfg.API_BASE.slice(0, -1) : cfg.API_BASE;
	}
	return "/api";
}
export function getAppBase(): string {
	// If you set APP_BASE in __APP_CONFIG__ (e.g., "/RS3QuestBuddy/")
	const base =
		(window as any).__APP_CONFIG__?.APP_BASE ??
		(document.querySelector("base") as HTMLBaseElement | null)?.href ??
		"/";
	return base.endsWith("/") ? base : base + "/";
}
