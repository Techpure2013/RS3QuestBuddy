import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Mantine global + component styles
import "@mantine/core/styles/global.css";
import "@mantine/core/styles.css";
import "@mantine/core/styles/VisuallyHidden.css";
import "@mantine/core/styles/Flex.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/Radio.css";
import "@mantine/core/styles/Accordion.css";
import "@mantine/core/styles/CloseButton.css";
import "@mantine/core/styles/ColorSwatch.css";
import "@mantine/core/styles/Input.css";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/Button.css";
import "@mantine/core/styles/Loader.css";
import "@mantine/core/styles/Modal.css";
import "@mantine/core/styles/ModalBase.css";
import "@mantine/core/styles/Paper.css";
import "@mantine/core/styles/Popover.css";
import "@mantine/core/styles/ScrollArea.css";
import "@mantine/core/styles/ActionIcon.css";
import "@mantine/carousel/styles.css";

import "./../assets/css/index.css";
import "./../assets/rs3buddyicon.png";
import "./../assets/fonts/RS3Font.woff2";

import { MantineProvider } from "@mantine/core";
import { FontSizeProvider } from "./Entrance Components/FontContextProvider";
import { SocketProvider } from "./Entrance Components/socketContext";

const AltGuard = () => {
	const [override, setOverride] = useState(false);
	const hostname = window.location.hostname;

	useEffect(() => {
		if (window.alt1) {
			const configUrl =
				hostname === "localhost" || hostname === "127.0.0.1"
					? "./appconfig.local.json"
					: "./appconfig.prod.json";

			alt1.identifyAppUrl(configUrl);
		}
	}, [hostname]);

	if (window.alt1 || override) {
		return <App />;
	}

	// Fallback UI when Alt1 isn’t found
	const alt1AddAppUrl =
		hostname === "localhost" || hostname === "127.0.0.1"
			? "alt1://addapp/localhost:3001//appconfig.local.json"
			: "alt1://addapp/https://techpure.dev/RS3QuestBuddy/appconfig.prod.json";

	return (
		<div className="App">
			<h1>ALT1 not found</h1>
			<p>
				<a
					href={`alt1://addapp/${window.location.protocol}//${
						window.location.host
					}/${
						!window.location.host.includes("localhost")
							? "RS3QuestBuddy/" // your production subdirectory (if any)
							: ""
					}appconfig${
						!window.location.host.includes("localhost") ? ".prod" : ".local"
					}.json`}
				>
					<button className="Alt1button">Click here to add this to Alt1</button>
				</a>
			</p>

			<button className="Alt1button" onClick={() => setOverride(true)}>
				Continue to RS3 Quest Buddy Web (No Alt1)
			</button>
		</div>
	);
};

// Base HTML font size + render
document.querySelector("html")!.style.fontSize = "16px";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<SocketProvider>
		<MantineProvider defaultColorScheme="dark">
			<FontSizeProvider>
				<AltGuard />
			</FontSizeProvider>
		</MantineProvider>
	</SocketProvider>,
);
