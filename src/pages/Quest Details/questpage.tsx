import React, {
	useState,
	useEffect,
	useRef,
	Suspense,
	useReducer,
} from "react";
import { useLocation } from "react-router-dom";
import { ActionIcon, Box, Button, Flex, Modal, Stepper } from "@mantine/core";
import "@mantine/core/styles/Stepper.css";
import "@mantine/core/styles/Accordion.css";
import "@mantine/core/styles.css";
require("./../../assets/QuestIconEdited.png");
import {
	IconBrandDiscord,
	IconSettings,
	IconPlus,
	IconPhotoFilled,
	IconWorldWww,
	IconCoffee,
} from "@tabler/icons-react";

import { useQuestPaths } from "./../../Fetchers/useQuestData";
import { useQuestControllerStore } from "./../../Handlers/HandlerStore";
import { createRoot } from "react-dom/client";
import { DiagReader } from "./dialogsolver";
import { IconArrowBack, IconCheck } from "@tabler/icons-react";
import { Settings } from "./../Settings/Settings";
import { useDisclosure } from "@mantine/hooks";
import useNotesDisclosure from "./Quest Detail Components/useDisclosure";
import usePOGDisclosure from "./Quest Detail Components/POGCalcDisclosure";
import { UserNotes } from "./../Settings/userNotes";
import useGridDisclosure from "./Quest Detail Components/useGridModal";
import useLunarGridDisclosure from "./Quest Detail Components/useLunarDisclosure";
import { useQuestPageFunctions } from "./questPageFunctions";
import {
	QuestImageFetcher,
	UseImageStore,
} from "./../../Fetchers/handleNewImage";
import { Skills } from "./../../Fetchers/PlayerStatsSort";
import { useQuestDetails } from "./../../Fetchers/useQuestDetails";
import { PlayerQuestStatus } from "./../../Fetchers/sortPlayerQuests";
import { useDialogSolver } from "./dialogsolverRW";
import Tippy from "@tippyjs/react";

const UnderGroundPassGrid = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./Quest Detail Components/UndergroundPassGrid").default,
			});
		}),
);
const LunarGrid = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./Quest Detail Components/LunarDiplomacyGrid").default,
			});
		}),
);
const ColorCalculator = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({ default: require("./Quest Detail Components/POGCalc").default });
		}),
);
const QuestDetailContents = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./Quest Detail Components/QuestDetailsAccordion").default,
			});
		}),
);
const QuestPage: React.FC = () => {
	// Define constants for local storage keys to avoid typos and ensure consistency
	const { questSteps, QuestDataPaths, getQuestSteps } = useQuestPaths();
	const {
		ignoredRequirements,
		create_ListUUID,
		useAlt1Listener,
		handleBackButton,
		openDiscord,
		openWikiQuest,
	} = useQuestPageFunctions();
	const location = useLocation();
	const LOCAL_STORAGE_KEYS = {
		expandAllAccordions: "expandAllAccordions",
		dialogOption: "dialogSolverOption",
	};
	const reader = new DiagReader();
	const qpname = useLocation();
	let { questName } = qpname.state;
	const [opened, { open, close }] = useDisclosure(false);
	const [openedGrid, { openGrid, closeGrid }] = useGridDisclosure(false);
	const [openLGrid, { openLunarGrid, closeLunarGrid }] =
		useLunarGridDisclosure(false);
	const [active, setActive] = useState(-1);
	const [highestStepVisited, setHighestStepVisited] = useState(active);
	const { getQuestDetails, questDetails, getQuestNamedDetails } =
		useQuestDetails();
	const imageDetails = UseImageStore();
	const stepRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
	let isPog = false;
	let gridActive = false;
	let lunarGridActive = false;
	const [uiState, setUiState] = useState({
		toolTipEnabled: false,
		isHighlight: false,
		hasColor: false,
		hasButtonColor: false,
		hasLabelColor: false,
		dialogOption: false,
		userColor: "",
		userLabelColor: "",
		userButtonColor: "",
	});
	let [isPOGOpen, { pogModOpen, pogModClose }] = usePOGDisclosure(false);
	let [isOpened, { openNotes, closedNotes }] = useNotesDisclosure(false);
	const isOpenNotes = useRef(false);
	// const finder = new diagFinder();
	const { showStepReq, toggleShowStepReq } = useQuestControllerStore();
	const { stepCapture } = useDialogSolver();
	const handles = useQuestControllerStore();
	const [skillLevels, setSkillLevels] = useState<Skills | null>(null);
	const [completedQuests, setCompleteQuests] = useState<
		PlayerQuestStatus[] | null
	>(null);
	const storedExpandAll = localStorage.getItem(
		LOCAL_STORAGE_KEYS.expandAllAccordions,
	);
	const userID = localStorage.getItem("userID");
	const [expanded, setExpanded] = useState<string[]>(() => {
		const isExpandAll =
			storedExpandAll !== null ? JSON.parse(storedExpandAll) : false;

		if (isExpandAll)
			return [
				"item-1",
				"item-2",
				"item-3",
				"item-4",
				"item-5",
				"item-6",
				"item-7",
			];
		return [];
	});
	const handleKeyDown = (event: KeyboardEvent) => {
		if (!isOpenNotes.current) {
			if (event.key === " ") {
				event.preventDefault();
			}
		}
	};

	useEffect(() => {
		loadUserSettings();
		console.log(uiState.dialogOption);
	}, [location.key]);
	useEffect(() => {
		if (questSteps !== undefined) {
			stepRefs.current = Array.from({ length: questSteps.length });
		}
	}, [questSteps?.length]);
	useEffect(() => {
		if (QuestDataPaths) {
			getQuestSteps(questName);
		}
	}, []);
	useEffect(() => {
		if (getQuestDetails) {
			getQuestNamedDetails(questName);
		}
	}, []);
	useEffect(() => {
		const completedQuestsJSON = sessionStorage.getItem("hasCompleted");
		const skillLevelsJSON = sessionStorage.getItem("skillLevels");

		if (completedQuestsJSON && skillLevelsJSON) {
			try {
				const parsedQuests: PlayerQuestStatus[] = JSON.parse(completedQuestsJSON);
				// 1. Parse the data as a single Skills object
				const parsedSkills: Skills = JSON.parse(skillLevelsJSON);

				// 2. Validate that we have an array and a valid object
				if (
					Array.isArray(parsedQuests) &&
					typeof parsedSkills === "object" &&
					parsedSkills !== null
				) {
					// 3. Set the state correctly
					setCompleteQuests(parsedQuests);
					setSkillLevels(parsedSkills);
				} else {
					console.error("Invalid data shape in sessionStorage");
				}
			} catch (error) {
				console.error("Failed to parse sessionStorage JSON:", error);
			}
		} else {
			console.error("Required data not found in sessionStorage");
		}
	}, []);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			console.log("clearing intervals");
			clearAllIntervals();
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		if (uiState.dialogOption) {
			console.log("Mounting");
		} else {
			return () => {
				console.log("Unmounting Solver");
			};
		}
		return () => {
			console.log("Unmounting Solver");
		};
	}, [uiState.dialogOption]);

	function handleFalse() {
		isOpenNotes.current = false;
	}
	if (questName == "The Prisoner of Glouphrie") {
		isPog = true;
	}
	if (questName == "Lunar Diplomacy") {
		lunarGridActive = true;
	}
	if (questName == "Underground Pass" || questName == "Regicide") {
		gridActive = true;
	}
	const clearAllIntervals = () => {
		clearTimeout(reader.timeoutID);
		reader.intervalIds.forEach(clearInterval);
		reader.intervalIds = [];
	};

	function copyStyle(
		_from: Window,
		to: Window,
		node: HTMLStyleElement | HTMLLinkElement,
	): void {
		try {
			const doc: Document = to.document;
			console.log("Copying style/link:", node);
			if (node.tagName === "STYLE") {
				const newStyle: HTMLStyleElement = doc.createElement("style");
				newStyle.textContent = node.textContent || "";
				doc.head.appendChild(newStyle);
			}
			if (node.tagName === "LINK" && "rel" in node) {
				const newLink: HTMLLinkElement = doc.createElement("link");
				newLink.rel = node.rel || "";
				newLink.href = node.href || "";
				newLink.type = node.type || "";
				doc.head.appendChild(newLink);
			}
		} catch (error) {
			console.error("Error copying style:", error);
		}
	}

	const scrollPrev = (): void => {
		const prevStep = active - 1;

		if (prevStep > 0) {
			scrollIntoView(prevStep);
		}
	};
	const handlePopOut = (
		_index: number,
		_imgSrc: string,
		_imgHeight: number,
		_imgWidth: number,
	) => {
		if (handles.popOutWindow && !handles.popOutWindow.closed) {
			// If open, close the window
			handles.popOutWindow.close();
			handles.setPopOutWindow(null);
			handles.setButtonVisible(true); // Show the buttons again
			handles.setPopOutClicked(true);
		} else {
			const emptypage = "./emptypage.html";
			var popid = "testpopup_" + Date.now();

			// If not open, open a new browser window
			const newWindow = window.open(
				emptypage,
				"promptbox" + popid,
				`width=${_imgWidth}, height=${_imgHeight + 100},`,
			);
			if (newWindow) {
				// Set the pop-out window and hide buttons in the current window
				handles.setPopOutWindow(newWindow);
				handles.setButtonVisible(false);
				handles.setPopOutClicked(false);
				let script =
					"<sc" +
					"ript>" +
					"(function() {" +
					"   var link = document.createElement('link');" +
					"   link.type = 'image/x-icon';" +
					"   link.rel = 'image/icon';" +
					"   link.href = '/src/assets/rs3buddyicon.ico';" +
					"   document.getElementsByTagName('head')[0].appendChild(link);" +
					"}());" +
					"</sc" +
					"ript>";

				newWindow.document.writeln(
					"<html><head><title>Quest Image</title>" +
						script +
						"</head>" +
						'<body onLoad="self.focus()">' +
						"</body></html>",
				);

				// Render the Quest Image into the new window
				const container: HTMLDivElement = newWindow.document.createElement("div");
				container.className = ".QuestPageImageCaro";
				newWindow.document.body.appendChild(container);
				newWindow.document.title = "Quest Images";

				// Set initial content for the new window
				const initialContentContainer = newWindow.document.createElement("div");
				initialContentContainer.id = "initialContentContainer";
				newWindow.document.body.appendChild(initialContentContainer);
				const domNode: any = newWindow.document.getElementById(
					"initialContentContainer",
				);
				const root = createRoot(domNode);

				// Function to copy styles from the original window to the new window
				function copyStyles(): void {
					try {
						const stylesheets: NodeListOf<HTMLStyleElement | HTMLLinkElement> =
							document.querySelectorAll('style, link[rel="stylesheet"]');
						const stylesheetsArray: HTMLStyleElement[] = Array.from(stylesheets);
						stylesheetsArray.forEach(function (stylesheet: HTMLStyleElement) {
							copyStyle(window, newWindow!, stylesheet);
						});
						const emotionStyles = document.querySelectorAll("style[data-emotion]");
						emotionStyles.forEach((style) => {
							const newEmotionStyle = document.createElement("style");
							newEmotionStyle.textContent = style.textContent;
							newWindow!.document.head.appendChild(newEmotionStyle);
						});
					} catch (error) {
						console.error("Error copying styles:", error);
					}
				}
				// Call the function to copy styles
				copyStyles();

				// Render Quest Image into the new window
				const matchingImage = imageDetails.imageList?.find(
					(image: { src: string | string[] }) => image.src.includes(_imgSrc), // image.src should be a string
				);
				root.render(
					<>
						<div
							style={{
								paddingTop: "1rem",
								alignContent: "center",
							}}
						>
							<img
								src={matchingImage?.src}
								className="zoomable"
								id="zoomableImage"
								alt="Quest Image"
								style={{ maxWidth: "100%", height: "auto" }}
								onClick={() => {
									const imgElement = newWindow.document.getElementById("zoomableImage");
									if (imgElement) {
										imgElement.classList.toggle("zoomed");
									}
								}}
							/>
						</div>
					</>,
				);
			}
		}
	};
	const setActiveAndScroll = (nextStep: number): void => {
		if (nextStep >= 0 && nextStep < questSteps!.length) {
			setActive(nextStep);
			setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
			scrollIntoView(nextStep);
		}
	};
	function openCoffee(): void {
		const newWindow = window.open("https://buymeacoffee.com/rs3questbuddy");
		if (newWindow) newWindow.opener = null;
	}
	const handleStepChange = (nextStep: number) => {
		const stepLength = questSteps!.length;
		const isOutOfBoundsBottom = nextStep > stepLength;
		const isOutOfBoundsTop = nextStep < 0;

		if (isOutOfBoundsBottom) {
			window.alert("Cannot go forward");
		} else if (isOutOfBoundsTop) {
			window.alert("Cannot go back");
		} else {
			setActive(nextStep);
			setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
		}
	};
	const scrollNext = () => {
		setActive((prevActive) => {
			const nextStep = prevActive + 1;
			if (nextStep <= questSteps!.length) {
				scrollIntoView(nextStep);

				return nextStep;
			}
			return prevActive;
		});
	};

	const scrollIntoView = (step: number) => {
		if (questSteps[step] !== undefined) {
			if (uiState.dialogOption === true) {
				stepCapture(questSteps[step]);
			}
		}

		const element = document.getElementById(step.toString());
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};
	function loadPlayerQuests(questName: string) {
		let remainingplayerQuest: PlayerQuestStatus[] = JSON.parse(
			sessionStorage.getItem("remainingQuest") || "[]",
		);

		const completedQuests: PlayerQuestStatus[] = JSON.parse(
			sessionStorage.getItem("hasCompleted") || "[]",
		);

		if (remainingplayerQuest.length > 0) {
			const filterOutQuest = remainingplayerQuest.filter((value) => {
				return value.title.toLowerCase().trim() === questName.toLowerCase().trim();
			});

			remainingplayerQuest = remainingplayerQuest.filter((value) => {
				return value.title.toLowerCase().trim() !== questName.toLowerCase().trim();
			});
			const newCompletedQuests = filterOutQuest.map((value) => {
				return { ...value, status: "COMPLETED" as "COMPLETED" };
			});

			completedQuests.push(...newCompletedQuests);
			sessionStorage.setItem(
				"remainingQuest",
				JSON.stringify(remainingplayerQuest),
			);
			sessionStorage.setItem("hasCompleted", JSON.stringify(completedQuests));

			console.log(newCompletedQuests);
			console.log(completedQuests, remainingplayerQuest);
		} else {
			console.log("No quests found in sessionStorage.");
		}
	}

	function loadUserSettings() {
		const hl = JSON.parse(localStorage.getItem("isHighlighted") || "false");
		const dialogOption = JSON.parse(
			localStorage.getItem("DialogSolverOption") || "false",
		);
		const toolTip = JSON.parse(localStorage.getItem("toolTip") || "false");
		setUiState({
			toolTipEnabled: toolTip,
			isHighlight: hl,
			dialogOption: dialogOption,
			userColor: localStorage.getItem("textColorValue") || "",
			userLabelColor: localStorage.getItem("labelColor") || "",
			userButtonColor: localStorage.getItem("buttonColor") || "",
			hasColor: !!localStorage.getItem("textColorValue"),
			hasLabelColor: !!localStorage.getItem("labelColor"),
			hasButtonColor: !!localStorage.getItem("buttonColor"),
		});
	}
	function HandleCompleteQuest() {
		loadPlayerQuests(questName);
	}
	useAlt1Listener(scrollNext);

	return (
		<>
			<div>
				<Suspense fallback={<div>Loading...</div>}>
					<Modal
						title="Underground Pass Grid"
						opened={openedGrid}
						onClose={closeGrid}
					>
						<UnderGroundPassGrid />
					</Modal>
				</Suspense>
				<Suspense fallback={<div>Loading...</div>}>
					<Modal title="Memorization" opened={openLGrid} onClose={closeLunarGrid}>
						<LunarGrid />
					</Modal>{" "}
				</Suspense>
				<Modal
					title="Notes"
					opened={isOpened}
					onClose={() => {
						handleFalse();
						closedNotes();
					}}
					styles={{
						title: {
							fontSize: "2.25rem",
							textAlign: "center",
						},
					}}
				>
					<UserNotes />
				</Modal>
				<Suspense fallback={<div>Loading...</div>}>
					<Modal opened={isPOGOpen} onClose={pogModClose}>
						<ColorCalculator />
					</Modal>
				</Suspense>
				<Modal
					id="Modal"
					title="Settings"
					opened={opened}
					onClose={() => {
						close();
						loadUserSettings();
					}}
					styles={{
						title: {
							fontSize: "2.25rem",
							textAlign: "center",
							color: uiState.hasColor ? uiState.userColor : "",
						},
					}}
				>
					<Settings />
				</Modal>
			</div>
			<QuestImageFetcher
				questName={questName}
				QuestListJSON={"./Quest Data/QuestImageList.json"}
			/>
			<div>
				<h2
					className="qpTitle"
					style={{ color: uiState.hasColor ? uiState.userColor : "" }}
				>
					{questName}
				</h2>
			</div>
			<></>

			<Flex
				className="flexedButtons"
				gap="sm"
				justify="flex-start"
				align="flex-start"
				direction="column"
				wrap="wrap"
			>
				<>
					<Tippy
						content={
							<Box
								p="md"
								bg="#2D413D"
								c="#FFFFFF"
								fw={500}
								fz="sm"
								lh={1.5}
								ta="center"
								w="auto"
								h="auto"
								style={{
									borderRadius: "5px",
									boxShadow: "initial",
									borderColor: "ActiveBorder",
								}}
							>
								Go back to the Quest Selection.
							</Box>
						}
						disabled={!uiState.toolTipEnabled}
					>
						<Button
							variant="outline"
							color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
							styles={{
								root: {
									paddingBottom: "1em",
								},
							}}
							onClick={() => handleBackButton(userID, questName)}
							leftSection={<IconArrowBack />}
						>
							Pick Another Quest
						</Button>
					</Tippy>
				</>

				{showStepReq ? (
					<>
						<Button
							variant="outline"
							color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
							onClick={() => {
								toggleShowStepReq();
							}}
						>
							Show Quest Steps
						</Button>
					</>
				) : (
					<Button
						variant="outline"
						color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
						onClick={toggleShowStepReq}
					>
						Show Quest Details
					</Button>
				)}
			</Flex>
			{showStepReq ? (
				<>
					<Suspense fallback={<div>Loading Accordion...</div>}>
						<QuestDetailContents
							QuestDetails={questDetails}
							uiState={uiState}
							expanded={expanded}
							setExpanded={setExpanded}
							ignoredRequirements={ignoredRequirements}
							skillLevels={skillLevels}
							completedQuests={completedQuests}
							history={history}
						/>
					</Suspense>
				</>
			) : (
				<>
					<Stepper
						active={active}
						orientation="vertical"
						onStepClick={setActiveAndScroll}
					>
						{questSteps?.map((value, index) => {
							// Log current step and imageList for debugging

							// Find image details matching this step
							const matchedImages = imageDetails.imageList?.filter(
								(img: { step: string }) => img.step === (index + 1).toString(),
							);

							return uiState.isHighlight ? (
								<Stepper.Step
									id={(index + 1).toString()}
									className="stepperStep"
									label={
										<>
											{`Step: ${index + 1}`}
											{matchedImages &&
												matchedImages.map(
													(
														_img: {
															src: string;
															height: number;
															width: number;
														},
														imgIndex: React.Key | null | undefined,
													) => (
														<ActionIcon
															key={imgIndex}
															onClick={() =>
																handlePopOut(index, _img.src, _img.height, _img.width)
															}
															styles={{
																root: {
																	marginLeft: ".313rem",
																	verticalAlign: "center",
																},
															}}
															color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
															size="sm"
															variant="outline"
															component="span" // Change to span to prevent button nesting
														>
															<IconPhotoFilled />
														</ActionIcon>
													),
												)}
										</>
									}
									key={index}
									color={active > index ? "#24BF58" : ""}
									styles={{
										stepDescription: {
											color:
												active > index
													? "#24BF58"
													: uiState.hasColor
														? uiState.userColor
														: "",
										},
										stepLabel: {
											color: uiState.hasLabelColor ? uiState.userLabelColor : "",
										},
									}}
									description={value}
									allowStepSelect={true}
								/>
							) : (
								<Stepper.Step
									id={(index + 1).toString()}
									className="stepperStep"
									label={
										<>
											{`Step: ${index + 1}`}
											{matchedImages &&
												matchedImages.map(
													(
														_img: {
															src: string;
															height: number;
															width: number;
														},
														imgIndex: React.Key | null | undefined,
													) => (
														<ActionIcon
															key={imgIndex}
															onClick={() =>
																handlePopOut(index, _img.src, _img.height, _img.width)
															}
															styles={{
																root: {
																	marginLeft: ".313rem",
																	verticalAlign: "center",
																},
															}}
															color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
															size="sm"
															variant="outline"
															component="span" // Change to span to prevent button nesting
														>
															<IconPhotoFilled />
														</ActionIcon>
													),
												)}
										</>
									}
									key={create_ListUUID()}
									styles={{
										stepLabel: {
											color: uiState.hasLabelColor ? uiState.userLabelColor : "",
										},
									}}
									description={value}
									onClick={() => setActiveAndScroll}
									allowStepSelect={true}
								/>
							);
						})}
					</Stepper>

					<></>
					{
						<div className="prevNextGroup">
							<div id="icons">
								<Tippy
									content={
										<Box
											p="md"
											bg="#2D413D"
											c="#FFFFFF"
											fw={500}
											fz="sm"
											lh={1.5}
											ta="center"
											w="auto"
											h="auto"
											style={{
												borderRadius: "5px",
												boxShadow: "initial",
												borderColor: "ActiveBorder",
											}}
										>
											Shows your personal Settings.
										</Box>
									}
									disabled={!uiState.toolTipEnabled}
								>
									<ActionIcon
										onClick={open}
										variant="outline"
										color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
										size={"sm"}
									>
										<IconSettings />
									</ActionIcon>
								</Tippy>
								<Tippy
									content={
										<Box
											p="md"
											bg="#2D413D"
											c="#FFFFFF"
											fw={500}
											fz="sm"
											lh={1.5}
											ta="center"
											w="auto"
											h="auto"
											style={{
												borderRadius: "5px",
												boxShadow: "initial",
												borderColor: "ActiveBorder",
											}}
										>
											Travels to RS3 Quest Buddy Discord.
										</Box>
									}
									disabled={!uiState.toolTipEnabled}
								>
									<ActionIcon
										onClick={openDiscord}
										variant="outline"
										color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
										size={"sm"}
									>
										<IconBrandDiscord />
									</ActionIcon>
								</Tippy>
								<Tippy
									content={
										<Box
											p="md"
											bg="#2D413D"
											c="#FFFFFF"
											fw={500}
											fz="sm"
											lh={1.5}
											ta="center"
											w="auto"
											h="auto"
											style={{
												borderRadius: "5px",
												boxShadow: "initial",
												borderColor: "ActiveBorder",
											}}
										>
											Take your personal Notes.
										</Box>
									}
									disabled={!uiState.toolTipEnabled}
								>
									<ActionIcon
										color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
										onClick={() => {
											isOpenNotes.current = true;
											openNotes();
										}}
										size={"sm"}
										variant="outline"
									>
										<IconPlus />
									</ActionIcon>
								</Tippy>
								<Tippy
									content={
										<Box
											p="md"
											bg="#2D413D"
											c="#FFFFFF"
											fw={500}
											fz="sm"
											lh={1.5}
											ta="center"
											w="auto"
											h="auto"
											style={{
												borderRadius: "5px",
												boxShadow: "initial",
												borderColor: "ActiveBorder",
											}}
										>
											Go back to the Quest Selection.
										</Box>
									}
									disabled={!uiState.toolTipEnabled}
								>
									<ActionIcon
										size="sm"
										variant="outline"
										color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
										onClick={() => handleBackButton(userID, questName)}
									>
										<IconArrowBack />
									</ActionIcon>
								</Tippy>
								<Tippy
									content={
										<Box
											p="md"
											bg="#2D413D"
											c="#FFFFFF"
											fw={500}
											fz="sm"
											lh={1.5}
											ta="center"
											w="auto"
											h="auto"
											style={{
												borderRadius: "5px",
												boxShadow: "initial",
												borderColor: "ActiveBorder",
											}}
										>
											Completes the quest to update Remaining Quests while sorted.
										</Box>
									}
									disabled={!uiState.toolTipEnabled}
								>
									<ActionIcon
										size={"sm"}
										variant="outline"
										color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
										onClick={HandleCompleteQuest}
									>
										<IconCheck color="#4EE669" />
									</ActionIcon>
								</Tippy>
								<Tippy
									content={
										<Box
											p="md"
											bg="#2D413D"
											c="#FFFFFF"
											fw={500}
											fz="sm"
											lh={1.5}
											ta="center"
											w="auto"
											h="auto"
											style={{
												borderRadius: "5px",
												boxShadow: "initial",
												borderColor: "ActiveBorder",
											}}
										>
											Travels to the Wiki for the current quest your on.
										</Box>
									}
									disabled={!uiState.toolTipEnabled}
								>
									<ActionIcon
										onClick={() => openWikiQuest(questName.trim())}
										variant="outline"
										color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
										size={"sm"}
									>
										<IconWorldWww />
									</ActionIcon>
								</Tippy>
								<ActionIcon
									onClick={openCoffee}
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									size={"sm"}
								>
									<IconCoffee />
								</ActionIcon>
							</div>

							{isPog && (
								<Button
									size="compact-sm"
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									onClick={pogModOpen}
								>
									Color Calculator
								</Button>
							)}
							{gridActive && (
								<Button
									size="compact-sm"
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									onClick={openGrid}
								>
									Underground Pass Grid
								</Button>
							)}
							{lunarGridActive && (
								<Button
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									onClick={openLunarGrid}
								>
									Memorization
								</Button>
							)}

							<div id="prev-next">
								<Button
									styles={{ root: {} }}
									size="compact-sm"
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									onClick={() => {
										handleStepChange(active);
										scrollNext();
									}}
								>
									Next Step
								</Button>
								<Button
									size="compact-sm"
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									onClick={() => {
										scrollPrev();
										handleStepChange(active - 1);
									}}
								>
									Prev Step
								</Button>
							</div>
						</div>
					}
				</>
			)}
		</>
	);
};

export default React.memo(QuestPage);
