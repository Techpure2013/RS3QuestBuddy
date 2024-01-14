// QuestCarousel.tsx
import React, { useEffect, useState } from "react";
import { Carousel } from "@mantine/carousel";
import { Button, TextInput, Tooltip, Loader } from "@mantine/core";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/Button.css";
import "@mantine/core/styles/Input.css";
import "./index.css";
import { useQuestListStore, QuestListFetcher } from "./Fetchers/FetchQuestList";
import { NavLink } from "react-router-dom";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import { PlayerQuests, usePlayerStore } from "./Handlers/PlayerFetch";
import { rsQuestSorter } from "./Handlers/SortPlayerData";
const QuestCarousel: React.FC = () => {
	const [focused, setFocused] = useState(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const playerfetch = new PlayerQuests();
	let playerName = "";
	const [returningPName, setReturningPName] = useState<string>("");
	const [playerFound, setPlayerFound] = useState(false);
	const [sorted, setSorted] = useState(false);
	const questList = useQuestListStore().questlist;
	const [remainingQuests, setRemainingQuests] = useState<string[] | null>(null);
	const rsSorter = new rsQuestSorter();
	const rsUserQuestProfile = usePlayerStore.getState().playerQuestInfo;
	const [searchInitiated, setSearchInitiated] = useState(false);
	const [questPoints, setQuestPoints] = useState(0);
	const [alreadySorted, setAlreadySorted] = useState(false);
	const filteredQuests = questList.filter((quest) =>
		quest.toLowerCase().includes(searchQuery.toLowerCase())
	);
	const [skillsApplied, setSkillsApplied] = useState(false);
	const filteredRemainingQuests = sorted
		? remainingQuests!.filter((quest) =>
				quest.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: [];
	const handleKeyPress = async () => {
		try {
			if (playerName.length > 0) {
				setSearchInitiated(true);
				await playerfetch.fetchPlayerInfo(playerName);
				await playerfetch.fetchPlayerSkills(playerName);
				setReturningPName(playerName);
				if (usePlayerStore.getState().playerReponseOK) {
					console.log();

					setPlayerFound(true);

					window.localStorage.setItem("playerName", JSON.stringify(playerName));
				}
			} else {
				setPlayerFound(false);
			}
		} catch (error) {
			// Handle errors
			console.error("Error fetching player info:", error);
		}
	};

	const renderQuestContent = (quest: string | undefined) => {
		if (quest) {
			let questTEdit = quest.toLowerCase().split(" ");
			let modifiedQuestVal1 = questTEdit.join("").replace(/[!,`']/g, "");
			let questImage = "";

			if (!sorted) {
				const pattern = /[^a-zA-Z0-9]/g;
				questImage =
					"./Rewards/" +
					quest.toLowerCase().replace(pattern, "") +
					"reward.png";
			} else {
				const pattern = /[^a-zA-Z0-9]/g;
				questImage =
					"./Rewards/" +
					quest.toLowerCase().replace(pattern, "") +
					"reward.png";
			}

			return (
				<NavLink
					to={"/QuestPage"}
					state={{
						questName: quest,
						modified: modifiedQuestVal1,
					}}
				>
					<div
						className="caroQTitle"
						aria-label={`Navigate to ${quest}`}
						style={{
							color: sorted ? "#BF2930" : playerFound ? "#54B46F" : "#4e85bc",
						}}
					>
						{quest}
						<img src={questImage} alt="Reward" aria-hidden="true" />
					</div>
				</NavLink>
			);
		}

		return null;
	};
	const sort = () => {
		const resultingQuests = rsSorter.sortNotStartedQuests(rsUserQuestProfile);
		setRemainingQuests(resultingQuests);
		setSorted(true);
	};
	const startLoader = () => {
		if (!playerFound) {
			while (!usePlayerStore.getState().playerReponseOK) {
				return <Loader size={25} />;
			}
			return;
		}
	};
	const applySkills = () => {
		rsSorter.sortCompletedQuests(rsUserQuestProfile);
		setSkillsApplied(true);
	};
	useEffect(() => {
		const remainQuests = sessionStorage.getItem("remainingQuests");
		const player = sessionStorage.getItem("playerName");
		const qp = sessionStorage.getItem("questPoints");
		if (remainQuests !== null && player !== null && qp !== null) {
			const parsedQuests = JSON.parse(remainQuests);

			if (
				parsedQuests !== null &&
				typeof parsedQuests === "object" &&
				Array.isArray(parsedQuests)
			) {
				const qpoint: number = JSON.parse(qp);
				setQuestPoints(qpoint);
				setReturningPName(player);
				setRemainingQuests(parsedQuests);
				setAlreadySorted(true);
				setPlayerFound(true);
				applySkills();
				sort();
			} else {
				console.warn("Invalid or non-array data in sessionStorage");
			}
		} else {
			console.warn("No data found in sessionStorage");
		}
	}, [sorted, skillsApplied]);
	return (
		<>
			<QuestListFetcher questlist="./questlist.txt" />
			<div className="SearchContainer">
				<div className="PlayerSearch">
					<TextInput
						readOnly={false}
						defaultValue={playerFound ? returningPName : ""}
						styles={{
							input: { color: playerFound ? "#36935C" : "#933648" },
						}}
						label="Search for Player Name"
						placeholder={"Search for Player Name"}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								console.log("Event value:", event.currentTarget.value);
								playerName = event.currentTarget.value;
								console.log("After update:", playerName);
								setFocused(false);
								handleKeyPress();
							}
						}}
						rightSection={searchInitiated ? startLoader() : null}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						inputContainer={(children) => (
							<Tooltip
								label="Hit Enter to Search"
								position="top-start"
								opened={focused}
							>
								{children}
							</Tooltip>
						)}
					/>
				</div>

				<div className="SearchQuest">
					<TextInput
						className="customInput"
						label="Search for Quest"
						placeholder="Type in a quest"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.currentTarget.value)}
					/>
				</div>
			</div>
			<div>
				{!alreadySorted && (
					<Button
						className="SortButton"
						variant="outline"
						color="#EEF3FF"
						onClick={() => {
							sort();
						}}
						disabled={playerFound ? false : true}
					>
						Sort Out Completed Quests
					</Button>
				)}
				{!skillsApplied && (
					<Button
						className="ApplySkillsButton"
						variant="outline"
						color="#EEF3FF"
						onClick={() => {
							applySkills();
						}}
						disabled={playerFound ? false : true}
					>
						Apply Skills Dont Sort
					</Button>
				)}

				<Button
					className="RefreshButton"
					variant="outline"
					color="#EEF3FF"
					onClick={() => {
						sessionStorage.clear();
						location.reload();
					}}
					disabled={playerFound ? false : true}
				>
					New Player Search
				</Button>
			</div>
			{sorted && (
				<div className="caroQTitle">
					<h3>Quests have been sorted by quests you can do!</h3>
					<p>
						{returningPName} has a total of {questPoints} Quest Points and{" "}
						{remainingQuests?.length} remaining quests to Quest Cape!
					</p>
				</div>
			)}
			<div className="caroContainer">
				<Carousel
					speed={100}
					align="start"
					mx="auto"
					withIndicators
					slidesToScroll={1}
					height={400}
					nextControlIcon={<IconArrowRight size={16} />}
					previousControlIcon={<IconArrowLeft size={16} />}
					slideSize="100%"
				>
					{sorted &&
						filteredRemainingQuests.map((quest, index) => (
							<Carousel.Slide key={index}>
								{renderQuestContent(quest)}
							</Carousel.Slide>
						))}

					{!sorted &&
						filteredQuests
							.slice(1)
							.map((quest, index) => (
								<Carousel.Slide key={index}>
									{renderQuestContent(quest)}
								</Carousel.Slide>
							))}
				</Carousel>
			</div>
		</>
	);
};

export default QuestCarousel;
