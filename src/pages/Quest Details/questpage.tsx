import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
	Accordion,
	ActionIcon,
	Button,
	Flex,
	List,
	Modal,
	Stepper,
} from "@mantine/core";
import "@mantine/core/styles/Stepper.css";
import "@mantine/core/styles/Accordion.css";
import "@mantine/core/styles.css";
require("./../../assets/QuestIconEdited.png");
import {
	IconBrandDiscord,
	IconSettings,
	IconPlus,
	IconPhotoFilled,
} from "@tabler/icons-react";

import {
	QuestStepFetcher,
	useQuestStepStore,
} from "./../../Fetchers/FetchQuestSteps";
import {
	QuestDetailsFetcher,
	useQuestDetailsStore,
} from "./../../Fetchers/FetchQuestDetails";
import { useQuestPaths } from "./../../Fetchers/useQuestData";
import { useQuestControllerStore } from "./../../Handlers/HandlerStore";
import { createRoot } from "react-dom/client";
import { DiagReader } from "./dialogsolver";
import { Reader } from "./diagstartpage";
import { IconArrowBack } from "@tabler/icons-react";
import { Settings } from "./../Settings/Settings";
import { useDisclosure } from "@mantine/hooks";
import useNotesDisclosure from "./Quest Detail Components/useDisclosure";
import usePOGDisclosure from "./Quest Detail Components/POGCalcDisclosure";
import { UserNotes } from "./../Settings/userNotes";
import { Image } from "./Quest Detail Components/ImageInterface";
import useGridDisclosure from "./Quest Detail Components/useGridModal";
import useLunarGridDisclosure from "./Quest Detail Components/useLunarDisclosure";
import { useQuestPageFunctions } from "./questPageFunctions";
import {
	QuestImageFetcher,
	UseImageStore,
} from "./../../Fetchers/handleNewImage";
const UnderGroundPassGrid = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./Quest Detail Components/UndergroundPassGrid").default,
			});
		})
);
const LunarGrid = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./Quest Detail Components/LunarDiplomacyGrid").default,
			});
		})
);
const ColorCalculator = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({ default: require("./Quest Detail Components/POGCalc").default });
		})
);
const QuestDetailContents = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./Quest Detail Components/QuestDetailsAccordion").default,
			});
		})
);
const QuestPage: React.FC = () => {
	// Define constants for local storage keys to avoid typos and ensure consistency
	const { questPaths, QuestDataPaths, getQuestSteps } = useQuestPaths();
	const {
		ignoredRequirements,
		create_ListUUID,
		useAlt1Listener,
		handleBackButton,
		openDiscord,
	} = useQuestPageFunctions();
	const location = useLocation();
	const LOCAL_STORAGE_KEYS = {
		expandAllAccordions: "expandAllAccordions",
	};
	const qpname = useLocation();
	let { questName, modified } = qpname.state;
	const [opened, { open, close }] = useDisclosure(false);
	const [openedGrid, { openGrid, closeGrid }] = useGridDisclosure(false);
	const [openLGrid, { openLunarGrid, closeLunarGrid }] =
		useLunarGridDisclosure(false);
	const [active, setActive] = useState(-1);
	const [highestStepVisited, setHighestStepVisited] = useState(active);
	const questlistJSON = "./Quest Data/QuestPaths.json";
	let textfile = modified + "info.txt";
	const reader = new DiagReader();
	const details = useQuestStepStore();
	const imageDetails = UseImageStore();
	const stepRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
	const QuestDetails = useQuestDetailsStore.getState().questDetails;
	let isPog = false;
	let gridActive = false;
	let lunarGridActive = false;
	const [uiState, setUiState] = useState({
		isHighlight: false,
		hasColor: false,
		hasButtonColor: false,
		hasLabelColor: false,
		userColor: "",
		userLabelColor: "",
		userButtonColor: "",
	});

	let [isPOGOpen, { pogModOpen, pogModClose }] = usePOGDisclosure(false);
	let [isOpened, { openNotes, closedNotes }] = useNotesDisclosure(false);
	const isOpenNotes = useRef(false);
	// const finder = new diagFinder();
	const { showStepReq, toggleShowStepReq } = useQuestControllerStore();
	const handles = useQuestControllerStore();
	const [skillLevels, setSkillLevels] = useState<string[]>([]);
	const [completedQuests, setCompleteQuests] = useState<string[] | null>(null);
	const storedExpandAll = localStorage.getItem(
		LOCAL_STORAGE_KEYS.expandAllAccordions
	);

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
		console.log("Component rendered!");
	}, []);
	useEffect(() => {
		// Combine fetching quest paths and steps
		QuestDataPaths();
		if (questPaths) {
			getQuestSteps(questName);
		}
	}, [questPaths]);
	useEffect(() => {
		const completedQuests = window.sessionStorage.getItem("hasCompleted");
		const skill = sessionStorage.getItem("skillLevels");

		if (completedQuests !== null && skill !== null) {
			const parsedQuests = JSON.parse(completedQuests);

			const parsedSkills = JSON.parse(skill);

			if (
				parsedQuests !== null &&
				Array.isArray(parsedQuests) &&
				parsedSkills !== null &&
				Array.isArray(parsedSkills)
			) {
				setCompleteQuests(parsedQuests);
				setSkillLevels(parsedSkills);
			} else {
				console.error("Invalid or non-array data in sessionStorage");
			}
		} else {
			console.error("No data found in sessionStorage");
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

	if (questName.trim() === "The Prisoner of Glouphrie") {
		isPog = true;
	}
	if (questName.trim() === "Lunar Diplomacy") {
		lunarGridActive = true;
	}
	if (
		questName.trim() === "Underground Pass" ||
		questName.trim() === "Regicide"
	) {
		gridActive = true;
	}
	if (
		questName ==
		"Jungle Potion is only required if clean volencia moss is a requested item during the quest"
	) {
		questName = "Jungle Potion";
		textfile = "junglepotioninfo.txt";
	}
	if (questName == "Fully restore Senliten from the 'Missing My Mummy' quest") {
		questName = "Missing My Mummy";
		textfile = "missingmymummyinfo.txt";
	}
	if (questName == "Bring Leela to Senliten's tomb") {
		questName = "Missing My Mummy";
		textfile = "missingmymummyinfo.txt";
	}
	const clearAllIntervals = () => {
		clearTimeout(reader.timeoutID);
		reader.intervalIds.forEach(clearInterval);
		reader.intervalIds = [];
	};

	function copyStyle(
		_from: Window,
		to: Window,
		node: HTMLStyleElement | HTMLLinkElement
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
	const ShouldAllowStep = (step: number) => {
		return highestStepVisited >= step && active !== step;
	};

	const handlePopOut = (
		_index: number,
		_imgSrc: string,
		_imgHeight: number,
		_imgWidth: number
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
				`width=${_imgWidth}, height=${_imgHeight + 100},`
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
						"</body></html>"
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
					"initialContentContainer"
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
					(image: { src: string | string[] }) => image.src.includes(_imgSrc) // image.src should be a string
				);
				root.render(
					<>
						<div
							style={{
								paddingTop: "1rem",
								alignContent: "center",
							}}
						>
							<img src={matchingImage?.src} />
						</div>
					</>
				);
			}
		}
	};
	const setActiveAndScroll = (nextStep: number): void => {
		if (nextStep >= 0 && nextStep < details.stepDetails.length) {
			setActive(nextStep);
			setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
			scrollIntoView(nextStep);
		}
	};

	const handleStepChange = (nextStep: number) => {
		const stepLength = details.stepDetails.length;
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
			if (nextStep <= details.stepDetails.length) {
				scrollIntoView(nextStep);

				return nextStep;
			}
			return prevActive;
		});
	};

	const scrollIntoView = (step: number) => {
		const element = document.getElementById(step.toString());
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};
	const loadUserSettings = () => {
		const hl = JSON.parse(localStorage.getItem("isHighlighted") || "false");
		const rs = JSON.parse(localStorage.getItem("removeStep") || "false");

		setUiState({
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
		loadUserSettings();
	}, [location.key]);
	useEffect(() => {
		stepRefs.current = Array.from({ length: details.stepDetails.length }, () =>
			React.createRef()
		);
	}, [details.stepDetails.length]);

	function handleFalse() {
		isOpenNotes.current = false;
	}
	useAlt1Listener(scrollNext);
	return (
		<>
			<Reader reader={reader} questName={questName} />
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
			<QuestStepFetcher textfile={textfile} questStepJSON={questlistJSON} />
			<QuestDetailsFetcher questName={questName} />

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
					<Button
						variant="outline"
						color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
						styles={{
							root: {
								paddingBottom: "1em",
							},
						}}
						onClick={handleBackButton}
						leftSection={<IconArrowBack />}
					>
						Pick Another Quest
					</Button>
				</>

				{showStepReq ? (
					<Button
						variant="outline"
						color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
						onClick={() => {
							toggleShowStepReq();
						}}
					>
						Show Quest Steps
					</Button>
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
			{showStepReq && Array.isArray(QuestDetails) ? (
				<>
					<Suspense fallback={<div>Loading Accordion...</div>}>
						<QuestDetailContents
							QuestDetails={QuestDetails}
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
						{details.stepDetails.map((value, index) => {
							// Log current step and imageList for debugging

							// Find image details matching this step
							const matchedImages = imageDetails.imageList?.filter(
								(img: { step: string }) => img.step === (index + 1).toString()
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
														imgIndex: React.Key | null | undefined
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
													)
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
									onClick={() => setActiveAndScroll(index)}
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
														imgIndex: React.Key | null | undefined
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
													)
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
									allowStepSelect={ShouldAllowStep(index)}
								/>
							);
						})}
					</Stepper>

					<></>
					{
						<div className="prevNextGroup">
							<div id="icons">
								<ActionIcon
									onClick={open}
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									size={"sm"}
								>
									<IconSettings />
								</ActionIcon>
								<ActionIcon
									onClick={openDiscord}
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									size={"sm"}
								>
									<IconBrandDiscord />
								</ActionIcon>
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
								<ActionIcon
									size="sm"
									variant="outline"
									color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
									onClick={handleBackButton}
								>
									<IconArrowBack />
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
