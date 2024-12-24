// QuestCarousel.tsx
import React, { useEffect, useReducer, useRef, useState } from "react";
import { Carousel } from "@mantine/carousel";
import {
	Button,
	TextInput,
	ActionIcon,
	Modal,
	Loader,
	Accordion,
	AccordionControl,
} from "@mantine/core";
import { fetchQuestList, questlist } from "./../../Fetchers/FetchQuestList";
import { NavLink, useLocation } from "react-router-dom";
import {
	IconBrandDiscord,
	IconArrowRight,
	IconArrowLeft,
	IconPlus,
} from "@tabler/icons-react";
import { usePlayerStats } from "./../../Fetchers/usePlayerStats";
import { usePlayerSortStats } from "./../../Fetchers/PlayerStatsSort";
import { IconSettings } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Settings } from "./../Settings/Settings";
import useNotesDisclosure from "./../Quest Details/Quest Detail Components/useDisclosure";
import { UserNotes } from "../Settings/userNotes";
import { usePlayerQuests } from "./../../Fetchers/usePlayerQuests";
import {
	PlayerQuestStatus,
	useSortedPlayerQuests,
} from "./../../Fetchers/sortPlayerQuests";
const QuestCarousel: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const { playerStats, isLoading, fetchPlayerStats } = usePlayerStats();
	const { sortedPlayerStats, filterPlayerStats } = usePlayerSortStats();
	const returningPName = useRef<string>("");
	const location = useLocation();
	const playerFound = useRef<boolean>(false);
	const sorted = useRef<boolean>(false);

	const {
		alteredQuestData,
		completedPlayerQuests,
		notStartedPlayerQuests,
		startedPlayerQuests,
		eligiblePlayerQuests,
		notEligiblePlayerQuests,
		totalQuestPoints,
		sortPlayerQuests,
	} = useSortedPlayerQuests();
	const [inputValue, setInputValue] = useState("");
	const remainingQuests = useRef<PlayerQuestStatus[]>();
	const [questPoints, setQuestPoints] = useState(totalQuestPoints);
	const alreadySorted = useRef<boolean>(false);
	const [opened, { open, close }] = useDisclosure(false);
	const [isOpened, { openNotes, closedNotes }] = useNotesDisclosure(false);
	const { playerQuests, fetchPlayerQuests, questIsLoading } = usePlayerQuests();
	const [update, setUpdate] = useState<boolean>(false);
	const [uiState, setUiState] = useState({
		isCompact: false,
		isHighlight: false,
		hasColor: false,
		hasButtonColor: false,
		hasLabelColor: false,
		userColor: "",
		userLabelColor: "",
		userButtonColor: "",
	});
	const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(
		null
	);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	const [questList, setQuestList] = useState<questlist | null>(null);
	const filteredQuests = questList?.quests.filter((quest) =>
		quest.toLowerCase().includes(searchQuery.toLowerCase())
	);
	const filteredRemainingQuests = sorted.current
		? remainingQuests.current?.filter((quest) =>
				quest.title.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: [];

	useEffect(() => {
		loadUserSettings();
	}, [location.key]);
	useEffect(() => {
		const loadQuestList = async () => {
			const ql = await fetchQuestList();
			if (ql) {
				setQuestList(ql);
			}
		};

		loadQuestList();
	}, []);
	const HandleNewPlayer = () => {
		sessionStorage.clear();
		playerFound.current = false;
		returningPName.current = "";
		remainingQuests.current = [];
		setQuestPoints(null);
		forceUpdate();
	};
	const handleKeyPress = async (playerName: string) => {
		setCurrentPlayerName(playerName);
		if (isLoading) return;
		if (questIsLoading) return;
		await fetchPlayerStats(playerName);
		await fetchPlayerQuests(playerName);
	};
	useEffect(() => {
		if (!questIsLoading && playerQuests.length > 0) {
			sessionStorage.setItem("playerQuest", JSON.stringify(playerQuests));
			sortPlayerQuests([...playerQuests]); // Pass a fresh reference always
			sessionStorage.setItem(
				"hasCompleted",
				JSON.stringify(completedPlayerQuests)
			);
			if (alteredQuestData.length > 0) {
				remainingQuests.current = notStartedPlayerQuests;
				sessionStorage.setItem(
					"remainingQuest",
					JSON.stringify(remainingQuests.current)
				);
				sessionStorage.setItem(
					"totalQuestPoints",
					JSON.stringify(totalQuestPoints)
				);
				setQuestPoints(totalQuestPoints);
				setUpdate(true);
				playerFound.current = true;
				sessionStorage.setItem("playerFound", JSON.stringify(playerFound.current));
				forceUpdate();
			}
		}
	}, [totalQuestPoints, playerQuests]);
	useEffect(() => {
		if (playerStats) {
			sessionStorage.setItem("playerName", currentPlayerName ?? "");
			sessionStorage.setItem("returningPName", currentPlayerName ?? "");
			sessionStorage.setItem("sorted", JSON.stringify(sorted.current));

			filterPlayerStats(playerStats.split(","));
			sessionStorage.setItem(
				"skillLevels",
				JSON.stringify(sortedPlayerStats.current)
			);
		}
	}, [sortedPlayerStats, playerStats, currentPlayerName]);

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
						color: sorted.current ? "#BF2930" : playerFound ? "#54B46F" : "",
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
		alreadySorted.current = true;
		sorted.current = true;
		window.sessionStorage.setItem(
			"alreadySorted",
			JSON.stringify(alreadySorted.current)
		);
		window.sessionStorage.setItem("sorted", JSON.stringify(sorted.current));

		forceUpdate();
	};
	useEffect(() => {
		// Safeguard to avoid unnecessary resets
		if (playerFound.current == true && returningPName.current) {
			console.log("Setting INputval");
			setInputValue(returningPName.current); // Set the input value only when needed
		}
		if (playerFound.current == false) {
			setInputValue("");
		}
	}, [playerFound.current, returningPName.current]);
	const unSort = () => {
		alreadySorted.current = false;
		sorted.current = false;
		window.sessionStorage.setItem(
			"alreadySorted",
			JSON.stringify(alreadySorted.current)
		);
		window.sessionStorage.setItem("sorted", JSON.stringify(sorted.current));
		forceUpdate();
	};
	const loadUserSettings = () => {
		const hl = JSON.parse(localStorage.getItem("isHighlighted") || "false");
		const compact = JSON.parse(localStorage.getItem("isCompact") || "false");

		setUiState({
			isCompact: compact,
			isHighlight: hl,
			userColor: localStorage.getItem("textColorValue") || "",
			userLabelColor: localStorage.getItem("labelColor") || "",
			userButtonColor: localStorage.getItem("buttonColor") || "",
			hasColor: !!localStorage.getItem("textColorValue"),
			hasLabelColor: !!localStorage.getItem("labelColor"),
			hasButtonColor: !!localStorage.getItem("buttonColor"),
		});
	};

	useEffect(() => {
		const player = sessionStorage.getItem("playerName");

		if (player !== null) {
			returningPName.current = player;
			playerFound.current = true;
		}
	}, [playerFound]);
	const loadSessionStorage = () => {
		try {
			const remainQuests = sessionStorage.getItem("remainingQuest");
			const player = sessionStorage.getItem("playerName");
			const qp = sessionStorage.getItem("totalQuestPoints");
			const sort = sessionStorage.getItem("sorted");
			const playerF = sessionStorage.getItem("playerFound");
			const alreadyS = sessionStorage.getItem("alreadySorted");
			console.log(player);
			if (remainQuests && player && qp && sort && playerF && alreadyS) {
				const parsedQuests: PlayerQuestStatus[] = JSON.parse(remainQuests);
				const parsedSort: boolean = JSON.parse(sort);
				const parsedPlayerF: boolean = JSON.parse(playerF);
				const parsedAlreadySorted: boolean = JSON.parse(alreadyS);
				const qpoint: number = JSON.parse(qp);
				if (Array.isArray(parsedQuests)) {
					setQuestPoints(qpoint);
					returningPName.current = player;
					sorted.current = parsedSort;
					alreadySorted.current = parsedAlreadySorted;
					remainingQuests.current = parsedQuests;
					playerFound.current = parsedPlayerF;
				} else {
					console.warn("Invalid or non-array data in 'remainingQuests'");
				}
			} else {
				console.warn("Some data is missing from sessionStorage");
			}
		} catch (error) {
			console.error("Error parsing sessionStorage data:", error);
		}
	};

	useEffect(() => {
		loadSessionStorage();
	}, []);

	function startSearch() {
		if (!update) {
			return <Loader size={25} color="#36935C" />;
		}
	}
	function openDiscord(): void {
		const newWindow = window.open(
			"https://discord.gg/qFftZF7Usa",
			"_blank",
			"noopener,noreferrer"
		);
		if (newWindow) newWindow.opener = null;
	}

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
						fontSize: "2.125rem",
						textAlign: "center",
					},
				}}
			>
				<UserNotes />
			</Modal>
			<Modal
				title="Settings"
				opened={opened}
				onClose={() => {
					close();
					loadUserSettings();
				}}
				styles={{
					title: {
						fontSize: "2.125rem",
						textAlign: "center",
					},
				}}
			>
				<Settings />
			</Modal>

			<div className="SearchContainer">
				<div className="PlayerSearch">
					<TextInput
						readOnly={false}
						value={inputValue || ""} // Ensures value is never null/undefined
						onChange={(e) => setInputValue(e.currentTarget.value)}
						styles={{
							input: { color: playerFound.current ? "#36935C" : "#933648" },
							label: { color: uiState.hasLabelColor ? uiState.userLabelColor : "" },
						}}
						label={"Search for Player Name"}
						placeholder={"Search for Player Name"}
						onKeyDown={(event) =>
							event.key === "Enter" ? handleKeyPress(event.currentTarget.value) : null
						}
						rightSection={isLoading || questIsLoading ? startSearch() : null}
					/>
				</div>

				<div className="SearchQuest">
					<TextInput
						styles={{
							label: { color: uiState.hasLabelColor ? uiState.userLabelColor : "" },
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
					<>
						<Button
							className="SortButton"
							variant="outline"
							color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
							onClick={sort}
							disabled={playerFound.current ? false : true}
						>
							Sort Out Completed Quests
						</Button>
						<Button
							className="RefreshButton"
							variant="outline"
							color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
							onClick={HandleNewPlayer}
						>
							New Player Search
						</Button>
					</>
				) : (
					<Button
						className="SortButton"
						variant="outline"
						color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
						onClick={unSort}
						disabled={playerFound.current ? false : true}
					>
						Un-Sort
					</Button>
				)}
			</div>
			{sorted.current && (
				<div
					className="caroQTitle"
					style={{ color: uiState.hasColor ? uiState.userColor : "" }}
				>
					<h3>Quests have been sorted by quests you can do!</h3>
					<p>
						{returningPName.current.replace('"', "").replace('"', "")} has a total of{" "}
						{questPoints} Quest Points and has {remainingQuests.current?.length}{" "}
						quests you can do at this current time!
					</p>
				</div>
			)}
			{uiState.isCompact && (
				<Accordion
					styles={{
						control: {
							textAlign: "center",
						},
					}}
				>
					{sorted.current &&
						filteredRemainingQuests?.map((quest, index) => {
							let questTEdit = quest.title.toLowerCase().split(" ");
							let modifiedQuestVal1 = questTEdit.join("").replace(/[!,`']/g, "");
							return (
								<Accordion.Item key={index} value={quest.title}>
									<div>
										<NavLink
											to="/QuestPage"
											state={{
												questName: quest.title,
												modified: modifiedQuestVal1,
											}}
											style={({ isActive }) => ({
												textDecoration: "none",
												color: isActive ? "inherit" : "inherit", // Ensure no style change
											})}
											onClick={() => {
												window.scrollTo(0, 0);
											}}
										>
											<AccordionControl
												chevron={null}
												className="AccordianControl"
												styles={{
													control: {
														color: uiState.hasLabelColor ? uiState.userLabelColor : "",
													},
													chevron: {
														display: "none",
													},
												}}
											>
												{quest.title}
											</AccordionControl>
										</NavLink>
									</div>
								</Accordion.Item>
							);
						})}
					{!sorted.current &&
						filteredQuests?.map((quest, index) => {
							let questTEdit = quest.toLowerCase().split(" ");
							let modifiedQuestVal1 = questTEdit.join("").replace(/[!,`']/g, "");

							return (
								<Accordion.Item key={index} value={quest}>
									<div>
										<NavLink
											to="/QuestPage"
											state={{
												questName: quest,
												modified: modifiedQuestVal1,
											}}
											style={({ isActive }) => ({
												textDecoration: "none",
												color: isActive ? "inherit" : "inherit", // Ensure no style change
											})}
											onClick={() => {
												window.scrollTo(0, 0);
											}}
										>
											<AccordionControl
												chevron={null}
												className="AccordianControl"
												styles={{
													control: {
														color: uiState.hasLabelColor ? uiState.userLabelColor : "",
													},
													chevron: {
														display: "none",
													},
												}}
											>
												{quest}
											</AccordionControl>
										</NavLink>
									</div>
								</Accordion.Item>
							);
						})}
				</Accordion>
			)}
			{!uiState.isCompact && (
				<div className="caroContainer">
					<Carousel
						speed={100}
						align="center"
						slideSize={{ base: "100%" }}
						includeGapInSize={true}
						height={450}
						containScroll={"trimSnaps"}
						nextControlIcon={<IconArrowRight size={24} />}
						previousControlIcon={<IconArrowLeft size={24} />}
						loop
					>
						{sorted.current &&
							filteredRemainingQuests?.map((quest, index) => (
								<Carousel.Slide key={index}>
									{renderQuestContent(quest.title)}
								</Carousel.Slide>
							))}

						{!sorted.current &&
							filteredQuests?.map((quest, index) => (
								<Carousel.Slide key={index}>{renderQuestContent(quest)}</Carousel.Slide>
							))}
					</Carousel>
				</div>
			)}

			<ActionIcon
				color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
				size={"sm"}
				variant="outline"
				onClick={openDiscord}
				styles={{
					root: {
						position: "fixed",
						bottom: "1.375rem",
						left: "4.063rem",
					},
				}}
			>
				<IconBrandDiscord />
			</ActionIcon>
			<ActionIcon
				color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
				onClick={openNotes}
				size={"sm"}
				variant="outline"
				styles={{
					root: {
						position: "fixed",
						bottom: "1.375rem",
						left: "0.313rem",
					},
				}}
			>
				<IconPlus />
			</ActionIcon>
			<ActionIcon
				onClick={open}
				variant="outline"
				size={"sm"}
				color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
				styles={{
					root: { bottom: "1.375rem", left: "2.188rem", position: "fixed" },
				}}
			>
				<IconSettings />
			</ActionIcon>
		</>
	);
};

export default QuestCarousel;
