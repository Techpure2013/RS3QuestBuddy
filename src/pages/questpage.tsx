import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	Accordion,
	Button,
	Flex,
	List,
	//MantineProvider,
	Stepper,
	//TextInput,
} from "@mantine/core";
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
//import QuestControl from "./../pages/QuestControls.tsx";
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
import { useQuestControllerStore } from "../Handlers/HandlerStore.ts";
//import { createRoot } from "react-dom/client";
import { Reader, DiagReader } from "../Handlers/dialogsolver.tsx";
//import { PlayerQuests } from "./../Handlers/PlayerFetch.ts";
// import questimages from "./QuestImages";
const QuestPage: React.FC = () => {
	// State and variables
	const qpname = useLocation();
	const { questName, modified } = qpname.state;
	const [active, setActive] = useState(-1);
	const [highestStepVisited, setHighestStepVisited] = useState(active);
	const questlistJSON = "./QuestList.json";
	const textfile = modified + "info.txt";
	const reader = new DiagReader();
	const navigate = useNavigate();
	const details = useQuestStepStore();
	const imageDetails = UseImageStore();
	const stepRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
	const [viewQuestImage, setViewQuestImage] = useState(false);
	const QuestDetails = useQuestDetailsStore.getState().questDetails;
	const { showStepReq, buttonVisible, toggleShowStepReq } =
		useQuestControllerStore();
	//const handles = useQuestControllerStore();
	//const PlayerFetch = new PlayerQuests();

	const handleBackButton = () => {
		navigate("/");
	};
	const questImageVis = () => {
		setViewQuestImage((prevState) => !prevState);
	};
	// function copyStyle(
	// 	_from: Window,
	// 	to: Window,
	// 	node: HTMLStyleElement | HTMLLinkElement
	// ): void {
	// 	const doc: Document = to.document;

	// 	if (node.tagName === "STYLE") {
	// 		// If it's a style element, create a new style element
	// 		const newStyle: HTMLStyleElement = doc.createElement("style");

	// 		if (node.textContent) {
	// 			newStyle.textContent = node.textContent;
	// 		} else if ("innerText" in node && node.innerText) {
	// 			newStyle.innerText = node.innerText;
	// 		}

	// 		doc.head.appendChild(newStyle);
	// 	} else if (node.tagName === "LINK" && "rel" in node) {
	// 		// If it's a link element, create a new link element
	// 		const newLink: HTMLLinkElement = doc.createElement("link");

	// 		if ("rel" in node) {
	// 			newLink.rel = node.rel;
	// 		}

	// 		newLink.href = node.href;
	// 		newLink.type = node.type;

	// 		doc.head.appendChild(newLink);
	// 	}
	// }
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
	// const handlePopOut = () => {
	// 	if (handles.popOutWindow && !handles.popOutWindow.closed) {
	// 		// If open, close the window
	// 		handles.popOutWindow.close();
	// 		handles.setPopOutWindow(null);
	// 		handles.setButtonVisible(true); // Show the buttons again
	// 		handles.setPopOutClicked(true);
	// 	} else {
	// 		// If not open, open a new browser window
	// 		const newWindow = window.open("", "", "width=237,height=90");
	// 		if (newWindow) {
	// 			// Set the pop-out window and hide buttons in the current window
	// 			handles.setPopOutWindow(newWindow);
	// 			handles.setButtonVisible(false);
	// 			handles.setPopOutClicked(false);

	// 			// Render the QuestControls component into the new window
	// 			const container: HTMLDivElement =
	// 				newWindow.document.createElement("div");
	// 			container.className = "ButtonGroupTwo";
	// 			newWindow.document.body.appendChild(container);
	// 			newWindow.document.title = "Quest Controls";

	// 			// Set initial content for the new window
	// 			const initialContentContainer = newWindow.document.createElement("div");
	// 			initialContentContainer.id = "initialContentContainer";
	// 			newWindow.document.body.appendChild(initialContentContainer);
	// 			const domNode: any = newWindow.document.getElementById(
	// 				"initialContentContainer"
	// 			);
	// 			const root = createRoot(domNode);
	// 			const iconLink = newWindow.document.createElement("link");
	// 			iconLink.rel = "icon";
	// 			iconLink.href = "./src/assets/rs3buddyicon.png";
	// 			newWindow.document.head.appendChild(iconLink);

	// 			// Function to copy styles from the original window to the new window
	// 			function copyStyles(): void {
	// 				const stylesheets: NodeListOf<HTMLStyleElement | HTMLLinkElement> =
	// 					document.querySelectorAll('style, link[rel="stylesheet"]');
	// 				const stylesheetsArray: HTMLStyleElement[] = Array.from(stylesheets);

	// 				console.log("Copying styles:", stylesheetsArray);

	// 				stylesheetsArray.forEach(function (stylesheet: HTMLStyleElement) {
	// 					copyStyle(window, newWindow!, stylesheet);
	// 				});

	// 				const emotionStyles = document.querySelectorAll(
	// 					"style[data-emotion]"
	// 				);
	// 				emotionStyles.forEach((style) => {
	// 					const newEmotionStyle = document.createElement("style");
	// 					newEmotionStyle.textContent = style.textContent;
	// 					newWindow!.document.head.appendChild(newEmotionStyle);
	// 				});
	// 			}

	// 			// Call the function to copy styles
	// 			copyStyles();

	// 			// Render QuestControls into the new window
	// 			root.render(
	// 				<MantineProvider>
	// 					<QuestControl
	// 						scrollNext={scrollNext}
	// 						scrollPrev={scrollPrev}
	// 						handleStepChange={setActiveAndScroll}
	// 					/>
	// 				</MantineProvider>
	// 			);
	// 		}
	// 	}
	// };
	const setActiveAndScroll = (nextStep: number) => {
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
		const stepperBounds = document.querySelector("stepperStep") as HTMLElement;
		if (prevNextButtons && imageCaro && stepperBounds) {
			// Check if elements exist
			const prevNextRect = prevNextButtons.getBoundingClientRect();
			const imageCaroRect = imageCaro.getBoundingClientRect();
			const stepperRect = stepperBounds.getBoundingClientRect();

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
			if (
				prevNextRect.right > stepperRect.left &&
				prevNextRect.left < stepperRect.right &&
				prevNextRect.bottom > stepperRect.top &&
				prevNextRect.top < stepperRect.bottom
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
	// const handlePlayerName = (event: React.KeyboardEvent<HTMLInputElement>) => {
	// 	if (event.key === "Enter") {
	// 		let player = PlayerFetch.run;
	// 		console.log(" data", player);
	// 	}
	// };
	useEffect(() => {
		stepRefs.current = Array.from({ length: details.stepDetails.length }, () =>
			React.createRef()
		);
	}, [details.stepDetails.length]);

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
					>
						{imageDetails.imageList.map((src, index) => (
							<Carousel.Slide key={index}>
								<img src={src} />
							</Carousel.Slide>
						))}
					</Carousel>
				</>
			)}
			{/* <TextInput
				className="customInput"
				label="Search for Quest"
				placeholder="Type in a quest"
				onKeyDown={handlePlayerName}
			/> */}
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
				{/* {buttonVisible ? (
					<Button variant="outline" color="#EEF3FF" onClick={handlePopOut}>
						Pop Out Quest Controls
					</Button>
				) : (
					<Button variant="outline" color="#EEF3FF" onClick={handlePopOut}>
						Pop In Quest Controls
					</Button>
				)} */}
				<Button variant="outline" color="#EEF3FF" onClick={handleBackButton}>
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
				{showStepReq ? (
					<Button variant="outline" color="#EEF3FF" onClick={toggleShowStepReq}>
						Show Step Details
					</Button>
				) : (
					<Button variant="outline" color="#EEF3FF" onClick={toggleShowStepReq}>
						Show Quest Details
					</Button>
				)}
			</Flex>
			{showStepReq && Array.isArray(QuestDetails) ? (
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

														return (
															<li
																key={uniqueKey}
																style={{
																	display: "block",
																}}
															>
																{"- "}
																{requirement}
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
			) : (
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
			)}
		</>
	);
};

export default QuestPage;
