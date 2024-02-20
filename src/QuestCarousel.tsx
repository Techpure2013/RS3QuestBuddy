// QuestCarousel.tsx
import React, { useEffect, useRef, useState } from "react";
import { Carousel } from "@mantine/carousel";
import { Button, TextInput, ActionIcon, Modal, Loader } from "@mantine/core";
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
	const [update, setUpdate] = useState(false);
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
				if (usePlayerStore.getState().playerQuestInfo.length > 0) {
					setUpdate(true);
					playerFound.current = true;
					window.sessionStorage.setItem("playerFound", JSON.stringify(playerFound));
					window.sessionStorage.setItem("playerName", JSON.stringify(playerName));
					setSearchInitiated(false);
				}
			} else {
				playerFound.current = false;
			}
		} catch (error) {
			// Handle errors
			console.error("Error fetching player info:", error);
		}
	};
	useEffect(() => {
		if (usePlayerStore.getState().playerQuestInfo.length > 0) {
			setUpdate(false);
		}
	}, [update]);
	const renderQuestContent = (quest: string | undefined) => {
		if (quest) {
			let questTEdit = quest.toLowerCase().split(" ");
			let modifiedQuestVal1 = questTEdit.join("").replace(/[!,`']/g, "");
			let questImage = "";
			const pattern = /[^a-zA-Z0-9]/g;
				questImage =
				"./Rewards/" + quest.toLowerCase().replace(pattern, "") + "reward.png";
			
			return (
				<div
					className="caroQTitle"
					aria-label={`Navigate to ${quest}`}
					style={{
						color: sorted.current
							? "#BF2930"
							: playerFound.current
							? "#54B46F"
							: "",
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
						onClick={() => {
							window.resizeTo(319, 619);
						}}
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
	}, [playerFound.current]);
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
	function startSearch() {
		if (!update) {
			return <Loader size={25} color="#36935C" />;
		}}
	return (
		<>
			<Modal
				title="Notes"
				opened={isOpened}
				onClose={() => {
					closedNotes();
				}}
				styles={{
					title: {
						fontSize: "34px",
						textAlign: "center",
					}
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
					title: {
						fontSize: "34px",
						textAlign: "center",
					}
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
							label: { color: hasLabelColor ? userLabelColor : "" },
						}}
						label={"Search for Player Name"}
						placeholder={"Search for Player Name"}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								console.log("Event value:", event.currentTarget.value);
								playerName = event.currentTarget.value;
								console.log("After update:", playerName);
								handleKeyPress();
							}
						}}
						rightSection={searchInitiated ? startSearch() : null}
					/>
				</div>

				<div className="SearchQuest">
					<TextInput
						styles={{
							label: { color: hasLabelColor ? userLabelColor : "" },
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
						color={hasButtonColor ? userButtonColor : ""}
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
						color={hasButtonColor ? userButtonColor : ""}
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
						color={hasButtonColor ? userButtonColor : ""}
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
					color={hasButtonColor ? userButtonColor : ""}
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
					style={{ color: hasColor ? userColor : "" }}
				>
					<h3>Quests have been sorted by quests you can do!</h3>
					<p>
						{returningPName.current.replace('"', "").replace('"', "")} has a total of{" "}
						{questPoints} Quest Points and has {remainingQuests.current?.length}{" "}
						quests you can do at this current time!
					</p>
				</div>
			)}
			<div className="caroContainer">
				<Carousel
					speed={100}
					align="center"
					slideSize={{ base: "100%"}}
					includeGapInSize={true}
					height={450}
					containScroll={"trimSnaps"}
					nextControlIcon={<IconArrowRight size={24} />}
					previousControlIcon={<IconArrowLeft size={24} />}
					loop
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
				color={hasButtonColor ? userButtonColor : ""}
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
				color={hasButtonColor ? userButtonColor : ""}
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
