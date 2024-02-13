import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ActionIcon, Button, Flex, Modal, Stepper } from "@mantine/core";
import "./../index.css";
import { Carousel, Embla, useAnimationOffsetEffect } from "@mantine/carousel";
import "@mantine/core/styles/global.css";
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
import "@mantine/core/styles/Stepper.css";
import {
	IconArrowLeft,
	IconArrowRight,
	IconSettings,
	IconPlus,
} from "@tabler/icons-react";

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
import { IconArrowBack } from "@tabler/icons-react";
import { Settings } from "./Settings.tsx";
import { useDisclosure } from "@mantine/hooks";
import useNotesDisclosure from "../Handlers/useDisclosure.ts";
import { UserNotes } from "./userNotes.tsx";
import useImageDisclosure from "./ImageModal.tsx";
import { QuestAccordian } from "./QuestAccordian.tsx";
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
	const textfile = modified + "info.txt";
	const reader = new DiagReader();
	const hist = useNavigate();
	const details = useQuestStepStore();
	const imageDetails = UseImageStore();
	const stepRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

	const QuestDetails = useQuestDetailsStore.getState().questDetails;

	const [isHighlight, setIsHighlight] = useState(false);
	const [stepHidden, setStepHidden] = useState(false);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const [toTop, setToTop] = useState(false);
	const [userColor, setUserColor] = useState("");
	const [userLabelColor, setUserLabelColor] = useState("");
	const [userButtonColor, setUserButtonColor] = useState("");
	const [hasColor, setHasColor] = useState(false);
	const [hasButtonColor, setHasButtonColor] = useState(false);
	const [hasLabelColor, setHasLabelColor] = useState(false);
	const [isOpened, { openNotes, closedNotes }] = useNotesDisclosure(false);
	const [isImg, { imgModOpen, imgModClose }] = useImageDisclosure(false);
	// const finder = new diagFinder();
	const { showStepReq, buttonVisible, toggleShowStepReq, viewQuestImage } =
		useQuestControllerStore();
	const handles = useQuestControllerStore();
	const handleKeyDown = (event: KeyboardEvent) => {
		// Prevent scrolling when the spacebar is pressed
		if (event.key === " " || event.key === "Spacebar") {
			event.preventDefault();
		}
	};

	useEffect(() => {
		// Attach the event listener when the component mounts
		document.addEventListener("keydown", handleKeyDown);

		// Detach the event listener when the component unmounts
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);
	const handleBackButton = () => {
		hist("/");
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
	useEffect(() => {
		if (toTop && buttonRef.current) {
			buttonRef.current.scrollIntoView({ behavior: "smooth" });
		} else {
			scrollIntoView(active);
		}
	}, [toTop]);
	useEffect(() => {
		if (viewQuestImage && carouselRef.current) {
			carouselRef.current.scrollIntoView({ behavior: "smooth" });
		} else {
			// Scroll back to step
			scrollIntoView(active);
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
				"width=200, height=221"
			)!;
			if (newWindow) {
				// Set the pop-out window and hide buttons in the current window
				handles.setPopOutWindow(newWindow);
				handles.setButtonVisible(false);
				handles.setPopOutClicked(false);

				newWindow.document.write("<!DOCTYPE html><head></head><body></body>");
				// Render the QuestControls component into the new window
				const container: HTMLDivElement = newWindow.document.createElement("div");
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
		return () => clearAllIntervals();
	}, [stepHidden, isHighlight, showStepReq, opened]);

	useEffect(() => {
		stepRefs.current = Array.from({ length: details.stepDetails.length }, () =>
			React.createRef()
		);
	}, [details.stepDetails.length]);

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
						color: hasColor ? userColor : "#4e85bc",
					},
					body: { backgroundColor: "#3d3d3d" },
				}}
			>
				<Settings />
			</Modal>
			<Reader reader={reader} questName={questName} />
			<QuestImageFetcher
				questName={questName}
				QuestListJSON={"./QuestImageList.json"}
			/>
			<QuestStepFetcher textfile={textfile} questStepJSON={questlistJSON} />
			<QuestDetailsFetcher questName={questName} />
			{window.addEventListener("scroll", updateButtonVis)}
			<div>
				<h2 className="qpTitle" style={{ color: hasColor ? userColor : "#4e85bc" }}>
					{questName}
				</h2>
			</div>
			<>
				<Modal
					transitionProps={{ duration: TRANSITION_DURATION }}
					opened={isImg}
					onClose={() => {
						imgModClose();
					}}
					styles={{
						root: { width: "600px" },
						header: {
							backgroundColor: "#3d3d3d",
						},
						title: {
							fontSize: "34px",
							textAlign: "center",
							color: hasColor ? userColor : "#4e85bc",
						},
						body: { backgroundColor: "#3d3d3d" },
					}}
				>
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
				</Modal>
			</>

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
						<Button
							ref={buttonRef}
							variant="outline"
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
							onClick={handlePopOut}
						>
							Pop Out Quest Controls
						</Button>
						<Button
							variant="outline"
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
							onClick={handleBackButton}
							leftSection={<IconArrowBack />}
						>
							Pick Another Quest
						</Button>
					</>
				) : (
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						onClick={handlePopOut}
					>
						Pop In Quest Controls
					</Button>
				)}
				{buttonVisible &&
					(showStepReq ? (
						<Button
							variant="outline"
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
							onClick={() => {
								toggleShowStepReq();
							}}
						>
							Show Quest Steps
						</Button>
					) : (
						<Button
							variant="outline"
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
							onClick={toggleShowStepReq}
						>
							Show Quest Details
						</Button>
					))}
			</Flex>
			{showStepReq && Array.isArray(QuestDetails) ? (
				<>
					<QuestAccordian />
				</>
			) : (
				<>
					<div className="autoPad1"></div>
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
									color={active > index ? "#24BF58" : "#4e85bc"}
									styles={{
										stepDescription: {
											color: active > index ? "#24BF58" : hasColor ? userColor : "#546576",
										},
										stepLabel: {
											color: hasLabelColor ? userLabelColor : "#546576",
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
												color: hasColor ? userColor : "#546576",
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
								<>
									<Stepper.Step
										id={(index + 1).toString()}
										className="stepperStep"
										label={`Step: ${index + 1}`}
										key={index + 1}
										color={active > index ? "#24BF58" : "#4e85bc"}
										styles={{
											stepDescription: {
												color: "#546576",
											},
										}}
										orientation="vertical"
										description={value}
										onClick={() => setActiveAndScroll}
										allowStepSelect={ShouldAllowStep(index)}
									/>
									<div className="autoPad1"></div>
									<div className="autoPad1"></div>
								</>
							)
						)}
					</Stepper>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					<div className="autoPad1"></div>
					{buttonVisible && (
						<div className="prevNextGroup">
							{toTop ? (
								<ActionIcon
									size="compact-sm"
									variant="outline"
									color={hasButtonColor ? userButtonColor : "#EEF3FF"}
									onClick={() => {
										setToTop((prev) => !prev);
									}}
									styles={{ root: { top: "140px", right: "70px" } }}
								>
									Return to Step
								</ActionIcon>
							) : (
								<ActionIcon
									size="compact-sm"
									variant="outline"
									color={hasButtonColor ? userButtonColor : "#EEF3FF"}
									onClick={() => {
										setToTop((prev) => !prev);
									}}
									styles={{ root: { top: "140px", right: "70px" } }}
								>
									Return to Top
								</ActionIcon>
							)}
							<ActionIcon
								onClick={open}
								variant="outline"
								color={hasButtonColor ? userButtonColor : "#EEF3FF"}
								size={"sm"}
								styles={{
									root: { right: "175px", top: "112px" },
								}}
							>
								<IconSettings />
							</ActionIcon>
							<ActionIcon
								color={hasButtonColor ? userButtonColor : "#EEF3FF"}
								onClick={openNotes}
								size={"sm"}
								variant="outline"
								styles={{
									root: { right: "175px", top: "108px" },
								}}
							>
								<IconPlus />
							</ActionIcon>
							<Button
								size="compact-sm"
								variant="outline"
								color={hasButtonColor ? userButtonColor : "#EEF3FF"}
								onClick={() => {
									imgModOpen();
								}}
								styles={{ root: { top: "40px" } }}
							>
								Images
							</Button>
							<Button
								size="compact-sm"
								variant="outline"
								color={hasButtonColor ? userButtonColor : "#EEF3FF"}
								onClick={() => {
									scrollPrev();
									handleStepChange(active - 1);
								}}
								styles={{ root: { right: "90px", top: "36px" } }}
							>
								Prev Step
							</Button>
							<Button
								styles={{ root: {} }}
								size="compact-sm"
								variant="outline"
								color={hasButtonColor ? userButtonColor : "#EEF3FF"}
								onClick={() => {
									handleStepChange(active + 1);
									scrollNext();
								}}
							>
								Next Step
							</Button>
						</div>
					)}
				</>
			)}
		</>
	);
};

export default QuestPage;
