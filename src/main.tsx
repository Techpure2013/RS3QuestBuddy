import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AltGuard } from "./alt1.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <AltGuard />
    </React.StrictMode>
);
