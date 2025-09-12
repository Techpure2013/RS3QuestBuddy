// src/hooks/useVersionCheck.ts
import { useState, useEffect } from "react";

// Check every 5 minutes
const POLLING_INTERVAL = 5 * 60 * 1000;

export const useVersionCheck = () => {
	const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

	useEffect(() => {
		// 1. Get the current version from the HTML meta tag
		const meta = document.querySelector('meta[name="app-version"]');
		const clientVersion = meta?.getAttribute("content");

		if (!clientVersion) {
			console.warn("App version meta tag not found.");
			return;
		}

		// 2. Set up an interval to periodically check for updates
		const intervalId = setInterval(() => {
			// 3. Fetch the server's version.json file
			fetch("/version.json", { cache: "no-cache" })
				.then((response) => response.json())
				.then((serverInfo) => {
					const serverVersion = serverInfo.version;

					// 4. Compare versions and update state if they differ
					if (serverVersion && clientVersion !== serverVersion) {
						console.log("New version available! Reload to update.");
						setIsUpdateAvailable(true);
						clearInterval(intervalId); // Stop checking once an update is found
					}
				})
				.catch((error) => {
					console.error("Failed to check for new version:", error);
				});
		}, POLLING_INTERVAL);

		// 5. Cleanup function to clear the interval when the component unmounts
		return () => clearInterval(intervalId);
	}, []);

	return { isUpdateAvailable };
};
