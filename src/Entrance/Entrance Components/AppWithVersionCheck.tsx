// src/Entrance/Entrance Components/AppWithVersionCheck.tsx
import { useWebSocketVersionCheck } from "./useWebSocketVersionCheck";
import { useToast } from "../../Components/Toast/useToast";
import { UpdateNotification } from "./UpdateNotification";
import { useCallback, useRef } from "react";

interface AppWithVersionCheckProps {
	children: React.ReactNode;
}

export const AppWithVersionCheck: React.FC<AppWithVersionCheckProps> = ({
	children,
}) => {
	const toast = useToast();
	const hasNotifiedRef = useRef(false);

	const handleUpdateAvailable = useCallback(
		(newVersion: string) => {
			if (!hasNotifiedRef.current) {
				toast.info(
					`New version ${newVersion} is available! Please reload to update.`,
					10000,
				);
				hasNotifiedRef.current = true;
			}
		},
		[toast],
	);

	const handleToastBroadcast = useCallback(
		(
			message: string,
			type: "success" | "error" | "info" | "warning",
			duration?: number,
		) => {
			toast[type](message, duration);
		},
		[toast],
	);

	const versionCheckResult = useWebSocketVersionCheck(
		handleUpdateAvailable,
		handleToastBroadcast,
	);
	const { isUpdateAvailable = false, isConnected = false } =
		versionCheckResult || {};

	return (
		<>
			{isUpdateAvailable && <UpdateNotification />}
			{children}
			{/* Optional: Show connection status in development */}
			{typeof process !== "undefined" &&
				process.env?.NODE_ENV === "development" && (
					<div
						style={{
							position: "fixed",
							bottom: "5px",
							left: "5px",
							fontSize: "10px",
							color: isConnected ? "green" : "orange",
							zIndex: 10000,
						}}
					>
						WS: {isConnected ? "●" : "○"}
					</div>
				)}
		</>
	);
};
