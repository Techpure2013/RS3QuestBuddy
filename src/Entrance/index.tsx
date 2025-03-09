import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 1. Global Mantine styles
import "@mantine/core/styles/global.css";

// 2. Base Mantine styles (core components shared across others)
import "@mantine/core/styles.css";
import "@mantine/core/styles/VisuallyHidden.css";

// 3. Layout-related styles (for structural components)
import "@mantine/core/styles/Flex.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/Radio.css";
// 4. Component-specific styles (alphabetical or logical order for clarity)
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
// 5. External Mantine modules
import "@mantine/carousel/styles.css";
import "./../assets/css/index.css";
import { FontSizeProvider } from "./Entrance Components/FontContextProvider";
import "./../assets/rs3buddyicon.png";
import "./../assets/fonts/RS3Font.woff2";
import { MantineProvider } from "@mantine/core";
import { SocketProvider } from "./Entrance Components/socketContext";
const AltGuard = () => {
	const [override, setOverride] = useState(false);
	useEffect(() => {
		if (window.alt1) {
			alt1.identifyAppUrl("./appconfig.prod.json");
		}
	}, [window.alt1]);
	if (window.alt1 || override) {
		return <App />;
	}

	return (
		<>
			<div className="App">
				<h1>ALT1 not found</h1>
				<p>
					<a
						href={
							"alt1://addapp/https://techpure.dev/RS3QuestBuddy/appconfig.prod.json"
						}
					>
						<button className="Alt1button">Click here to add this to alt1</button>
					</a>
				</p>

				<button className="Alt1button" onClick={() => setOverride(true)}>
					Continue to RS3 Quest Buddy Web (No Alt1)
				</button>
			</div>
		</>
	);
};

document.querySelector("html")!.style.fontSize = "16px";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<SocketProvider>
		<MantineProvider defaultColorScheme="dark">
			<FontSizeProvider>
				<App />
			</FontSizeProvider>
		</MantineProvider>
	</SocketProvider>
);
