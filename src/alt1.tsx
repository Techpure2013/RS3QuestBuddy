import { Button } from "@mantine/core";
import App from "./App";
import { useState } from "react";
import "./index.css";

export const AltGuard = () => {
	const [override, setOverride] = useState(false);
	if (window.alt1 || override) {
		return <App />;
	}

	return (
		<>
			<div className="App">
				<h1>ALT1 not found</h1>
				<p>
					Click{" "}
					<a
						href={`alt1://addapp/${window.location.protocol}//${
							window.location.host
						}/${
							!window.location.host.includes("localhost")
								? "RS3QuestBuddy/" //Include repo name (this is only for github pages)
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

				<Button
					className="Alt1Button"
					variant="outline"
					onClick={() => setOverride(true)}
				>
					Continue to RS3 Quest Buddy
				</Button>
			</div>
		</>
	);
};
