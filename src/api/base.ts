export function getAppBase(): string {
	// If you set APP_BASE in __APP_CONFIG__ (e.g., "/RS3QuestBuddy/")
	const base =
		(window as any).__APP_CONFIG__?.APP_BASE ??
		(document.querySelector("base") as HTMLBaseElement | null)?.href ??
		"/";
	return base.endsWith("/") ? base : base + "/";
}
export function getApiBase(): string {
	// In dev: call /api (devServer proxy handles it)
	// In prod: same-origin /api behind NGINX
	return "/api";
}
