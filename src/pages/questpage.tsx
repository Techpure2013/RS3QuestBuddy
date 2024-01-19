import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Accordion, Button, Flex, List, Stepper } from "@mantine/core";
import "./../index.css";
import QuestIcon from "./../QuestIconEdited.png";
import { Carousel } from "@mantine/carousel";
import "@mantine/core/styles/global.css";
import "@mantine/core/styles/Accordion.css";
import "@mantine/core/styles/List.css";
import "@mantine/core/styles/ScrollArea.css";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/VisuallyHidden.css";
import "@mantine/core/styles/Paper.css";
import "@mantine/core/styles/Popover.css";
import "@mantine/core/styles/CloseButton.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Loader.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/ModalBase.css";
import "@mantine/core/styles/Input.css";
import "@mantine/core/styles/Flex.css";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Image } from "./ImageInterface.tsx";
import QuestControl from "./../pages/QuestControls.tsx";
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

// import { diagFinder } from "../Handlers/handleImage.ts";
// import * as a1lib from "alt1";
const QuestPage: React.FC = () => {
	// State and variables
	const qpname = useLocation();

	let { questName, modified } = qpname.state;
	window.localStorage.setItem("questName", questName);
	const [active, setActive] = useState(-1);
	const [highestStepVisited, setHighestStepVisited] = useState(active);
	const questlistJSON = "./QuestList.json";
	const textfile = modified + "info.txt";
	const reader = new DiagReader();

	const details = useQuestStepStore();
	const imageDetails = UseImageStore();
	const stepRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
	const [completedQuests, setCompleteQuests] = useState<string[] | null>(null);
	const QuestDetails = useQuestDetailsStore.getState().questDetails;
	const [skillLevels, setSkillLevels] = useState<string[]>([]);

	// const finder = new diagFinder();
	const {
		showStepReq,
		buttonVisible,
		toggleShowStepReq,
		viewQuestImage,
		setViewImage,
	} = useQuestControllerStore();
	const handles = useQuestControllerStore();
	const handleBackButton = () => {
		console.log(history.state);
		history.back();
	};
	const questImageVis = () => {
		if (viewQuestImage === true) {
			setViewImage(false);
		} else {
			setViewImage(true);
		}
	};
	const carouselRef = useRef<HTMLDivElement | null>(null);
	if (questName == "Ability to enter Morytania") {
		questName = "Priest in Peril";
	}
	if (
		questName ==
		"Jungle Potion is only required if clean volencia moss is a requested item during the quest"
	) {
		questName = "Jungle Potion";
	}
	if (questName == "Fully restore Senliten from the 'Missing My Mummy' quest") {
		questName = "Missing My Mummy";
	}
	if (questName == "Bring Leela to Senliten's tomb") {
		questName = "Missing My Mummy";
	}

	// const capture = a1lib.captureHoldFullRs();
	// finder.find();
	// const title = finder.readTitle(capture);
	// console.log(title);
	// Use useEffect to scroll when viewQuestImage is true
	useEffect(() => {
		if (viewQuestImage && carouselRef.current) {
			carouselRef.current.scrollIntoView({ behavior: "smooth" });
		} else {
			// Scroll back to step references
			const firstStepRef = stepRefs.current[0];
			if (firstStepRef && firstStepRef.current) {
				firstStepRef.current.scrollIntoView({ behavior: "smooth" });
			}
		}
	}, [viewQuestImage]);
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
		scrollIntoView(nextStep);
	};
	const scrollPrev = (): void => {
		const prevStep = active - 1;
		scrollIntoView(prevStep);
	};

	const scrollIntoView = (step: number) => {
		const element = document.getElementById(step.toString());
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};
	const ShouldAllowStep = (step: number) =>
		highestStepVisited >= step && active !== step;
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
				"width=594, height=100"
			)!;
			if (newWindow) {
				// Set the pop-out window and hide buttons in the current window
				handles.setPopOutWindow(newWindow);
				handles.setButtonVisible(false);
				handles.setPopOutClicked(false);

				newWindow.document.write("<!DOCTYPE html><head></head><body></body>");
				// Render the QuestControls component into the new window
				const container: HTMLDivElement =
					newWindow.document.createElement("div");
				container.className = "ButtonGroupTwo";
				newWindow.document.body.appendChild(container);
				newWindow.document.title = "Quest Controls";
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
				iconLink.rel = "icon";
				iconLink.href = "./src/assets/rs3buddyicon.png";
				newWindow.document.head.appendChild(iconLink);

				// Function to copy styles from the original window to the new window
				function copyStyles(): void {
					try {
						const stylesheets: NodeListOf<HTMLStyleElement | HTMLLinkElement> =
							document.querySelectorAll('style, link[rel="stylesheet"]');
						const stylesheetsArray: HTMLStyleElement[] =
							Array.from(stylesheets);

						console.log("Copying styles:", stylesheetsArray);

						stylesheetsArray.forEach(function (stylesheet: HTMLStyleElement) {
							console.log("Copying stylesheet:", stylesheet);
							copyStyle(window, newWindow!, stylesheet);
						});

						const emotionStyles = document.querySelectorAll(
							"style[data-emotion]"
						);
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
						<QuestControl
							scrollNext={scrollNext}
							scrollPrev={scrollPrev}
							handleStepChange={setActiveAndScroll}
						/>
						<div className="autoPad1"></div>
						<div className="autoPad2"></div>
					</>
				);
			}
		}
	};
	const setActiveAndScroll = (nextStep: number): void => {
		if (nextStep >= 0 && nextStep < details.stepDetails.length) {
			setActive(nextStep);
			setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
			stepRefs.current[nextStep].current?.scrollIntoView({
				behavior: "smooth",
			});
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
		const isOutOfBoundsTop = stepLength < 0;

		if (isOutOfBoundsBottom) {
			return window.alert("Cannot go forward");
		} else if (isOutOfBoundsTop) {
			return window.alert("Cannot go back");
		} else {
			setActive(nextStep);
			setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
		}
	};

	useEffect(() => {
		stepRefs.current = Array.from({ length: details.stepDetails.length }, () =>
			React.createRef()
		);
	}, [details.stepDetails.length]);
	useEffect(() => {
		const completedQuests = sessionStorage.getItem("hasCompleted");
		const skill = sessionStorage.getItem("skillLevels");
		if (completedQuests !== null && skill !== null) {
			const parsedQuests = JSON.parse(completedQuests);
			const parsedSkills = JSON.parse(skill);
			if (
				parsedQuests !== null &&
				typeof parsedQuests === "object" &&
				Array.isArray(parsedQuests) &&
				parsedSkills !== null &&
				typeof parsedSkills === "object" &&
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
	return (
		<>
			<QuestImageFetcher
				questName={questName}
				QuestListJSON={"./QuestImageList.json"}
			/>
			<QuestStepFetcher textfile={textfile} questStepJSON={questlistJSON} />
			<QuestDetailsFetcher questName={questName} />

			<Reader reader={reader} questName={questName} />
			{window.addEventListener("scroll", updateButtonVis)}

			<div>
				<h2 className="qpTitle">{questName}</h2>
			</div>
			{viewQuestImage && (
				<>
					<Carousel
						speed={100}
						withIndicators
						orientation="horizontal"
						align="start"
						mx="auto"
						slidesToScroll={1}
						nextControlIcon={<IconArrowRight size={16} />}
						previousControlIcon={<IconArrowLeft size={16} />}
						slideSize="100%"
						className="QuestPageImageCaro"
						height={400}
						ref={carouselRef}
					>
						{imageDetails.imageList.map((src, index) => (
							<Carousel.Slide key={index}>
								<img src={src} />
							</Carousel.Slide>
						))}
					</Carousel>
				</>
			)}

			{buttonVisible && (
				<Flex className="prevNextGroup" gap="sm">
					<Button
						variant="outline"
						color="#EEF3FF"
						onClick={() => {
							scrollPrev();
							handleStepChange(active - 1);
						}}
					>
						Prev Step
					</Button>
					<Button
						variant="outline"
						color="#EEF3FF"
						onClick={() => {
							handleStepChange(active + 1);
							scrollNext();
						}}
					>
						Next Step
					</Button>
				</Flex>
			)}
			<Flex
				className="flexedButtons"
				gap="sm"
				justify="flex-start"
				align="flex-start"
				direction="column"
				wrap="wrap"
			>
				{buttonVisible ? (
					<>
						<Button variant="outline" color="#EEF3FF" onClick={handlePopOut}>
							Pop Out Quest Controls
						</Button>
						<Button
							variant="outline"
							color="#EEF3FF"
							onClick={handleBackButton}
						>
							Pick Another Quest
						</Button>
						<Button
							variant="outline"
							color="#EEF3FF"
							onClick={() => {
								questImageVis();
							}}
						>
							View Quest Images
						</Button>
					</>
				) : (
					<Button variant="outline" color="#EEF3FF" onClick={handlePopOut}>
						Pop In Quest Controls
					</Button>
				)}
				{buttonVisible && // Add the NOT (!) operator here to hide the button when buttonVisible is true
					(showStepReq ? (
						<Button
							variant="outline"
							color="#EEF3FF"
							onClick={toggleShowStepReq}
						>
							Show Step Details
						</Button>
					) : (
						<Button
							variant="outline"
							color="#EEF3FF"
							onClick={toggleShowStepReq}
						>
							Show Quest Details
						</Button>
					))}
			</Flex>
			{showStepReq && Array.isArray(QuestDetails) ? (
				<>
					<Accordion
						defaultValue=""
						chevron={
							<Image
								src={QuestIcon}
								alt="Quest Icon"
								width="20px"
								height="20px"
							/>
						}
					>
						<Accordion.Item key={1} value="Click to Show Quest Requirements">
							<Accordion.Control
								styles={{
									control: { color: "#4e85bc" },
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
													{quest.Requirements.map(
														(requirement, requirementIndex) => {
															// Combine questIndex and requirementIndex to create a unique key
															const uniqueKey = `${questIndex}-${requirementIndex}`;
															const hasSkill = skillLevels.some((value) => {
																const splitValue = value.split(" ");
																const isNumber = !isNaN(
																	parseFloat(splitValue[0])
																);
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
															const needMort =
																requirement === "Ability to enter Morytania";
															const needJunglePotion =
																requirement ===
																"Jungle Potion is only required if clean volencia moss is a requested item during the quest";
															let abilityToEnterMort = false;
															let junglePotion = false;
															let mmm = false;
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
																				(value as { title?: string }).title ===
																				"Priest in Peril"
																			);
																		}
																		return false;
																	});
																if (hasPriestInPeril) {
																	abilityToEnterMort = true;
																}
															}
															if (needLeela) {
																const hasMMM =
																	completedQuests &&
																	completedQuests.some((value) => {
																		if (
																			value &&
																			typeof value === "object" &&
																			"title" in value &&
																			value !== null
																		) {
																			return (
																				(value as { title?: string }).title ===
																				"Missing My Mummy"
																			);
																		}
																		return false;
																	});
																if (hasMMM) {
																	mmm = true;
																}
															}

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
																				(value as { title?: string }).title ===
																				"Jungle Potion"
																			);
																		}
																		return false;
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
																		return (
																			(value as { title?: string }).title ===
																			requirement
																		);
																	}
																	return false;
																});
															const requirementParts = requirement.split(" ");
															const firstPart: number = parseInt(
																requirementParts[0]
															);

															return (
																<li
																	key={uniqueKey}
																	style={{
																		display: "block",
																		color: hasSkill
																			? "#24BF58" //Green
																			: isComplete
																			? "#24BF58" //Green
																			: "#C64340", // Red
																	}}
																>
																	{!isNaN(firstPart) ||
																	requirement === "None" ? (
																		<span>{requirement}</span>
																	) : (
																		<NavLink
																			to="/QuestPage"
																			onClick={() => {
																				if (abilityToEnterMort) {
																					console.log(history.state);
																					document.location.reload();
																				}
																			}}
																			state={{
																				questName: requirement,
																				modified: requirement
																					.toLowerCase()
																					.replace(/[!,`']/g, ""),
																			}}
																			style={{
																				display: "block",
																				color: mmm
																					? "#24BF58"
																					: junglePotion
																					? "#24BF58" //Green
																					: abilityToEnterMort
																					? "#24BF58" //Green
																					: hasSkill
																					? "#24BF58" //Green
																					: isComplete
																					? "#24BF58" //Green
																					: "#C64340", // Red
																				textDecoration: "none",
																			}}
																		>
																			{requirement}
																		</NavLink>
																	)}
																</li>
															);
														}
													)}
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
									control: { color: "#4e85bc" },
								}}
							>
								Start Point
							</Accordion.Control>
							<Accordion.Panel>
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
									control: { color: "#4e85bc" },
								}}
							>
								Is This a Members Quest?
							</Accordion.Control>
							<Accordion.Panel>
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
									control: { color: "#4e85bc" },
								}}
							>
								How Long is This Quest?
							</Accordion.Control>
							<Accordion.Panel>
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
									control: { color: "#4e85bc" },
								}}
							>
								Items You Definitely Need
							</Accordion.Control>
							<Accordion.Panel>
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
									control: { color: "#4e85bc" },
								}}
							>
								Items You Might Need
							</Accordion.Control>
							<Accordion.Panel>
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
									control: { color: "#4e85bc" },
								}}
							>
								Enemies To Look Out For
							</Accordion.Control>
							<Accordion.Panel>
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
					<div className="autoPad1"></div>
					<div className="autoPad2"></div>
				</>
			) : (
				<>
					<Stepper
						className="stepperContainer"
						active={active}
						orientation="vertical"
						onStepClick={setActiveAndScroll}
					>
						{details.stepDetails.map((value, index) => (
							<Stepper.Step
								id={index.toString()}
								className="stepperStep"
								label={`Step: ${index + 1}`}
								key={index}
								orientation="vertical"
								description={value}
								onClick={() => setActiveAndScroll}
								allowStepSelect={ShouldAllowStep(index)}
							/>
						))}
					</Stepper>
					<div className="autoPad1"></div>
					<div className="autoPad2"></div>
				</>
			)}
		</>
	);
};

export default QuestPage;
