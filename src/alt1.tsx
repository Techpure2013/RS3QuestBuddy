import { Button, MantineProvider } from "@mantine/core";
import App from "./App";
import { useState } from "react";

export const AltGuard = () => {
    const [override, setOverride] = useState(false);
    if (window.alt1 || override) {
        return (
            <MantineProvider
                withNormalizeCSS
                withGlobalStyles
                theme={{ colorScheme: "dark" }}
            >
                <App />
            </MantineProvider>
        );
    }
    return (
        <div className="App">
            <h1>ALT1 not found</h1>
            <p>
                Click{" "}
                <a
                    href={`alt1://addapp/${window.location.protocol}//${
                        window.location.host
                    }/${
                        !window.location.host.includes("localhost")
                            ? "alt1-template/" //Include repo name (this is only for github pages)
                            : ""
                    }appconfig${
                        !window.location.host.includes("localhost")
                            ? ".prod" //Target prod (this is only for github pages)
                            : ""
                    }.json`}
                >
                    here
                </a>{" "}
                to add this to alt1
            </p>
            <Button onClick={() => setOverride(true)}>
                View Website Anyway
            </Button>
        </div>
    );
};
