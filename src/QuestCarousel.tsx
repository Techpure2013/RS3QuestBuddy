// QuestCarousel.tsx
import React, { useEffect, useRef, useState } from "react";
import { Carousel } from "@mantine/carousel";
import {
	Button,
	TextInput,
	Tooltip,
	Loader,
	ActionIcon,
	Modal,
} from "@mantine/core";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/Button.css";
import "@mantine/core/styles/Input.css";
import "./index.css";
import { useQuestListStore, QuestListFetcher } from "./Fetchers/FetchQuestList";
import { NavLink } from "react-router-dom";
import { IconArrowRight, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { PlayerQuests, usePlayerStore } from "./Handlers/PlayerFetch";
import { rsQuestSorter } from "./Handlers/SortPlayerData";
import { IconSettings } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Settings } from "./pages/Settings";
import useNotesDisclosure from "./Handlers/useDisclosure";
import { UserNotes } from "./pages/userNotes";
const QuestCarousel: React.FC = () => {
	const [focused, setFocused] = useState(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const playerfetch = new PlayerQuests();
	const returningPName = useRef<string>("");
	let playerName = returningPName.current;
	const playerFound = useRef<boolean>(false);
	const sorted = useRef<boolean>(false);
	const questList = useQuestListStore().questlist;
	const remainingQuests = useRef<string[] | null>(null);
	const rsSorter = new rsQuestSorter();
	const rsUserQuestProfile = usePlayerStore.getState().playerQuestInfo;
	const [searchInitiated, setSearchInitiated] = useState(false);
	const [questPoints, setQuestPoints] = useState(0);
	const alreadySorted = useRef<boolean>(false);
	const [opened, { open, close }] = useDisclosure(false);
	const [isOpened, { openNotes, closedNotes }] = useNotesDisclosure(false);
	const [userColor, setUserColor] = useState("");
	const [userLabelColor, setUserLabelColor] = useState("");
	const [userButtonColor, setUserButtonColor] = useState("");
	const [hasColor, setHasColor] = useState(false);
	const [hasButtonColor, setHasButtonColor] = useState(false);
	const [hasLabelColor, setHasLabelColor] = useState(false);
	const filteredQuests = questList.filter((quest) =>
		quest.toLowerCase().includes(searchQuery.toLowerCase())
	);
	const [skillsApplied, setSkillsApplied] = useState(false);
	const filteredRemainingQuests = sorted.current
		? remainingQuests.current!.filter((quest) =>
				quest.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: [];
	const handlePlayerLoad = async () => {
		await playerfetch.fetchPlayerInfo(playerName);
	};
	const handleKeyPress = async () => {
		try {
			if (playerName.length > 0) {
				console.log("im here");
				setSearchInitiated(true);
				await playerfetch.fetchPlayerInfo(playerName);
				await playerfetch.fetchPlayerSkills(playerName);
				returningPName.current = playerName;
				if (usePlayerStore.getState().playerReponseOK) {
					console.log();

					playerFound.current = true;
					window.sessionStorage.setItem("playerFound", JSON.stringify(playerFound));
					window.sessionStorage.setItem("playerName", JSON.stringify(playerName));
				}
			} else {
				playerFound.current = false;
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

			if (!sorted.current) {
				const pattern = /[^a-zA-Z0-9]/g;
				questImage =
					"./Rewards/" + quest.toLowerCase().replace(pattern, "") + "reward.png";
			} else {
				const pattern = /[^a-zA-Z0-9]/g;
				questImage =
					"./Rewards/" + quest.toLowerCase().replace(pattern, "") + "reward.png";
			}

			return (
				<div
					className="caroQTitle"
					aria-label={`Navigate to ${quest}`}
					style={{
						color: sorted.current
							? "#BF2930"
							: playerFound.current
							? "#54B46F"
							: "#4e85bc",
						paddingTop: "30",
					}}
				>
					{quest}
					<NavLink
						to={"/QuestPage"}
						state={{
							questName: quest,
							modified: modifiedQuestVal1,
						}}
						style={{ textDecoration: "none" }}
					>
						<img src={questImage} alt="Reward" aria-hidden="true" />
					</NavLink>
				</div>
			);
		}

		return null;
	};
	const sort = () => {
		const resultingQuests = rsSorter.sortNotStartedQuests(rsUserQuestProfile);
		remainingQuests.current = resultingQuests;
		alreadySorted.current = true;
		sorted.current = true;
		window.sessionStorage.setItem(
			"alreadySorted",
			JSON.stringify(alreadySorted.current)
		);
		window.sessionStorage.setItem("sorted", JSON.stringify(sorted.current));
	};

	const unSort = () => {
		alreadySorted.current = false;
		sorted.current = false;
		window.sessionStorage.setItem(
			"alreadySorted",
			JSON.stringify(alreadySorted.current)
		);
		window.sessionStorage.setItem("sorted", JSON.stringify(sorted.current));
	};
	const startLoader = () => {
		if (!playerFound.current) {
			while (!usePlayerStore.getState().playerReponseOK) {
				return <Loader size={25} />;
			}
			return;
		}
	};
	useEffect(() => {
		const colorVal = localStorage.getItem("textColorValue");
		const labelCol = localStorage.getItem("labelColor");
		const buttonCol = localStorage.getItem("buttonColor");
		if (buttonCol) {
			setUserButtonColor(buttonCol);
			setHasButtonColor(true);
		} else {
			setHasButtonColor(false);
		}
		if (labelCol) {
			setUserLabelColor(labelCol);
			setHasLabelColor(true);
		} else {
			setHasLabelColor(false);
		}
		if (colorVal) {
			setUserColor(colorVal);
			setHasColor(true);
		} else {
			setHasColor(false);
		}
	}, [
		userButtonColor,
		userLabelColor,
		userColor,
		hasColor,
		hasLabelColor,
		hasButtonColor,
		opened,
	]);
	const applySkills = () => {
		rsSorter.sortCompletedQuests(rsUserQuestProfile);
		setSkillsApplied(true);
	};
	useEffect(() => {
		const player = sessionStorage.getItem("playerName");

		if (player !== null) {
			returningPName.current = player;

			handlePlayerLoad();
			playerFound.current = true;
		}
	}, []);
	useEffect(() => {
		const remainQuests = sessionStorage.getItem("remainingQuests");
		const player = sessionStorage.getItem("playerName");
		const qp = sessionStorage.getItem("questPoints");
		const sort = sessionStorage.getItem("sorted");
		const playerF = sessionStorage.getItem("playerFound");
		const alreadyS = sessionStorage.getItem("alreadySorted");
		if (
			remainQuests !== null &&
			player !== null &&
			qp !== null &&
			sort !== null &&
			playerF &&
			alreadyS !== null
		) {
			const parsedQuests: string[] = JSON.parse(remainQuests);
			const parsedSort: boolean = JSON.parse(sort);
			const parsedPlayerF: boolean = JSON.parse(playerF);
			const parsedAlreadySorted: boolean = JSON.parse(alreadyS);
			if (
				parsedQuests !== null &&
				typeof parsedQuests === "object" &&
				Array.isArray(parsedQuests)
			) {
				const qpoint: number = JSON.parse(qp);
				setQuestPoints(qpoint);
				returningPName.current = player;
				sorted.current = parsedSort;
				alreadySorted.current = parsedAlreadySorted;
				remainingQuests.current = parsedQuests;
				playerFound.current = parsedPlayerF;
				applySkills();
			} else {
				console.warn("Invalid or non-array data in sessionStorage");
			}
		} else {
			console.warn("No data found in sessionStorage");
		}
	}, []);
	return (
		<>
			<Modal
				title="Notes"
				opened={isOpened}
				onClose={() => {
					closedNotes();
				}}
				styles={{
					header: {
						backgroundColor: "#3d3d3d",
					},
					title: {
						fontSize: "34px",
						textAlign: "center",
					},
					body: { backgroundColor: "#3d3d3d" },
				}}
			>
				<UserNotes />
			</Modal>
			<Modal
				title="Settings"
				opened={opened}
				onClose={() => {
					close();
				}}
				styles={{
					header: {
						backgroundColor: "#3d3d3d",
					},
					title: {
						fontSize: "34px",
						textAlign: "center",
					},
					body: { backgroundColor: "#3d3d3d" },
				}}
			>
				<Settings />
			</Modal>
			<QuestListFetcher questlist="./questlist.txt" />
			<div className="SearchContainer">
				<div className="PlayerSearch">
					<TextInput
						readOnly={false}
						defaultValue={
							playerFound.current ? returningPName.current.replace(/["]/g, "") : ""
						}
						styles={{
							input: { color: playerFound.current ? "#36935C" : "#933648" },
							label: { color: hasLabelColor ? userLabelColor : "#4e85bc" },
						}}
						label={"Search for Player Name"}
						placeholder={"Search for Player Name"}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								console.log("Event value:", event.currentTarget.value);
								playerName = event.currentTarget.value;
								console.log("After update:", playerName);
								setFocused(true);
								handleKeyPress();
							}
						}}
						rightSection={searchInitiated ? startLoader() : null}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						inputContainer={(children) => (
							<Tooltip
								label="Hit Enter, If it looks like its taking a while click in the box"
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
						styles={{
							label: { color: hasLabelColor ? userLabelColor : "#4e85bc" },
						}}
						className="customInput"
						label="Search for Quest"
						placeholder="Type in a quest"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.currentTarget.value)}
					/>
				</div>
			</div>
			<div>
				{!alreadySorted.current ? (
					<Button
						className="SortButton"
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						onClick={() => {
							applySkills();
							sort();

							location.reload();
						}}
						disabled={playerFound.current ? false : true}
					>
						Sort Out Completed Quests
					</Button>
				) : (
					<Button
						className="SortButton"
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						onClick={() => {
							unSort();
							location.reload();
						}}
						disabled={playerFound.current ? false : true}
					>
						Un-Sort
					</Button>
				)}
				{!skillsApplied && (
					<Button
						className="ApplySkillsButton"
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						onClick={() => {
							applySkills();
						}}
						disabled={playerFound.current ? false : true}
					>
						Apply Skills Dont Sort
					</Button>
				)}

				<Button
					className="RefreshButton"
					variant="outline"
					color={hasButtonColor ? userButtonColor : "#EEF3FF"}
					onClick={() => {
						sessionStorage.clear();
						location.reload();
					}}
				>
					New Player Search
				</Button>
			</div>
			{sorted.current && (
				<div
					className="caroQTitle"
					style={{ color: hasColor ? userColor : "#4e85bc" }}
				>
					<h3>Quests have been sorted by quests you can do!</h3>
					<p>
						{returningPName.current} has a total of {questPoints} Quest Points and{" "}
						{remainingQuests.current?.length} remaining quests to Quest Cape!
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
					nextControlIcon={
						<IconArrowRight
							size={16}
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						/>
					}
					previousControlIcon={
						<IconArrowLeft
							size={16}
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						/>
					}
					slideSize="100%"
				>
					{sorted.current &&
						filteredRemainingQuests.map((quest, index) => (
							<Carousel.Slide key={index}>{renderQuestContent(quest)}</Carousel.Slide>
						))}

					{!sorted.current &&
						filteredQuests.map((quest, index) => (
							<Carousel.Slide key={index}>{renderQuestContent(quest)}</Carousel.Slide>
						))}
				</Carousel>
			</div>
			<ActionIcon
				color={hasButtonColor ? userButtonColor : "#EEF3FF"}
				onClick={openNotes}
				size={"sm"}
				variant="outline"
				styles={{
					root: {
						position: "fixed",
						bottom: "22px",
						left: "5px",
					},
				}}
			>
				<IconPlus />
			</ActionIcon>
			<ActionIcon
				onClick={open}
				variant="outline"
				size={"sm"}
				color={hasButtonColor ? userButtonColor : "#EEF3FF"}
				styles={{
					root: { bottom: "22px", left: "35px", position: "fixed" },
				}}
			>
				<IconSettings />
			</ActionIcon>
		</>
	);
};

export default QuestCarousel;
