// src/components/UpdateNotification.tsx
import { Notification, Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

export const UpdateNotification = () => {
	const handleReload = () => {
		const { origin, pathname } = window.location;
		const baseUrl = `${origin}${pathname}`;
		const newUrl = `${baseUrl}?reload=${Date.now()}`;
		window.location.href = newUrl;
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
