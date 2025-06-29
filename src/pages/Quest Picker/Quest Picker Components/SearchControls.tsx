// Quest Picker Components/SearchControls.tsx
import React, { useState, useEffect } from "react";
import { TextInput, Loader } from "@mantine/core";

interface SearchControlsProps {
	onPlayerSearch: (name: string) => void;
	onQuestSearchChange: (query: string) => void;
	isLoading: boolean;
	playerFound: boolean;
	initialPlayerName: string;
	labelColor?: string;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
	onPlayerSearch,
	onQuestSearchChange,
	isLoading,
	playerFound,
	initialPlayerName,
	labelColor,
}) => {
	const [playerName, setPlayerName] = useState(initialPlayerName);

	useEffect(() => {
		setPlayerName(initialPlayerName);
	}, [initialPlayerName]);

	return (
		<div className="SearchContainer">
			<div className="PlayerSearch">
				<TextInput
					value={playerName}
					onChange={(e) => setPlayerName(e.currentTarget.value)}
					onKeyDown={(e) =>
						e.key === "Enter" ? onPlayerSearch(e.currentTarget.value) : null
					}
					styles={{
						input: { color: playerFound ? "#36935C" : "#933648" },
						label: { color: labelColor || "" },
					}}
					label="Search for Player Name"
					placeholder="Search for Player Name"
					rightSection={isLoading ? <Loader size={25} /> : null}
				/>
			</div>
			<div className="SearchQuest">
				<TextInput
					styles={{ label: { color: labelColor || "" } }}
					label="Search for Quest"
					placeholder="Type in a quest"
					onChange={(e) => onQuestSearchChange(e.currentTarget.value)}
				/>
			</div>
		</div>
	);
};
