import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
	Accordion,
	ActionIcon,
	Button,
	Flex,
	List,
	Modal,
	Stepper,
} from "@mantine/core";
import { Embla, useAnimationOffsetEffect } from "@mantine/carousel";
import * as a1lib from "alt1";
import {
	IconBrandDiscord,
	IconSettings,
	IconPlus,
	IconPhotoFilled,
} from "@tabler/icons-react";
import {
	QuestImageFetcher,
	UseImageStore,
} from "../Fetchers/handleNewImage.ts";
import {
	QuestStepFetcher,
	useQuestStepStore,
} from "./../Fetchers/FetchQuestSteps.tsx";
import {
	QuestDetailsFetcher,
	useQuestDetailsStore,
} from "./../Fetchers/FetchQuestDetails.ts";
import { useQuestControllerStore } from "./../Handlers/HandlerStore.ts";
import { createRoot } from "react-dom/client";
import { DiagReader } from "./dialogsolver.tsx";
import { Reader } from "./diagstartpage.tsx";
import { IconArrowBack } from "@tabler/icons-react";
import { Settings } from "./Settings.tsx";
import { useDisclosure } from "@mantine/hooks";
import useNotesDisclosure from "../Handlers/useDisclosure.ts";
import usePOGDisclosure from "./POGCalcDisclosure.tsx";
import { UserNotes } from "./userNotes.tsx";
import Grid from "./../Handlers/UndergroundPassGrid.tsx";
import LunarGrid from "../Handlers/LunarDiplomacyGrid.tsx";
import { Image } from "./ImageInterface.tsx";
import QuestIcon from "./../QuestIconEdited.png";
import ColorCalculator from "../Handlers/POGCalc.tsx";
import useGridDisclosure from "./useGridModal.tsx";
import useLunarGridDisclosure from "./useLunarDisclosure.tsx";

// Define constants for local storage keys to avoid typos and ensure consistency
const LOCAL_STORAGE_KEYS = {
	expandAllAccordions: "expandAllAccordions",
};

const QuestPage: React.FC = () => {
	// State and variables
	const qpname = useLocation();
	const TRANSITION_DURATION = 200;
	const ignoredRequirements = new Set([
		"Ironmen",
		"Ironman",
		"Be ",
		"Access",
		"Ability to",
		"Time Served",
		"Find",
		"Complete the base camp tutorial on Anachronia",
		"Rescue Mad Eadgar from the Troll Stronghold",
		"Able To",
		"Claim Kudos",
		"You must be using the standard spells or be able to use Spellbook Swap",
		"Completion of",
		"To make",
		"Achieve",
		"Bring Leela to Senliten's tomb",
		"If Icthlarin's Little Helper was completed prior to the addition of Stolen Hearts and Diamond in the Rough, they must be completed before Contact! can be started (or completed).",
		"For Ironmen",
	]);
	const [embla] = useState<Embla | null>(null);
	useAnimationOffsetEffect(embla, TRANSITION_DURATION);
	let { questName, modified } = qpname.state;
	const [opened, { open, close }] = useDisclosure(false);
	const [openedGrid, { openGrid, closeGrid }] = useGridDisclosure(false);
	const [openLGrid, { openLunarGrid, closeLunarGrid }] =
		useLunarGridDisclosure(false);
	const [active, setActive] = useState(-1);
	const [highestStepVisited, setHighestStepVisited] = useState(active);
	const questlistJSON = "./QuestList.json";
	let textfile = modified + "info.txt";
	const reader = new DiagReader();
	const hist = useNavigate();
	const details = useQuestStepStore();
	const imageDetails = UseImageStore();
	const stepRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
	const QuestDetails = useQuestDetailsStore.getState().questDetails;
	const [isHighlight, setIsHighlight] = useState(false);
	let isPog = false;
	let gridActive = false;
	let lunarGridActive = false;
	const [stepHidden, setStepHidden] = useState(false);
	const [userColor, setUserColor] = useState("");
	const [userLabelColor, setUserLabelColor] = useState("");
	const [userButtonColor, setUserButtonColor] = useState("");
	const [hasColor, setHasColor] = useState(false);
	const [hasButtonColor, setHasButtonColor] = useState(false);
	const [hasLabelColor, setHasLabelColor] = useState(false);
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
	const handleBackButton = () => {
		// Navigate to home
		hist("/");

		// Check if popOutWindow exists and close it
		if (handles.popOutWindow) {
			handles.popOutWindow.close();
		} else {
			console.warn("popOutWindow is null or undefined.");
		}
	};
	function create_ListUUID() {
		var dt = new Date().getTime();
		var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			function (c) {
				var r = (dt + Math.random() * 16) % 16 | 0;
				dt = Math.floor(dt / 16);
				return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
			}
		);
		return uuid;
	}

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
				`width=${_imgWidth}, height=${_imgHeight + 100}`
			);
			if (newWindow) {
				// Set the pop-out window and hide buttons in the current window
				handles.setPopOutWindow(newWindow);
				handles.setButtonVisible(false);
				handles.setPopOutClicked(false);

				newWindow.document.write(
					`
    <!DOCTYPE html>
    <html lang="es-ES">
        <head>
            <link rel="icon" href="./../assets/rs3buddyicon.png" type="image/x-icon" />
            <title>Quest Image</title>
        </head>
        <body>
        </body>
    </html>
`
				);
				// Render the QuestControls component into the new window
				const container: HTMLDivElement = newWindow.document.createElement("div");
				container.className = ".QuestPageImageCaro";
				newWindow.document.body.appendChild(container);
				newWindow.document.title = "Quest Images";

				container.style.backgroundImage = "./../assets/background.png";
				// Set initial content for the new window
				const initialContentContainer = newWindow.document.createElement("div");
				initialContentContainer.id = "initialContentContainer";
				newWindow.document.body.appendChild(initialContentContainer);
				const domNode: any = newWindow.document.getElementById(
					"initialContentContainer"
				);
				const root = createRoot(domNode);
				const iconLink = newWindow.document.createElement("link");
				newWindow.document.head.appendChild(iconLink);

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

				// Render QuestControls into the new window
				const matchingImage = imageDetails.imageList.find((image) =>
					image.src.includes(_imgSrc)
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
	const updateButtonVis = () => {
		const prevNextButtons = document.querySelector(
			".prevNextGroup"
		) as HTMLElement;
		const imageCaro = document.querySelector(
			".QuestPageImageCaro"
		) as HTMLElement;

		if (prevNextButtons && imageCaro) {
			// Check if elements exist
			const prevNextRect = prevNextButtons.getBoundingClientRect();
			const imageCaroRect = imageCaro.getBoundingClientRect();

			if (
				prevNextRect.right > imageCaroRect.left &&
				prevNextRect.left < imageCaroRect.right &&
				prevNextRect.bottom > imageCaroRect.top &&
				prevNextRect.top < imageCaroRect.bottom
			) {
				prevNextButtons.style.visibility = "hidden"; // Hide the prevNextButtons
			} else {
				prevNextButtons.style.visibility = "visible"; // Show the prevNextButtons
			}
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

	const useAlt1Listener = (callback: () => void) => {
		useEffect(() => {
			const handleAlt1Pressed = () => {
				callback();
			};

			// Attach event listener once when component mounts

			a1lib.on("alt1pressed", handleAlt1Pressed);

			// Clean up the listener on unmount
			return () => {
				a1lib.removeListener("alt1pressed", handleAlt1Pressed);
			};
		}, [callback]); // Only re-run if callback changes
	};
	useEffect(() => {
		const hl = localStorage.getItem("isHighlighted");
		const rs = localStorage.getItem("removeStep");
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
		if (hl !== null) {
			const highlight = JSON.parse(hl);
			setIsHighlight(highlight);
		}
		if (rs !== null) {
			const removeStep = JSON.parse(rs);
			setStepHidden(removeStep);
		}
	}, [stepHidden, isHighlight, showStepReq, opened]);

	useEffect(() => {
		stepRefs.current = Array.from({ length: details.stepDetails.length }, () =>
			React.createRef()
		);
	}, [details.stepDetails.length]);

	function handleFalse() {
		isOpenNotes.current = false;
	}
	function openDiscord(): void {
		const newWindow = window.open(
			"https://discord.gg/qFftZF7Usa",
			"_blank",
			"noopener,noreferrer"
		);
		if (newWindow) newWindow.opener = null;
	}
	useAlt1Listener(scrollNext);
	return (
		<>
			<Reader reader={reader} questName={questName} />
			<div>
				<Modal
					title="Underground Pass Grid"
					opened={openedGrid}
					onClose={closeGrid}
				>
					<Grid />
				</Modal>
				<Modal title="Memorization" opened={openLGrid} onClose={closeLunarGrid}>
					<LunarGrid />
				</Modal>
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
				<Modal opened={isPOGOpen} onClose={pogModClose}>
					<ColorCalculator />
				</Modal>
				<Modal
					id="Modal"
					title="Settings"
					opened={opened}
					onClose={() => {
						close();
					}}
					styles={{
						title: {
							fontSize: "2.25rem",
							textAlign: "center",
							color: hasColor ? userColor : "",
						},
					}}
				>
					<Settings />
				</Modal>
			</div>

			<QuestImageFetcher
				questName={questName}
				QuestListJSON={"./QuestImageList.json"}
			/>
			<QuestStepFetcher textfile={textfile} questStepJSON={questlistJSON} />
			<QuestDetailsFetcher questName={questName} />
			{window.addEventListener("scroll", updateButtonVis)}
			<div>
				<h2 className="qpTitle" style={{ color: hasColor ? userColor : "" }}>
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
						color={hasButtonColor ? userButtonColor : ""}
						onClick={handleBackButton}
						leftSection={<IconArrowBack />}
					>
						Pick Another Quest
					</Button>
				</>

				{showStepReq ? (
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : ""}
						onClick={() => {
							toggleShowStepReq();
						}}
					>
						Show Quest Steps
					</Button>
				) : (
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : ""}
						onClick={toggleShowStepReq}
					>
						Show Quest Details
					</Button>
				)}
			</Flex>
			{showStepReq && Array.isArray(QuestDetails) ? (
				<>
					<Accordion
						multiple
						defaultValue={expanded}
						onChange={setExpanded}
						chevron={
							<Image src={QuestIcon} alt="Quest Icon" width="20px" height="20px" />
						}
					>
						<Accordion.Item key={"item-1"} value="item-1">
							<Accordion.Control
								styles={{
									control: { color: hasLabelColor ? userLabelColor : "" },
								}}
							>
								Requirements
							</Accordion.Control>
							<Accordion.Panel>
								<div>
									<ul>
										{QuestDetails.map((quest, questIndex) => {
											return (
												<React.Fragment key={questIndex}>
													{quest.Requirements.map((requirement, requirementIndex) => {
														// Combine questIndex and requirementIndex to create a unique key
														const uniqueKey = `${questIndex}-${requirementIndex}`;
														const hasSkill = skillLevels.some((value) => {
															const [skillValueStr, skillType] = value.split(" ");
															const [requirementValueStr, requirementType] =
																requirement.split(" ");

															const skillValue = parseInt(skillValueStr, 10);
															const requirementValue = parseInt(requirementValueStr, 10);

															console.log(
																"Skill:",
																skillValueStr,
																skillType,
																"Requirement:",
																requirementValueStr,
																requirementType
															);

															const isSkillValid =
																!isNaN(skillValue) && !isNaN(requirementValue);
															const isTypeMatch = skillType === requirementType;

															if (isSkillValid && isTypeMatch) {
																return skillValue >= requirementValue;
															}

															return false;
														});

														const needLeela =
															requirement ===
																"Fully restore Senliten from the 'Missing My Mummy' quest" ||
															"Bring Leela to Senliten's tomb";
														const needJunglePotion =
															requirement ===
															"Jungle Potion is only required if clean volencia moss is a requested item during the quest";
														let abilityToEnterMort = false;

														if (needLeela) {
															const hasMMM =
																completedQuests &&
																completedQuests.some((value) => {
																	if (value && typeof value === "object") {
																		return (
																			(value as { title?: string }).title === "Missing My Mummy"
																		);
																	}
																});
															if (hasMMM) {
																//mmm = true;
															}
														}
														let junglePotion = false;
														if (needJunglePotion) {
															const hasJunglePotion =
																completedQuests &&
																completedQuests.some((value) => {
																	if (value && typeof value === "object" && "title" in value) {
																		return (
																			(value as { title?: string }).title === "Jungle Potion"
																		);
																	}
																});
															if (hasJunglePotion) {
																junglePotion = true;
															}
														}

														const isComplete =
															completedQuests &&
															completedQuests.some((value) => {
																if (value && typeof value === "object" && "title" in value) {
																	return (value as { title?: string }).title === requirement;
																}
																return false;
															});

														let color = "#C64340"; // Default to red

														if (isComplete) {
															color = "#24BF58"; // Green
														}
														if (junglePotion) {
															color = "#24BF58";
														}
														if (abilityToEnterMort) {
															color = "#24BF58";
														}

														const requirementParts = requirement.split(" ");
														const firstPart: number = parseInt(requirementParts[0]);

														return (
															<li
																key={uniqueKey}
																style={{
																	display: "block",
																}}
															>
																{!isNaN(firstPart) ||
																requirement === "None" ||
																Array.from(ignoredRequirements).some((prefix) =>
																	requirement.startsWith(prefix)
																) ? (
																	<span style={{ color: hasSkill ? "#24BF58" : "#C64340" }}>
																		{requirement}
																	</span>
																) : (
																	<NavLink
																		to="/QuestPage"
																		onClick={() => {
																			history.go(0);
																		}}
																		state={{
																			questName: requirement,
																			modified: requirement.toLowerCase().replace(/[!,`']/g, ""),
																		}}
																		style={{
																			display: "block",
																			color: color,

																			textDecoration: "none",
																		}}
																	>
																		<span>{requirement}</span>
																	</NavLink>
																)}
															</li>
														);
													})}
												</React.Fragment>
											);
										})}
									</ul>
								</div>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item key={"item-2"} value="item-2">
							<Accordion.Control
								className="AccordianControl"
								styles={{
									control: { color: hasLabelColor ? userLabelColor : "" },
								}}
							>
								Start Point
							</Accordion.Control>
							<Accordion.Panel c={hasColor ? userColor : ""}>
								<div>
									{QuestDetails.map((value) => {
										return value.StartPoint;
									})}
								</div>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item key={"item-3"} value="item-3">
							<Accordion.Control
								className="AccordianControl"
								styles={{
									control: { color: hasLabelColor ? userLabelColor : "" },
								}}
							>
								Is This a Members Quest?
							</Accordion.Control>
							<Accordion.Panel c={hasColor ? userColor : ""}>
								<div>
									{QuestDetails.map((value) => {
										return value.MemberRequirement;
									})}
								</div>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item key={"item-4"} value="item-4">
							<Accordion.Control
								className="AccordianControl"
								styles={{
									control: { color: hasLabelColor ? userLabelColor : "" },
								}}
							>
								How Long is This Quest?
							</Accordion.Control>
							<Accordion.Panel c={hasColor ? userColor : ""}>
								<div>
									{QuestDetails.map((value) => {
										return value.OfficialLength;
									})}
								</div>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item key={"item-5"} value="item-5">
							<Accordion.Control
								className="AccordianControl"
								styles={{
									control: { color: hasLabelColor ? userLabelColor : "" },
								}}
							>
								Items You Definitely Need
							</Accordion.Control>
							<Accordion.Panel c={hasColor ? userColor : ""}>
								<div>
									<List listStyleType="none">
										{QuestDetails.map((quest, questIndex) => {
											return (
												<React.Fragment key={questIndex}>
													{quest.ItemsRequired.map((item, itemIndex) => {
														// Combine questIndex and itemIndex to create a unique key
														const uniqueKey = `${questIndex}-${itemIndex}`;

														return (
															<List.Item key={uniqueKey}>
																{"- "}
																{item}
															</List.Item>
														);
													})}
												</React.Fragment>
											);
										})}
									</List>
								</div>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item key={"item-6"} value="item-6">
							<Accordion.Control
								className="AccordianControl"
								title="Items You Might Need"
								styles={{
									control: { color: hasLabelColor ? userLabelColor : "" },
								}}
							>
								Items You Might Need
							</Accordion.Control>
							<Accordion.Panel c={hasColor ? userColor : ""}>
								<div>
									<List listStyleType="none">
										{QuestDetails.map((quest, questIndex) => {
											return (
												<React.Fragment key={questIndex}>
													{quest.Recommended.map((item, itemIndex) => {
														// Combine questIndex and itemIndex to create a unique key
														const uniqueKey = `${questIndex}-${itemIndex}`;

														return (
															<List.Item key={uniqueKey}>
																{"- "}
																{item}
															</List.Item>
														);
													})}
												</React.Fragment>
											);
										})}
									</List>
								</div>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item key={"item-7"} value="item-7">
							<Accordion.Control
								className="AccordianControl"
								styles={{
									control: { color: hasLabelColor ? userLabelColor : "" },
								}}
							>
								Enemies To Look Out For
							</Accordion.Control>
							<Accordion.Panel c={hasColor ? userColor : ""}>
								<div>
									<List listStyleType="none">
										{QuestDetails.map((quest, questIndex) => (
											<React.Fragment key={questIndex}>
												{quest.EnemiesToDefeat.map((value, enemiesIndex) => {
													const UniqueID = `${questIndex}-${enemiesIndex}`;
													return (
														<List.Item key={UniqueID}>
															{"- "}
															{value}
														</List.Item>
													);
												})}
											</React.Fragment>
										))}
									</List>
								</div>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				</>
			) : (
				<>
					<Stepper
						className="stepperContainer"
						active={active}
						orientation="vertical"
						onStepClick={setActiveAndScroll}
					>
						{details.stepDetails.map((value, index) => {
							// Log current step and imageList for debugging

							// Find image details matching this step
							const matchedImages = imageDetails.imageList.filter(
								(img) => img.step === (index + 1).toString()
							);

							return isHighlight ? (
								<Stepper.Step
									id={(index + 1).toString()}
									className="stepperStep"
									label={
										<>
											{`Step: ${index + 1}`}
											{matchedImages &&
												matchedImages.map((_img, imgIndex) => (
													<ActionIcon
														key={imgIndex} // Unique key for each button
														onClick={() =>
															handlePopOut(index, _img.src, _img.height, _img.width)
														}
														styles={{
															root: {
																marginLeft: ".313rem",
																verticalAlign: "center",
															},
														}}
														color={hasButtonColor ? userButtonColor : ""}
														size={"sm"}
														variant="outline"
													>
														<IconPhotoFilled />
													</ActionIcon>
												))}
										</>
									}
									key={index}
									color={active > index ? "#24BF58" : ""}
									styles={{
										stepDescription: {
											color: active > index ? "#24BF58" : hasColor ? userColor : "",
										},
										stepLabel: {
											color: hasLabelColor ? userLabelColor : "",
										},
									}}
									orientation="vertical"
									description={value}
									onClick={() => setActiveAndScroll(index)}
									allowStepSelect={true}
								/>
							) : stepHidden ? (
								<Stepper.Step
									id={(index + 1).toString()}
									className="stepperStep"
									label={
										<>
											{`Step: ${index + 1}`}
											{matchedImages &&
												matchedImages.map((_img, imgIndex) => (
													<ActionIcon
														key={imgIndex} // Unique key for each button
														onClick={() =>
															handlePopOut(index, _img.src, _img.height, _img.width)
														}
														styles={{
															root: {
																marginLeft: ".313rem",
																verticalAlign: "center",
															},
														}}
														color={hasButtonColor ? userButtonColor : ""}
														size={"sm"}
														variant="outline"
													>
														<IconPhotoFilled />
													</ActionIcon>
												))}
										</>
									}
									key={create_ListUUID()}
									styles={{
										stepDescription: {
											visibility: active > index ? "hidden" : "visible",
											color: hasColor ? userColor : "",
										},
										stepLabel: {
											visibility: active > index ? "hidden" : "visible",
										},
									}}
									orientation="vertical"
									description={value}
									onClick={() => setActiveAndScroll}
									allowStepSelect={ShouldAllowStep(index)}
								/>
							) : (
								<Stepper.Step
									id={(index + 1).toString()}
									className="stepperStep"
									label={
										<>
											{`Step: ${index + 1}`}
											{matchedImages &&
												matchedImages.map((_img, imgIndex) => (
													<ActionIcon
														key={imgIndex} // Unique key for each button
														onClick={() =>
															handlePopOut(index, _img.src, _img.height, _img.width)
														}
														styles={{
															root: {
																marginLeft: ".313rem",
																verticalAlign: "center",
															},
														}}
														color={hasButtonColor ? userButtonColor : ""}
														size={"sm"}
														variant="outline"
													>
														<IconPhotoFilled />
													</ActionIcon>
												))}
										</>
									}
									key={create_ListUUID()}
									styles={{
										stepLabel: {
											color: hasLabelColor ? userLabelColor : "",
										},
									}}
									orientation="vertical"
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
									color={hasButtonColor ? userButtonColor : ""}
									size={"sm"}
								>
									<IconSettings />
								</ActionIcon>
								<ActionIcon
									onClick={openDiscord}
									variant="outline"
									color={hasButtonColor ? userButtonColor : ""}
									size={"sm"}
								>
									<IconBrandDiscord />
								</ActionIcon>
								<ActionIcon
									color={hasButtonColor ? userButtonColor : ""}
									onClick={() => {
										isOpenNotes.current = true;
										openNotes();
									}}
									size={"sm"}
									variant="outline"
								>
									<IconPlus />
								</ActionIcon>
							</div>
							{isPog && (
								<Button
									variant="outline"
									color={hasButtonColor ? userButtonColor : ""}
									onClick={pogModOpen}
								>
									Color Calculator
								</Button>
							)}
							{gridActive && (
								<Button
									variant="outline"
									color={hasButtonColor ? userButtonColor : ""}
									onClick={openGrid}
								>
									Underground Pass Grid
								</Button>
							)}
							{lunarGridActive && (
								<Button
									variant="outline"
									color={hasButtonColor ? userButtonColor : ""}
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
									color={hasButtonColor ? userButtonColor : ""}
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
									color={hasButtonColor ? userButtonColor : ""}
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

export default QuestPage;
