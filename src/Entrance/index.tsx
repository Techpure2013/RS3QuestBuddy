import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./../assets/css/index.css";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles.css";
import "@mantine/core/styles/global.css";
import "@mantine/core/styles/Button.css";
import "@mantine/carousel/styles.css";
import "@mantine/core/styles/Stepper.css";
import "@mantine/core/styles/ScrollArea.css";
import "@mantine/core/styles/VisuallyHidden.css";
import "@mantine/core/styles/Paper.css";
import "@mantine/core/styles/Popover.css";
import "@mantine/core/styles/CloseButton.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Loader.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/Modal.css";
import "@mantine/core/styles/ModalBase.css";
import "@mantine/core/styles/Input.css";
import "@mantine/core/styles/Flex.css";
import "@mantine/core/styles/Accordion.css";
import { FontSizeProvider } from "./Entrance Components/FontContextProvider";
import "./../assets/rs3buddyicon.png";
import "./../assets/fonts/RS3Font.woff2";
import { MantineProvider } from "@mantine/core";
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
            href={`alt1://addapp/${window.location.protocol}//${
              window.location.host
            }/${
              !window.location.host.includes("localhost")
                ? "RS3QuestBuddy/" //Include repo name (this is only for github pages)
                : ""
            }appconfig${
              !window.location.host.includes("localhost")
                ? "prod" //Target prod (this is only for github pages)
                : ""
            }.json`}
          >
            <button className="Alt1button">
              Click here to add this to alt1
            </button>
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
  <FontSizeProvider>
    <MantineProvider defaultColorScheme="dark">
      <AltGuard />
    </MantineProvider>
  </FontSizeProvider>
);
