import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
	Accordion,
	ActionIcon,
	Button,
	Flex,
	List,
	MantineProvider,
	Modal,
	Stepper,
} from "@mantine/core";
import { Carousel, Embla, useAnimationOffsetEffect } from "@mantine/carousel";

import {
	IconBrandDiscord,
	IconArrowLeft,
	IconArrowRight,
	IconSettings,
	IconPlus,
} from "@tabler/icons-react";

import {
	QuestImageFetcher,
	UseImageStore,
} from "./../Fetchers/FetchQuestImages.ts";
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

import { Image } from "./ImageInterface.tsx";
import QuestIcon from "./../QuestIconEdited.png";
import ColorCalculator from "../Handlers/POGCalc.tsx";

const QuestPage: React.FC = () => {
	// State and variables
	const qpname = useLocation();
	const TRANSITION_DURATION = 200;

	const [embla, setEmbla] = useState<Embla | null>(null);

	useAnimationOffsetEffect(embla, TRANSITION_DURATION);
	let { questName, modified } = qpname.state;
	const [opened, { open, close }] = useDisclosure(false);
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
	const [stepHidden, setStepHidden] = useState(false);
	const buttonRef = useRef<HTMLButtonElement | null>(null);

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
		hist("/");
		handles.popOutWindow!.close();
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

	const carouselRef = useRef<HTMLDivElement | null>(null);

	if (questName == "Ability to enter Morytania") {
		questName = "Priest in Peril";
		textfile = "priestinperilinfo.txt";
	}

	if (questName.trim() == "The Prisoner of Glouphrie") {
		isPog = true;
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
	// const capture = a1lib.captureHoldFullRs();
	// finder.find();
	// const title = finder.readTitle(capture);
	// console.log(title);
	// Use useEffect to scroll when viewQuestImage is true

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
	const scrollNext = (): void => {
		const nextStep = active + 1;
		if (nextStep <= details.stepDetails.length) {
			scrollIntoView(nextStep);
		}
	};

	const scrollPrev = (): void => {
		const prevStep = active - 1;

		if (prevStep > 0) {
			scrollIntoView(prevStep);
		}
	};

	const scrollIntoView = (step: number) => {
		const element = document.getElementById(step.toString());
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};
	const ShouldAllowStep = (step: number) => {
		step = step;
		return highestStepVisited >= step && active !== step;
	};

	const handlePopOut = () => {
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
				"width=420, height=412"
			)!;
			if (newWindow) {
				// Set the pop-out window and hide buttons in the current window
				handles.setPopOutWindow(newWindow);
				handles.setButtonVisible(false);
				handles.setPopOutClicked(false);

				newWindow.document.write(
					`
    <!DOCTYPE html>
    <html>
        <head>
            <link rel="icon" href="./../assets/rs3buddyicon.png" type="image/x-icon" />
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

						console.log("Copying styles:", stylesheetsArray);

						stylesheetsArray.forEach(function (stylesheet: HTMLStyleElement) {
							console.log("Copying stylesheet:", stylesheet);
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

				root.render(
					<>
						<h2>Quest Images</h2>
						<h4>Message Notice</h4>
						<p>
							Notice Time Remaining: 5 days: This Quest Images pop out can be
							minimized.You can click the Quest Images button again to completely close
							the window. To remaximize find it in your primary monitors window (Bottom
							Left), click the double squares to remaximize to the width you set the
							window!
						</p>
						{imageDetails.imageList.length > 0 && (
							<MantineProvider defaultColorScheme="dark">
								<Carousel
									getEmblaApi={setEmbla}
									speed={100}
									withIndicators={false}
									orientation="horizontal"
									styles={{ root: { width: "420px" } }}
									nextControlIcon={<IconArrowRight size={16} />}
									previousControlIcon={<IconArrowLeft size={16} />}
									className="QuestPageImageCaro"
									includeGapInSize={true}
									containScroll={"trimSnaps"}
									ref={carouselRef}
								>
									{imageDetails.imageList.map((src, index) => (
										<Carousel.Slide key={index}>
											<img src={src} />
										</Carousel.Slide>
									))}
								</Carousel>
							</MantineProvider>
						)}
						{!imageDetails.imageList.length && <h2>No Images Found</h2>}
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
	return (
		<>
			<Reader reader={reader} questName={questName} />
			<div>
				<Modal
					title="Notes"
					opened={isOpened}
					onClose={() => {
						handleFalse();
						closedNotes();
					}}
					styles={{
						title: {
							fontSize: "34px",
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
							fontSize: "34px",
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
				{isPog && (
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : ""}
						onClick={pogModOpen}
					>
						Color Calculator
					</Button>
				)}

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
						defaultValue=""
						chevron={
							<Image src={QuestIcon} alt="Quest Icon" width="20px" height="20px" />
						}
					>
						<Accordion.Item key={1} value="Click to Show Quest Requirements">
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
															const splitValue = value.split(" ");
															const isNumber = !isNaN(parseFloat(splitValue[0]));
															const reqStr = requirement.split(" ");
															const isReqNum = !isNaN(parseFloat(reqStr[0]));

															if (isNumber && isReqNum) {
																const numberPart = parseInt(splitValue[0]);
																const requirementNumber = parseInt(reqStr[0]);

																// Compare the extracted number
																return numberPart > requirementNumber;
															}
															return false;
														});
														const needLeela =
															requirement ===
																"Fully restore Senliten from the 'Missing My Mummy' quest" ||
															"Bring Leela to Senliten's tomb";
														const needMort = requirement === "Ability to enter Morytania";
														const needJunglePotion =
															requirement ===
															"Jungle Potion is only required if clean volencia moss is a requested item during the quest";
														let abilityToEnterMort = false;

														//let mmm = false;
														if (needMort) {
															const hasPriestInPeril =
																completedQuests &&
																completedQuests.some((value) => {
																	if (
																		value &&
																		typeof value === "object" &&
																		"title" in value &&
																		value !== null
																	) {
																		return (
																			(value as { title?: string }).title === "Priest in Peril"
																		);
																	}
																});
															if (hasPriestInPeril) {
																abilityToEnterMort = true;
															}
														}
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
																	if (
																		value &&
																		typeof value === "object" &&
																		"title" in value &&
																		value !== null
																	) {
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
																if (
																	value &&
																	typeof value === "object" &&
																	"title" in value &&
																	value !== null
																) {
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
																{!isNaN(firstPart) || requirement === "None" ? (
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
						<Accordion.Item key={2} value="Click to Show Start Point">
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
						<Accordion.Item key={3} value="Members Or Not">
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
						<Accordion.Item key={4} value="Official Length of Quest">
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
						<Accordion.Item key={5} value="Items Required">
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
						<Accordion.Item key={6} value="Recommended">
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
						<Accordion.Item key={7} value="Enemies to Defeat">
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
						{details.stepDetails.map((value, index) =>
							isHighlight ? (
								<Stepper.Step
									id={(index + 1).toString()}
									className="stepperStep"
									label={`Step: ${index + 1}`}
									key={create_ListUUID()}
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
									onClick={() => setActiveAndScroll}
									allowStepSelect={ShouldAllowStep(index)}
								/>
							) : stepHidden ? (
								<>
									<Stepper.Step
										id={(index + 1).toString()}
										className="stepperStep"
										label={`Step: ${index + 1}`}
										key={create_ListUUID()}
										styles={{
											stepDescription: {
												visibility: active > index ? "hidden" : "visible",
												color: hasColor ? userColor : "",
											},
											stepLabel: {
												visibility: active > index ? "hidden" : "visible",
											},
											stepCompletedIcon: {
												visibility: active > index ? "hidden" : "visible",
											},
											stepIcon: {
												visibility: active > index ? "hidden" : "visible",
											},
											stepWrapper: {
												visibility: active > index ? "hidden" : "visible",
											},
										}}
										orientation="vertical"
										description={value}
										onClick={() => setActiveAndScroll}
										allowStepSelect={ShouldAllowStep(index)}
									/>
								</>
							) : (
								<Stepper.Step
									id={(index + 1).toString()}
									className="stepperStep"
									label={`Step: ${index + 1}`}
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
							)
						)}
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
							<div id="return-image">
								<Button
									className="return"
									ref={buttonRef}
									size="compact-sm"
									variant="outline"
									color={hasButtonColor ? userButtonColor : ""}
									onClick={handlePopOut}
								>
									Quest Images (New Feature!)
								</Button>
							</div>
							<div id="prev-next">
								<Button
									styles={{ root: {} }}
									size="compact-sm"
									variant="outline"
									color={hasButtonColor ? userButtonColor : ""}
									onClick={() => {
										handleStepChange(active + 1);
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
