import React, { useState, useEffect } from "react";
import { Button, MantineProvider } from "@mantine/core";
import App from "./App";

export const AltGuard = () => {
    const [override, setOverride] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Check for ALT1 presence on component mount
        if (!window.alt1) {
            setError(true);
        }
    }, []);

    const handleAlt1Click = () => {
        // Handle ALT1 link click
        window.location.href = `alt1://addapp/${window.location.protocol}//${window.location.host}/appconfig.json`;
    };

    if (error || override) {
        return (
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme: "dark",
                }}
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
                <a href="#" onClick={handleAlt1Click}>
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
