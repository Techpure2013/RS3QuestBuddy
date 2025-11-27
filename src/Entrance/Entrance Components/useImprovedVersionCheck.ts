// src/hooks/useImprovedVersionCheck.ts
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Improved version checking with:
 * - Visibility API (only check when tab is visible)
 * - Exponential backoff (start fast, slow down over time)
 * - Manual check capability
 * - Efficient network requests
 */

const INITIAL_INTERVAL = 30 * 1000; // 30 seconds
const MAX_INTERVAL = 5 * 60 * 1000; // 5 minutes
const BACKOFF_MULTIPLIER = 1.5;

export const useImprovedVersionCheck = () => {
	const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
	const [lastChecked, setLastChecked] = useState<Date | null>(null);
	const [isChecking, setIsChecking] = useState(false);

	const clientVersionRef = useRef<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const currentIntervalDuration = useRef(INITIAL_INTERVAL);
	const checkCountRef = useRef(0);

	const checkForUpdate = useCallback(async (): Promise<boolean> => {
		// Get client version on first check
		if (!clientVersionRef.current) {
			const meta = document.querySelector('meta[name="app-version"]');
			clientVersionRef.current = meta?.getAttribute("content") || null;

			if (!clientVersionRef.current) {
				console.warn("App version meta tag not found.");
				return false;
			}
		}

		setIsChecking(true);
		checkCountRef.current += 1;

		try {
			// Use cache-busting but with ETag support
			const response = await fetch("/version.json", {
				cache: "no-cache",
				headers: {
					"Cache-Control": "no-cache",
				},
			});

			if (!response.ok) {
				console.warn("Failed to fetch version.json:", response.status);
				return false;
			}

			const serverInfo = await response.json();
			const serverVersion = serverInfo.version;
			setLastChecked(new Date());

			if (serverVersion && clientVersionRef.current !== serverVersion) {
				console.log(
					`New version available! Client: ${clientVersionRef.current}, Server: ${serverVersion}`
				);
				setIsUpdateAvailable(true);
				return true;
			}

			return false;
		} catch (error) {
			console.error("Failed to check for new version:", error);
			return false;
		} finally {
			setIsChecking(false);
		}
	}, []);

	const scheduleNextCheck = useCallback(() => {
		// Clear existing interval
		if (intervalRef.current) {
			clearTimeout(intervalRef.current);
		}

		// Calculate next interval with exponential backoff
		const nextInterval = Math.min(
			currentIntervalDuration.current * BACKOFF_MULTIPLIER,
			MAX_INTERVAL
		);
		currentIntervalDuration.current = nextInterval;

		intervalRef.current = setTimeout(async () => {
			const updateFound = await checkForUpdate();
			if (!updateFound) {
				scheduleNextCheck();
			}
			// If update found, stop scheduling
		}, currentIntervalDuration.current);
	}, [checkForUpdate]);

	const handleVisibilityChange = useCallback(() => {
		if (document.hidden) {
			// Page is hidden, pause checking
			if (intervalRef.current) {
				clearTimeout(intervalRef.current);
				intervalRef.current = null;
			}
		} else {
			// Page is visible, check immediately and resume schedule
			if (!isUpdateAvailable) {
				currentIntervalDuration.current = INITIAL_INTERVAL; // Reset to fast check
				checkForUpdate().then((updateFound) => {
					if (!updateFound) {
						scheduleNextCheck();
					}
				});
			}
		}
	}, [isUpdateAvailable, checkForUpdate, scheduleNextCheck]);

	// Manual refresh trigger
	const manualCheck = useCallback(async () => {
		currentIntervalDuration.current = INITIAL_INTERVAL; // Reset backoff
		const updateFound = await checkForUpdate();
		if (!updateFound) {
			scheduleNextCheck();
		}
		return updateFound;
	}, [checkForUpdate, scheduleNextCheck]);

	useEffect(() => {
		// Initial check
		checkForUpdate().then((updateFound) => {
			if (!updateFound) {
				scheduleNextCheck();
			}
		});

		// Listen for visibility changes
		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Cleanup
		return () => {
			if (intervalRef.current) {
				clearTimeout(intervalRef.current);
			}
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [checkForUpdate, scheduleNextCheck, handleVisibilityChange]);

	return {
		isUpdateAvailable,
		lastChecked,
		isChecking,
		checkCount: checkCountRef.current,
		manualCheck,
	};
};
