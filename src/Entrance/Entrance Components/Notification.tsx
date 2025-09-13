// src/components/UpdateNotification.tsx
import { Notification, Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

export const UpdateNotification = () => {
	const handleReload = () => {
		// THE FIX: This is the modern, standard-compliant way to force a hard reload.
		// 1. Get the current URL.
		const url = new URL(window.location.href);
		// 2. Add a unique query parameter with the current timestamp.
		url.searchParams.set("reload", Date.now().toString());
		// 3. Set the window's location to this new, unique URL.
		window.location.href = url.toString();
	};

	return (
		<Notification
			icon={<IconRefresh size="1.2rem" />}
			color="teal"
			title="Update Available!"
			withCloseButton={false}
			style={{
				position: "fixed",
				bottom: 20,
				right: 20,
				zIndex: 9999,
			}}
		>
			A new version of Quest Buddy is ready. Please reload to get the latest
			features.
			<Button
				variant="light"
				color="teal"
				fullWidth
				mt="md"
				radius="md"
				onClick={handleReload}
			>
				Reload Now
			</Button>
		</Notification>
	);
};
