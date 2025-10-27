import React, {
	useState,
	useEffect,
	useRef,
	Suspense,
	useMemo,
	lazy,
} from "react";
import { useLocation } from "react-router-dom";
import { Accordion, Box, Button, Flex, Stack } from "@mantine/core";
import { createRoot } from "react-dom/client";
import Tippy from "@tippyjs/react";
import { IconArrowBack } from "@tabler/icons-react";

// Components
import { CompactQuestStep } from "./Quest Detail Components/QuestStepDisplay";
import { QuestModals } from "./Quest Detail Components/QuestModals";
import { QuestFooter } from "./Quest Detail Components/QuestFooter";

// Hooks and State
import { useQuestPaths } from "./../../Fetchers/useQuestData";
import {
	UseImageStore,
	QuestImageFetcher,
	QuestImage,
} from "./../../Fetchers/handleNewImage";
import { useQuestPageFunctions } from "./questPageFunctions";
import { useQuestDetails } from "./../../Fetchers/useQuestDetails";
import { useDialogSolver } from "./dialogsolverRW";
import { useQuestControllerStore } from "./../../Handlers/HandlerStore";
import { getQuestSwaps } from "./../../util/DescriptionSwap";
// Types
import { Skills } from "./../../Fetchers/PlayerStatsSort";
import { PlayerQuestStatus } from "./../../Fetchers/sortPlayerQuests";

// Disclosure Hooks
import useNotesDisclosure from "./Quest Detail Components/useDisclosure";
import usePOGDisclosure from "./Quest Detail Components/POGCalcDisclosure";
import useGridDisclosure from "./Quest Detail Components/useGridModal";
import useLunarGridDisclosure from "./Quest Detail Components/useLunarDisclosure";
import { useSettings } from "./../../Entrance/Entrance Components/SettingsContext";
// Lazy Loaded Components
const QuestDetailContents = lazy(
	() => import("./Quest Detail Components/QuestDetailsAccordion"),
);

const QuestPage: React.FC = () => {
	const { questSteps, QuestDataPaths, getQuestSteps } = useQuestPaths();
	const {
		handleBackButton,
		openDiscord,
		openWikiQuest,
		useAlt1Listener,
		openCoffee,
		ignoredRequirements,
	} = useQuestPageFunctions();

	const imageDetails = UseImageStore();
	const { questDetails, getQuestNamedDetails } = useQuestDetails();
	const { stepCapture } = useDialogSolver();
	const handles = useQuestControllerStore();
	const { showStepReq, toggleShowStepReq } = useQuestControllerStore();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const location = useLocation();
	const { questName } = location.state;
	const userID = localStorage.getItem("userID");
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
	const [active, setActive] = useState(-1);
	const [skillLevels, setSkillLevels] = useState<Skills | null>(null);
	const [completedQuests, setCompleteQuests] = useState<
		PlayerQuestStatus[] | null
	>(null);
	const [expanded, setExpanded] = useState<string[]>([]);

	const [openedGrid, { openGrid, closeGrid }] = useGridDisclosure(false);
	const [openedLunar, { openLunarGrid, closeLunarGrid }] =
		useLunarGridDisclosure(false);
	const [openedPog, { pogModOpen, pogModClose }] = usePOGDisclosure(false);
	const [openedNotes, { openNotes, closedNotes }] = useNotesDisclosure(false);
	const { settings, openSettingsModal, closeSettingsModal } = useSettings();

	useEffect(() => {
		if (active === -1 || settings.isExpandedMode || !settings.autoScrollEnabled)
			return;

		const timer = setTimeout(() => {
			const targetElement = document.getElementById(active.toString());

			if (targetElement) {
				targetElement.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		}, 250);

		return () => clearTimeout(timer);
	}, [active, settings.isExpandedMode, settings.autoScrollEnabled]);
	useEffect(() => {
		// Load state from localStorage when the component mounts
		const savedActive = localStorage.getItem(`lastActiveStep-${questName}`);
		const savedCompleted = localStorage.getItem(`completedSteps-${questName}`);

		if (savedCompleted) {
			const completedSet = new Set<number>(JSON.parse(savedCompleted));
			setCompletedSteps(completedSet);
			const highestCompleted =
				completedSet.size > 0 ? Math.max(...completedSet) : -1;
			setActive(highestCompleted);
		} else if (savedActive) {
			// Fallback for older saved data
			setActive(parseInt(savedActive, 10));
		}
	}, [questName]);

	// Save active step
	useEffect(() => {
		localStorage.setItem(`lastActiveStep-${questName}`, active.toString());
	}, [active, questName]);

	// Save completed steps
	useEffect(() => {
		localStorage.setItem(
			`completedSteps-${questName}`,
			JSON.stringify([...completedSteps]),
		);
	}, [completedSteps, questName]);
	useEffect(() => {
		if (QuestDataPaths) {
			getQuestSteps(questName);
		}
	}, [QuestDataPaths, getQuestSteps, questName]);

	useEffect(() => {
		if (questName) {
			getQuestNamedDetails(questName);
		}
	}, [questName]);

	useEffect(() => {
		const completedQuestsJSON = sessionStorage.getItem("hasCompleted");
		const skillLevelsJSON = sessionStorage.getItem("skillLevels");
		if (completedQuestsJSON && skillLevelsJSON) {
			setCompleteQuests(JSON.parse(completedQuestsJSON));
			setSkillLevels(JSON.parse(skillLevelsJSON));
		}
	}, []);
	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const updateCompletionState = (targetIndex: number) => {
		if (!questSteps) return;
		setCompletedSteps(() => {
			// Removed prevCompleted to avoid stale state issues
			const newCompleted = new Set<number>();
			for (let i = 0; i <= targetIndex; i++) {
				newCompleted.add(i);
			}
			return newCompleted;
		});
	};
	const handleKeyDown = (event: KeyboardEvent) => {
		if (!openedNotes) {
			if (event.key === " ") {
				event.preventDefault();
			}
		}
	};

	const handleAccordionChange = (value: string | string[] | null) => {
		if (settings.isExpandedMode) return;
		const singleValue = value as string | null;
		const nextStep = singleValue === null ? -1 : parseInt(singleValue, 10);

		if (!isNaN(nextStep) && nextStep !== active) {
			setActive(nextStep);
			updateCompletionState(nextStep);

			if (settings.dialogSolverEnabled && questSteps?.[nextStep] && window.alt1) {
				const currentStep = questSteps[nextStep];
				const swaps = getQuestSwaps(questName);
				const deletionStrings = swaps.map((swap) => swap.deletedIf).filter(Boolean);

				const filteredAdditionalInfo = (
					currentStep.additionalStepInformation || []
				).filter((info) => !deletionStrings.includes(info));

				const infoString = filteredAdditionalInfo.join(". ");
				const allSteps = [currentStep.stepDescription, infoString].join(" ");

				console.log("Final text sent to stepCapture:", allSteps);
				stepCapture(allSteps);
			}
		}
	};

	const scrollNext = () => {
		const nextStep = Math.min(active + 1, (questSteps?.length || 0) - 1);
		setActive(nextStep);
		updateCompletionState(nextStep);
	};

	const scrollPrev = () => {
		const prevStep = Math.max(active - 1, -1); // Allow going back to "no step selected"
		setActive(prevStep);
		updateCompletionState(prevStep);
	};

	useAlt1Listener(scrollNext);

	const sanitizeStringForMatching = (input: string) =>
		input
			?.trim()
			.replace(/[^\w\s]/gi, "")
			.toLowerCase() || "";

	const loadPlayerQuests = (questNameToComplete: string) => {
		let remaining: PlayerQuestStatus[] = JSON.parse(
			sessionStorage.getItem("remainingQuest") || "[]",
		);
		const completed: PlayerQuestStatus[] = JSON.parse(
			sessionStorage.getItem("hasCompleted") || "[]",
		);
		const questToMove = remaining.find(
			(q) =>
				q.title.toLowerCase().trim() === questNameToComplete.toLowerCase().trim(),
		);

		if (questToMove) {
			remaining = remaining.filter(
				(q) =>
					q.title.toLowerCase().trim() !== questNameToComplete.toLowerCase().trim(),
			);
			completed.push({ ...questToMove, status: "COMPLETED" });
			sessionStorage.setItem("remainingQuest", JSON.stringify(remaining));
			sessionStorage.setItem("hasCompleted", JSON.stringify(completed));
		}
	};

	const copyStyle = (
		to: Window,
		node: HTMLStyleElement | HTMLLinkElement,
	): void => {
		try {
			const doc: Document = to.document;
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
	};
	const handleStepClick = (clickedIndex: number) => {
		updateCompletionState(clickedIndex);
	};
	const handlePopOut = (src: string, height: number, width: number) => {
		if (handles.popOutWindow && !handles.popOutWindow.closed) {
			handles.popOutWindow.close();
			handles.setPopOutWindow(null);
		} else {
			const newWindow = window.open(
				"./emptypage.html",
				`promptbox_${Date.now()}`,
				`width=${width + 20},height=${height + 100}`,
			);
			if (newWindow) {
				handles.setPopOutWindow(newWindow);
				newWindow.document.title = "Quest Image";

				newWindow.document.writeln(
					"<html><head><title>Quest Image</title></head><body></body></html>",
				);
				newWindow.document.close();

				const container = newWindow.document.createElement("div");
				newWindow.document.body.appendChild(container);

				document
					.querySelectorAll('style, link[rel="stylesheet"]')
					.forEach((stylesheet) => {
						copyStyle(newWindow, stylesheet as HTMLStyleElement | HTMLLinkElement);
					});
				const emotionStyles = document.querySelectorAll("style[data-emotion]");
				emotionStyles.forEach((style) => {
					const newEmotionStyle = newWindow.document.createElement("style");
					newEmotionStyle.textContent = style.textContent;
					newWindow.document.head.appendChild(newEmotionStyle);
				});

				const root = createRoot(container);
				root.render(
					<img
						src={src}
						style={{ maxWidth: "100%", height: "auto" }}
						alt="Quest Step"
						loading="lazy"
					/>,
				);
			}
		}
	};

	const allStepValues = useMemo(
		() => questSteps.map((_, index) => index.toString()),
		[questSteps],
	);

	const specialButtons = (
		<>
			{questName === "The Prisoner of Glouphrie" && (
				<Button
					size="compact-sm"
					variant="outline"
					onClick={pogModOpen}
					color={settings.buttonColor || ""}
				>
					Color Calculator
				</Button>
			)}
			{questName === "Lunar Diplomacy" && (
				<Button
					variant="outline"
					onClick={openLunarGrid}
					color={settings.buttonColor || ""}
				>
					Memorization
				</Button>
			)}
			{(questName === "Underground Pass" || questName === "Regicide") && (
				<Button
					size="compact-sm"
					variant="outline"
					onClick={openGrid}
					color={settings.buttonColor || ""}
				>
					Underground Pass Grid
				</Button>
			)}
		</>
	);

	return (
		<Flex
			direction="column"
			w="100%"
			maw="800px"
			h="100vh"
			style={{ margin: "0 auto" }}
		>
			<QuestModals
				openedSettings={settings.isSettingsModalOpen}
				closeSettings={closeSettingsModal}
				openedGrid={openedGrid}
				closeGrid={closeGrid}
				openedLunarGrid={openedLunar}
				closeLunarGrid={closeLunarGrid}
				openedNotes={openedNotes}
				closeNotes={closedNotes}
				openedPog={openedPog}
				closePog={pogModClose}
				uiColor={settings.textColor || ""}
			/>
			<QuestImageFetcher
				questName={questName}
				QuestListJSON={"./Quest Data/QuestImageList.json"}
			/>

			<Box p="xs" style={{ borderBottom: "1px solid #333" }}>
				<Stack gap="xs">
					<h2
						className="qpTitle"
						style={{
							color: settings.textColor || "",
							margin: 0,
							textAlign: "center",
						}}
					>
						{questName}
					</h2>
					<Flex gap="xs" justify="center" align="center">
						<Tippy
							content="Go back to the Quest Selection."
							disabled={!settings.toolTipsEnabled}
						>
							<Button
								variant="outline"
								color={settings.buttonColor || ""}
								onClick={() => handleBackButton(userID, questName)}
								leftSection={<IconArrowBack size={16} />}
							>
								Pick Another Quest
							</Button>
						</Tippy>
						<Button
							variant="outline"
							color={settings.buttonColor || ""}
							onClick={toggleShowStepReq}
						>
							{showStepReq ? "Show Quest Steps" : "Show Quest Details"}
						</Button>
					</Flex>
				</Stack>
			</Box>

			<Box
				ref={scrollContainerRef}
				style={{
					flex: 1,
					overflowY: "auto",
					minHeight: 0,
				}}
			>
				<Box style={{ padding: "0.5rem", paddingBottom: "50px" }}>
					{showStepReq ? (
						<Suspense fallback={<div>Loading Details...</div>}>
							<QuestDetailContents
								QuestDetails={questDetails!}
								expanded={expanded}
								setExpanded={!setExpanded}
								ignoredRequirements={ignoredRequirements}
								skillLevels={skillLevels!}
								completedQuests={completedQuests!}
							/>
						</Suspense>
					) : (
						<Accordion
							multiple={settings.isExpandedMode}
							value={settings.isExpandedMode ? allStepValues : active.toString()}
							onChange={handleAccordionChange}
						>
							{questSteps?.map((step, index) => {
								const matchedImages: QuestImage[] =
									imageDetails.imageList?.filter(
										(img: { stepDescription: string }) =>
											sanitizeStringForMatching(img.stepDescription) ===
											sanitizeStringForMatching(step.stepDescription),
									) || [];
								return (
									<CompactQuestStep
										key={index}
										step={step}
										index={index}
										isCompleted={completedSteps.has(index)}
										images={matchedImages}
										onImagePopOut={handlePopOut}
										onStepClick={settings.isExpandedMode ? handleStepClick : undefined}
										quest={questName}
									/>
								);
							})}
						</Accordion>
					)}
				</Box>
			</Box>
			{!showStepReq && (
				<QuestFooter
					onSettingsClick={openSettingsModal}
					onDiscordClick={openDiscord}
					onNotesClick={openNotes}
					onBackClick={() => handleBackButton(userID, questName)}
					onCompleteClick={() => loadPlayerQuests(questName)}
					onWikiClick={() => openWikiQuest(questName)}
					onCoffeeClick={openCoffee}
					onNextStep={scrollNext}
					onPrevStep={scrollPrev}
					specialButtons={specialButtons}
					toolTipEnabled={settings.toolTipsEnabled}
					buttonColor={settings.buttonColor}
				/>
			)}
		</Flex>
	);
};

export default React.memo(QuestPage);
