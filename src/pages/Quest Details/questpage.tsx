import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Accordion, Box, Button, Flex, Stack, ActionIcon } from "@mantine/core";
import { createRoot } from "react-dom/client";
import Tippy from "@tippyjs/react";
// --- NEW: Import the new icon ---
import {
	IconArrowBack,
	IconPin,
	IconListDetails,
	IconFocusCentered,
} from "@tabler/icons-react";

// Refactored Components
import { CompactQuestStep } from "./Quest Detail Components/QuestStepDisplay";
import { QuestModals } from "./Quest Detail Components/QuestModals";
import { QuestFooter } from "./Quest Detail Components/QuestFooter";
import { useUiSettings } from "./Quest Detail Components/useUiSettings";

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

// Types
import { Skills } from "./../../Fetchers/PlayerStatsSort";
import { PlayerQuestStatus } from "./../../Fetchers/sortPlayerQuests";

// Disclosure Hooks
import { useDisclosure } from "@mantine/hooks";
import useNotesDisclosure from "./Quest Detail Components/useDisclosure";
import usePOGDisclosure from "./Quest Detail Components/POGCalcDisclosure";
import useGridDisclosure from "./Quest Detail Components/useGridModal";
import useLunarGridDisclosure from "./Quest Detail Components/useLunarDisclosure";

// Lazy Loaded Components
const QuestDetailContents = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./Quest Detail Components/QuestDetailsAccordion").default,
			});
		}),
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
	const { settings, reloadSettings } = useUiSettings();
	const imageDetails = UseImageStore();
	const { getQuestDetails, questDetails, getQuestNamedDetails } =
		useQuestDetails();
	const { stepCapture } = useDialogSolver();
	const handles = useQuestControllerStore();
	const { showStepReq, toggleShowStepReq } = useQuestControllerStore();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const location = useLocation();
	const { questName } = location.state;
	const userID = localStorage.getItem("userID");

	const [active, setActive] = useState(-1);
	const [highestStepVisited, setHighestStepVisited] = useState(active);
	const [skillLevels, setSkillLevels] = useState<Skills | null>(null);
	const [completedQuests, setCompleteQuests] = useState<
		PlayerQuestStatus[] | null
	>(null);
	const [expanded, setExpanded] = useState<string[]>([]);

	const [persistAccordion, setPersistAccordion] = useState(false);
	const [isExpandedMode, setIsExpandedMode] = useState(false);
	// --- NEW: State for the auto-scroll feature, defaulting to on ---
	const [autoScroll, setAutoScroll] = useState(true);

	const [openedSettings, { open: openSettings, close: closeSettings }] =
		useDisclosure(false);
	const [openedGrid, { openGrid, closeGrid }] = useGridDisclosure(false);
	const [openedLunar, { openLunarGrid, closeLunarGrid }] =
		useLunarGridDisclosure(false);
	const [openedPog, { pogModOpen, pogModClose }] = usePOGDisclosure(false);
	const [openedNotes, { openNotes, closedNotes }] = useNotesDisclosure(false);

	// --- NEW: Effect to load the auto-scroll setting from localStorage on mount ---
	useEffect(() => {
		const savedSetting = localStorage.getItem("autoScrollEnabled");
		// Default to true if the setting doesn't exist yet
		setAutoScroll(savedSetting === null ? true : JSON.parse(savedSetting));
	}, []);

	useEffect(() => {
		const persistSetting =
			localStorage.getItem("persistAccordionState") === "true";
		setPersistAccordion(persistSetting);

		if (persistSetting) {
			const lastActiveStep = sessionStorage.getItem(`lastActiveStep-${questName}`);
			if (lastActiveStep) {
				setActive(parseInt(lastActiveStep, 10));
			}
		}
	}, [questName]);

	useEffect(() => {
		if (persistAccordion && active !== -1) {
			sessionStorage.setItem(`lastActiveStep-${questName}`, active.toString());
		}
	}, [active, persistAccordion, questName]);

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

	// --- IMPROVEMENT: Scrolling logic is now conditional on the 'autoScroll' state ---
	useEffect(() => {
		if (active === -1 || isExpandedMode || !autoScroll) return;

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
	}, [active, isExpandedMode, autoScroll]);

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!openedNotes) {
			if (event.key === " ") {
				event.preventDefault();
			}
		}
	};

	const handleAccordionChange = (value: string | string[] | null) => {
		if (isExpandedMode) {
			return;
		}

		const singleValue = value as string | null;
		const nextStep = singleValue === null ? -1 : parseInt(singleValue, 10);

		if (!isNaN(nextStep)) {
			setActive(nextStep);
			if (nextStep !== -1) {
				setHighestStepVisited((h) => Math.max(h, nextStep));
				if (settings.dialogOption && questSteps[nextStep] && window.alt1) {
					stepCapture(questSteps[nextStep].stepDescription);
				}
			}
		}
	};

	const scrollNext = () => {
		if (active + 1 < questSteps.length)
			handleAccordionChange((active + 1).toString());
	};
	const scrollPrev = () => {
		if (active > 0) handleAccordionChange((active - 1).toString());
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
					/>,
				);
			}
		}
	};

	const handleTogglePersist = () => {
		const newValue = !persistAccordion;
		setPersistAccordion(newValue);
		localStorage.setItem("persistAccordionState", JSON.stringify(newValue));
		if (!newValue) {
			sessionStorage.removeItem(`lastActiveStep-${questName}`);
		}
	};

	const toggleExpandedMode = () => {
		setIsExpandedMode((prev) => !prev);
	};

	// --- NEW: Handler to toggle auto-scroll and save the preference ---
	const handleToggleAutoScroll = () => {
		const newValue = !autoScroll;
		setAutoScroll(newValue);
		localStorage.setItem("autoScrollEnabled", JSON.stringify(newValue));
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
					color={settings.hasButtonColor ? settings.userButtonColor : ""}
				>
					Color Calculator
				</Button>
			)}
			{questName === "Lunar Diplomacy" && (
				<Button
					variant="outline"
					onClick={openLunarGrid}
					color={settings.hasButtonColor ? settings.userButtonColor : ""}
				>
					Memorization
				</Button>
			)}
			{(questName === "Underground Pass" || questName === "Regicide") && (
				<Button
					size="compact-sm"
					variant="outline"
					onClick={openGrid}
					color={settings.hasButtonColor ? settings.userButtonColor : ""}
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
				openedSettings={openedSettings}
				closeSettings={() => {
					closeSettings();
					reloadSettings();
				}}
				openedGrid={openedGrid}
				closeGrid={closeGrid}
				openedLunarGrid={openedLunar}
				closeLunarGrid={closeLunarGrid}
				openedNotes={openedNotes}
				closeNotes={closedNotes}
				openedPog={openedPog}
				closePog={pogModClose}
				uiColor={settings.hasColor ? settings.userColor : ""}
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
							color: settings.hasColor ? settings.userColor : "",
							margin: 0,
							textAlign: "center",
						}}
					>
						{questName}
					</h2>
					<Flex gap="xs" justify="center" align="center">
						<Tippy
							content="Go back to the Quest Selection."
							disabled={!settings.toolTipEnabled}
						>
							<Button
								variant="outline"
								color={settings.hasButtonColor ? settings.userButtonColor : ""}
								onClick={() => handleBackButton(userID, questName)}
								leftSection={<IconArrowBack size={16} />}
							>
								Pick Another Quest
							</Button>
						</Tippy>
						<Button
							variant="outline"
							color={settings.hasButtonColor ? settings.userButtonColor : ""}
							onClick={toggleShowStepReq}
						>
							{showStepReq ? "Show Quest Steps" : "Show Quest Details"}
						</Button>
						<Tippy
							content={
								persistAccordion
									? "Disable Step Persistence"
									: "Enable Step Persistence"
							}
							disabled={!settings.toolTipEnabled}
						>
							<ActionIcon
								variant={persistAccordion ? "filled" : "outline"}
								color={settings.hasButtonColor ? settings.userButtonColor : "blue"}
								onClick={handleTogglePersist}
							>
								<IconPin size={16} />
							</ActionIcon>
						</Tippy>
						<Tippy
							content={isExpandedMode ? "Collapse All Steps" : "Expand All Steps"}
							disabled={!settings.toolTipEnabled}
						>
							<ActionIcon
								variant={isExpandedMode ? "filled" : "outline"}
								color={settings.hasButtonColor ? settings.userButtonColor : "blue"}
								onClick={toggleExpandedMode}
							>
								<IconListDetails size={16} />
							</ActionIcon>
						</Tippy>
						{/* --- NEW: Auto-Scroll Toggle Button --- */}
						<Tippy
							content={autoScroll ? "Disable Auto-Scroll" : "Enable Auto-Scroll"}
							disabled={!settings.toolTipEnabled}
						>
							<ActionIcon
								variant={autoScroll ? "filled" : "outline"}
								color={settings.hasButtonColor ? settings.userButtonColor : "blue"}
								onClick={handleToggleAutoScroll}
							>
								<IconFocusCentered size={16} />
							</ActionIcon>
						</Tippy>
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
								QuestDetails={questDetails}
								uiState={settings}
								expanded={expanded}
								setExpanded={setExpanded}
								ignoredRequirements={ignoredRequirements}
								skillLevels={skillLevels}
								completedQuests={completedQuests}
							/>
						</Suspense>
					) : (
						<Accordion
							multiple={isExpandedMode}
							value={isExpandedMode ? allStepValues : active.toString()}
							onChange={handleAccordionChange}
						>
							{questSteps?.map((step, index) => {
								const matchedImages: QuestImage[] =
									imageDetails.imageList?.filter(
										(img) =>
											sanitizeStringForMatching(img.stepDescription) ===
											sanitizeStringForMatching(step.stepDescription),
									) || [];
								return (
									<CompactQuestStep
										key={index}
										step={step}
										index={index}
										isCompleted={active > index}
										images={matchedImages}
										onImagePopOut={handlePopOut}
									/>
								);
							})}
						</Accordion>
					)}
				</Box>
			</Box>

			<QuestFooter
				onSettingsClick={openSettings}
				onDiscordClick={openDiscord}
				onNotesClick={openNotes}
				onBackClick={() => handleBackButton(userID, questName)}
				onCompleteClick={() => loadPlayerQuests(questName)}
				onWikiClick={() => openWikiQuest(questName)}
				onCoffeeClick={openCoffee}
				onNextStep={scrollNext}
				onPrevStep={scrollPrev}
				specialButtons={specialButtons}
				toolTipEnabled={settings.toolTipEnabled}
				buttonColor={settings.userButtonColor}
				hasButtonColor={settings.hasButtonColor}
			/>
		</Flex>
	);
};

export default React.memo(QuestPage);
