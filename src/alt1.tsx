import { Button, MantineProvider } from "@mantine/core";
import App from "./App";
import { useState } from "react";

export const AltGuard = () => {
    const [override, setOverride] = useState(false);

    return (
        <MantineProvider
            withNormalizeCSS
            withGlobalStyles
            theme={{ colorScheme: "dark" }}
        >
            <App />
        </MantineProvider>
    );
};
