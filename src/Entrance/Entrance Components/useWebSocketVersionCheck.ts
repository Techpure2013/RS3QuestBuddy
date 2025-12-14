// src/hooks/useWebSocketVersionCheck.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getApiBase } from "../../api/base";

const FALLBACK_POLL_INTERVAL = 5 * 60 * 1000;

interface VersionUpdateData {
	version: string;
	timestamp: string;
}

interface ToastBroadcastData {
	message: string;
	type: "success" | "error" | "info" | "warning";
	duration?: number;
	timestamp: string;
}

interface OnlineStatsData {
	sockets: number; // live connections (tabs/windows)
	clients: number; // unique clientId count
	timestamp: string;
}

const CLIENT_ID_STORAGE_KEY = "qb_client_id";

const getOrCreateClientId = (): string => {
	const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
	if (existing && existing.trim().length > 0) return existing;

	const generated =
		typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
			? crypto.randomUUID()
			: `qb_${Date.now()}_${Math.random().toString(16).slice(2)}`;

	localStorage.setItem(CLIENT_ID_STORAGE_KEY, generated);
	return generated;
};

export const useWebSocketVersionCheck = (
	onUpdateAvailable?: (newVersion: string) => void,
	onToastBroadcast?: (
		message: string,
		type: "success" | "error" | "info" | "warning",
		duration?: number,
	) => void,
) => {
	const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
	const [lastChecked, setLastChecked] = useState<Date | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [newVersion, setNewVersion] = useState<string | null>(null);

	// NEW: online usage stats
	const [onlineSockets, setOnlineSockets] = useState<number | null>(null);
	const [onlineClients, setOnlineClients] = useState<number | null>(null);
	const [onlineUpdatedAt, setOnlineUpdatedAt] = useState<Date | null>(null);

	const socketRef = useRef<Socket | null>(null);
	const clientVersionRef = useRef<string | null>(null);
	const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isMountedRef = useRef(true);
	const onUpdateAvailableRef = useRef(onUpdateAvailable);
	const onToastBroadcastRef = useRef(onToastBroadcast);

	const toEpochMs = (input: Date | string | null | undefined): number | null => {
		if (!input) return null;
		if (input instanceof Date) return input.getTime();
		const n = Date.parse(input);
		return Number.isFinite(n) ? n : null;
	};

	const checkVersionViaHttp = useCallback(async () => {
		if (!clientVersionRef.current) return;

		try {
			const isDev =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1";
			const apiUrl = isDev ? "http://127.0.0.1:42069/api" : getApiBase();
			const response = await fetch(`${apiUrl}/version`, { cache: "no-cache" });
			if (!response.ok) return;

			const data: { version?: string } = await response.json();
			setLastChecked(new Date());

			if (data.version && clientVersionRef.current === data.version) {
				const notifiedVersion = localStorage.getItem("notified_version");
				if (notifiedVersion) localStorage.removeItem("notified_version");
				return;
			}

			if (data.version && clientVersionRef.current !== data.version) {
				const notifiedVersion = localStorage.getItem("notified_version");
				if (notifiedVersion === data.version) return;

				localStorage.setItem("notified_version", data.version);
				setNewVersion(data.version);
				setIsUpdateAvailable(true);
				onUpdateAvailableRef.current?.(data.version);
			}
		} catch (error) {
			console.error("HTTP version check failed:", error);
		}
	}, []);

	const scheduleFallbackPoll = useCallback(() => {
		if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

		fallbackTimerRef.current = setTimeout(() => {
			if (!isConnected && !isUpdateAvailable) {
				checkVersionViaHttp();
				scheduleFallbackPoll();
			}
		}, FALLBACK_POLL_INTERVAL);
	}, [isConnected, isUpdateAvailable, checkVersionViaHttp]);

	useEffect(() => {
		onUpdateAvailableRef.current = onUpdateAvailable;
	}, [onUpdateAvailable]);

	useEffect(() => {
		onToastBroadcastRef.current = onToastBroadcast;
	}, [onToastBroadcast]);

	useEffect(() => {
		if (socketRef.current) return;

		isMountedRef.current = true;

		try {
			const meta = document.querySelector('meta[name="app-version"]');
			clientVersionRef.current = meta?.getAttribute("content") || null;

			if (!clientVersionRef.current) {
				console.warn("App version meta tag not found.");
				return;
			}

			const api = getApiBase();
			if (!api) {
				console.warn("API base URL not available");
				return;
			}

			const isDev =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1";

			const wsOrigin = isDev ? "http://127.0.0.1:42069" : window.location.origin;

			const clientId = getOrCreateClientId();

			const socket = io(wsOrigin, {
				path: "/socket.io/",
				transports: ["websocket", "polling"],
				reconnection: true,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				reconnectionAttempts: Infinity,

				// NEW: this is what the server uses to count unique clients
				auth: { clientId },
			});

			socketRef.current = socket;

			socket.on("connect", () => {
				if (!isMountedRef.current) return;

				setIsConnected(true);
				socket.emit("version:request");

				if (fallbackTimerRef.current) {
					clearTimeout(fallbackTimerRef.current);
					fallbackTimerRef.current = null;
				}
			});

			socket.on("disconnect", () => {
				if (!isMountedRef.current) return;

				setIsConnected(false);
				scheduleFallbackPoll();
			});

			socket.on("version:current", (data: VersionUpdateData) => {
				if (!isMountedRef.current) return;

				setLastChecked(new Date());

				if (data.version && clientVersionRef.current === data.version) {
					const notifiedVersion = localStorage.getItem("notified_version");
					if (notifiedVersion) localStorage.removeItem("notified_version");
					return;
				}

				if (data.version && clientVersionRef.current !== data.version) {
					const notifiedVersion = localStorage.getItem("notified_version");
					if (notifiedVersion === data.version) return;

					localStorage.setItem("notified_version", data.version);
					setNewVersion(data.version);
					setIsUpdateAvailable(true);
					onUpdateAvailableRef.current?.(data.version);
				}
			});

			socket.on("version:update", (data: VersionUpdateData) => {
				if (!isMountedRef.current) return;

				setLastChecked(new Date());

				if (data.version && clientVersionRef.current === data.version) {
					const notifiedVersion = localStorage.getItem("notified_version");
					if (notifiedVersion) localStorage.removeItem("notified_version");
					return;
				}

				if (data.version && clientVersionRef.current !== data.version) {
					const notifiedVersion = localStorage.getItem("notified_version");
					if (notifiedVersion === data.version) return;

					localStorage.setItem("notified_version", data.version);
					setNewVersion(data.version);
					setIsUpdateAvailable(true);
					onUpdateAvailableRef.current?.(data.version);
				}
			});

			socket.on("toast:broadcast", (data: ToastBroadcastData) => {
				if (!isMountedRef.current) return;
				onToastBroadcastRef.current?.(data.message, data.type, data.duration);
			});

			// NEW: live online stats
			socket.on("usage:online", (data: OnlineStatsData) => {
				if (!isMountedRef.current) return;

				setOnlineSockets(data.sockets);
				setOnlineClients(data.clients);
				const ms = toEpochMs(data.timestamp);
				setOnlineUpdatedAt(ms ? new Date(ms) : new Date());
			});

			socket.on("connect_error", (error: Error) => {
				console.warn("WebSocket connection error:", error.message);
			});

			return () => {
				isMountedRef.current = false;

				if (fallbackTimerRef.current) {
					clearTimeout(fallbackTimerRef.current);
					fallbackTimerRef.current = null;
				}

				socket.removeAllListeners();
				socket.disconnect();
				socketRef.current = null;
			};
		} catch (error) {
			console.error("WebSocket version check initialization failed:", error);
			scheduleFallbackPoll();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		isUpdateAvailable,
		lastChecked,
		isConnected,
		newVersion,
		onlineSockets,
		onlineClients,
		onlineUpdatedAt,
	};
};
