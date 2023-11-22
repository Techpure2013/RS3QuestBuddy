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
            <p></p>
            <Button onClick={() => setOverride(true)}>
                View Website Anyway
            </Button>
        </div>
    );
};
