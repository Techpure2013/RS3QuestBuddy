function getApiBase(): string {
  const host = window.location.hostname;

  // Local dev: hit dev API or rely on webpack devServer proxy
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://127.0.0.1:42069"; // or just return "" and prefix fetch with /api
  }

  // Prod: always go through /api behind NGINX
  const base = (window as any).__APP_CONFIG__?.API_BASE;
  if (base) return base; // optional runtime override
  return `${window.location.origin}/api`;
}
const API_BASE = getApiBase();

export type NpcSearchResult = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  floor: number;
};

/**
 * Case-insensitive search is handled server-side via lower(name) like %term%.
 * Minimum length: enforce in UI; server also enforces >= 2 chars.
 */
export async function searchNpcs(
  name: string,
  limit = 15
): Promise<NpcSearchResult[]> {
  const params = new URLSearchParams({ name, limit: String(limit) });
  console.log(API_BASE);
  const res = await fetch(`${API_BASE}/npcs/search?${params.toString()}`);

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(
      msg || `NPC search failed: ${res.status} ${res.statusText}`
    );
  }
  return (await res.json()) as NpcSearchResult[];
}

/**
 * Append a new location to an NPC. Server de-duplicates exact lat/lng/floor.
 */
export async function addNpcLocation(
  id: number,
  coord: { lat: number; lng: number; floor?: number }
): Promise<{
  success: true;
  locations: Array<{ lat: number; lng: number; floor: number }>;
}> {
  const res = await fetch(`${API_BASE}/npcs/${id}/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(coord),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Add NPC location failed: ${res.statusText}`);
  }
  return res.json();
}
