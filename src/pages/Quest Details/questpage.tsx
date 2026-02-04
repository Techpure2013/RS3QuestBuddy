import React, {
	useEffect,
	useMemo,
	useRef,
	useState,
	Suspense,
	lazy,
} from "react";
import { useParams } from "react-router-dom";
import { Accordion, Box, Button, Flex, Stack } from "@mantine/core";
import { createRoot } from "react-dom/client";
import Tippy from "@tippyjs/react";
import { IconArrowBack } from "@tabler/icons-react";

import { CompactQuestStep } from "./Quest Detail Components/QuestStepDisplay";
import { QuestModals } from "./Quest Detail Components/QuestModals";
import { QuestFooter } from "./Quest Detail Components/QuestFooter";

import { useQuestPageFunctions } from "./questPageFunctions";
import { useDialogSolver } from "./dialogsolverRW";
import { useQuestControllerStore } from "./../../Handlers/HandlerStore";
import { getQuestSwaps } from "./../../util/DescriptionSwap";

import type { PlayerQuestStatus } from "./../../state/types";
import type { Quest, QuestImage } from "./../../state/types";
import {
	fetchQuestBundleNormalized,
	getCachedQuest,
} from "./../../idb/questBundleClient";

import useNotesDisclosure from "./Quest Detail Components/useDisclosure";
import usePOGDisclosure from "./Quest Detail Components/POGCalcDisclosure";
import useGridDisclosure from "./Quest Detail Components/useGridModal";
import useLunarGridDisclosure from "./Quest Detail Components/useLunarDisclosure";
import { useSettings } from "./../../Entrance/Entrance Components/SettingsContext";
import {
	loadPlayerSession,
	PlayerSession,
	writeSession,
} from "./../../idb/playerSessionStore";
import { usePlayerSelector } from "./../../state/usePlayerSelector";
import { hasRichTextFormatting, stripFormatting } from "./../../util/RichText";

const QuestDetailContents = lazy(
	() => import("./Quest Detail Components/QuestDetailsAccordion"),
);

const QuestPage: React.FC = () => {
	const {
		handleBackButton,
		openDiscord,
		openWikiQuest,
		useAlt1Listener,
		openCoffee,
		ignoredRequirements,
	} = useQuestPageFunctions();
	const skillLevels = usePlayerSelector((s) => s.player.skills);
	const completedQuests = usePlayerSelector((_, d) => d.completedQuests());
	const { stepCapture } = useDialogSolver();
	const handles = useQuestControllerStore();
	const { showStepReq, toggleShowStepReq } = useQuestControllerStore();

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { questName: encodedQuestName } = useParams<{ questName: string }>();
	const questName = decodeURIComponent(encodedQuestName ?? "");

	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
	const [active, setActive] = useState(-1);

	const [openedGrid, { openGrid, closeGrid }] = useGridDisclosure(false);
	const [openedLunar, { openLunarGrid, closeLunarGrid }] =
		useLunarGridDisclosure(false);
	const [openedPog, { pogModOpen, pogModClose }] = usePOGDisclosure(false);
	const [openedNotes, { openNotes, closedNotes }] = useNotesDisclosure(false);
	const { settings, openSettingsModal, closeSettingsModal } = useSettings();

	// DB-backed quest bundle
	const [questData, setQuestData] = useState<Quest | null>(null);
	const questSteps = questData?.questSteps ?? [];
	const questDetails = questData?.questDetails ?? null;
	const questImages = questData?.questImages ?? [];

	// Handle scroll when toggling between Quest Details and Quest Steps views
	useEffect(() => {
		if (showStepReq) {
			// Switching to Quest Details view - scroll to top
			window.scrollTo(0, 0);
			scrollContainerRef.current?.scrollTo(0, 0);
		} else {
			// Switching to Quest Steps view - scroll to active step if saved, otherwise top
			if (active >= 0 && !settings.isExpandedMode && settings.autoScrollEnabled) {
				const timer = setTimeout(() => {
					const targetElement = document.getElementById(active.toString());
					targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
				}, 100);
				return () => clearTimeout(timer);
			} else {
				window.scrollTo(0, 0);
				scrollContainerRef.current?.scrollTo(0, 0);
			}
		}
	}, [showStepReq]);

	// Smooth-scroll to active step in non-expanded mode
	useEffect(() => {
		if (active === -1 || settings.isExpandedMode || !settings.autoScrollEnabled)
			return;
		const timer = setTimeout(() => {
			const targetElement = document.getElementById(active.toString());
			targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 250);
		return () => clearTimeout(timer);
	}, [active, settings.isExpandedMode, settings.autoScrollEnabled]);

	// Load quest bundle (cache first, then ensure fresh)
	useEffect(() => {
		let alive = true;
		(async () => {
			// 1) try cache from prefetch
			const cached = getCachedQuest(questName);
			if (cached && alive) setQuestData(cached);

			// 2) fetch/normalize to ensure fresh
			try {
				const fresh = await fetchQuestBundleNormalized(questName);
				if (!alive) return;
				setQuestData(fresh);
			} catch (e) {
				console.error("Failed to load quest bundle:", e);
				if (!cached && alive) setQuestData(null);
			}
		})();
		return () => {
			alive = false;
		};
	}, [questName]);

	// Load persisted UI state
	useEffect(() => {
		const savedActive = localStorage.getItem(`lastActiveStep-${questName}`);
		const savedCompleted = localStorage.getItem(`completedSteps-${questName}`);

		if (savedCompleted) {
			const completedSet = new Set<number>(JSON.parse(savedCompleted));
			setCompletedSteps(completedSet);
			const highestCompleted =
				completedSet.size > 0 ? Math.max(...completedSet) : -1;
			setActive(highestCompleted);
		} else if (savedActive) {
			setActive(parseInt(savedActive, 10));
		} else {
			// No saved progress - scroll to top
			window.scrollTo(0, 0);
			scrollContainerRef.current?.scrollTo(0, 0);
		}
	}, [questName]);

	useEffect(() => {
		localStorage.setItem(`lastActiveStep-${questName}`, active.toString());
	}, [active, questName]);

	useEffect(() => {
		localStorage.setItem(
			`completedSteps-${questName}`,
			JSON.stringify([...completedSteps]),
		);
	}, [completedSteps, questName]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!openedNotes && event.key === " ") {
				event.preventDefault();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [openedNotes]);

	const updateCompletionState = (targetIndex: number) => {
		if (!questSteps || !questSteps.length) return;
		const newCompleted = new Set<number>();
		for (let i = 0; i <= targetIndex; i++) newCompleted.add(i);
		setCompletedSteps(newCompleted);
	};

	const handleAccordionChange = (value: string | string[] | null) => {
		if (settings.isExpandedMode) return;
		const nextStep = value === null ? -1 : parseInt(value as string, 10);
		if (!isNaN(nextStep) && nextStep !== active) {
			setActive(nextStep);
			updateCompletionState(nextStep);

			if (
				settings.dialogSolverEnabled &&
				questSteps?.[nextStep] &&
				(window as any).alt1
			) {
				const currentStep = questSteps[nextStep];
				const swaps = getQuestSwaps(questName);
				const deletionStrings = swaps.map((s) => s.deletedIf).filter(Boolean);
				const filteredAdditionalInfo = (
					currentStep.additionalStepInformation ?? []
				).filter((info) => !deletionStrings.includes(info));
				const infoString = filteredAdditionalInfo.join(". ");
				const allSteps = [currentStep.stepDescription, infoString].join(" ");
				const rich = hasRichTextFormatting(allSteps);
				if (rich) {
					stripFormatting(allSteps);
				}
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
		const prevStep = Math.max(active - 1, -1);
		setActive(prevStep);
		updateCompletionState(prevStep);
	};

	useAlt1Listener(scrollNext);

	const sanitizeStringForMatching = (input: string) =>
		input
			?.trim()
			.replace(/[^\w\s]/gi, "")
			.toLowerCase() || "";

	const loadPlayerQuests = async (questNameToComplete: string) => {
		try {
			const session = (await loadPlayerSession()) as PlayerSession | null;
			if (!session) {
				console.warn("No player session in IDB; nothing to update.");
				return;
			}

			const remaining: PlayerQuestStatus[] = Array.isArray(session.remainingQuest)
				? session.remainingQuest
				: [];
			const completed: PlayerQuestStatus[] = Array.isArray(session.hasCompleted)
				? session.hasCompleted
				: [];

			const targetTitle = questNameToComplete.toLowerCase().trim();

			const questIndex = remaining.findIndex(
				(q) => q.title?.toLowerCase().trim() === targetTitle,
			);
			if (questIndex === -1) {
				console.warn(
					"Quest to complete not found in remaining:",
					questNameToComplete,
				);
				return;
			}

			const questToMove = {
				...remaining[questIndex],
				status: "COMPLETED" as const,
			};
			const newRemaining = remaining
				.slice(0, questIndex)
				.concat(remaining.slice(questIndex + 1));
			const newCompleted = [...completed, questToMove];

			const updated: PlayerSession = {
				...session,
				remainingQuest: newRemaining,
				hasCompleted: newCompleted,
				updatedAt: new Date().toISOString(),
			};

			await writeSession(updated);
		} catch (e) {
			console.error("Failed to update player session in IDB:", e);
		}
	};

	const copyStyle = (to: Window, node: HTMLStyleElement | HTMLLinkElement) => {
		try {
			const doc = to.document;
			if (node.tagName === "STYLE") {
				const newStyle = doc.createElement("style");
				newStyle.textContent = node.textContent || "";
				doc.head.appendChild(newStyle);
			}
			if (node.tagName === "LINK" && "rel" in node) {
				const newLink = doc.createElement("link");
				newLink.rel = (node as HTMLLinkElement).rel || "";
				newLink.href = (node as HTMLLinkElement).href || "";
				newLink.type = (node as HTMLLinkElement).type || "";
				doc.head.appendChild(newLink);
			}
		} catch (error) {
			console.error("Error copying style:", error);
		}
	};

	const handleStepClick = (clickedIndex: number) => {
		setActive(clickedIndex);
		// Only scroll if auto-scroll is enabled
		if (settings.autoScrollEnabled) {
			// In expanded mode, useEffect doesn't scroll, so we do it directly
			if (settings.isExpandedMode) {
				setTimeout(() => {
					const targetElement = document.getElementById(clickedIndex.toString());
					targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
				}, 100);
			}
			// In compact mode, the useEffect handles scrolling
		}
		updateCompletionState(clickedIndex);
	};
	// Adjust to how your folders are actually named on disk
	function folderize(name: string) {
		return name
			.normalize("NFKD")
			
			.replace(/[:]/g, ""); // colons
	}
	const safeQuestName = folderize(questName);
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
					const s = newWindow.document.createElement("style");
					s.textContent = style.textContent;
					newWindow.document.head.appendChild(s);
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

	const userID = localStorage.getItem("userID");

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
				style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
			>
				<Box style={{ padding: "0.5rem", paddingBottom: "50px" }}>
					{showStepReq ? (
						<Suspense fallback={<div>Loading Details...</div>}>
							{questDetails ? (
								<QuestDetailContents
									QuestDetails={[questDetails]}
									ignoredRequirements={ignoredRequirements}
									skillLevels={skillLevels || undefined}
									completedQuests={completedQuests || []}
								/>
							) : (
								<div>Loading Details...</div>
							)}
						</Suspense>
					) : (
						<Accordion
							multiple={settings.isExpandedMode}
							value={
								settings.isExpandedMode
									? allStepValues
									: active >= 0
										? active.toString()
										: null
							}
							onChange={handleAccordionChange}
						>
							{questSteps.map((step, index) => {
								const matchedImages: QuestImage[] =
									questImages.filter(
										(img) =>
											sanitizeStringForMatching(img.stepDescription) ===
											sanitizeStringForMatching(step.stepDescription),
									) || [];

								return (
									<CompactQuestStep
										safeQuestName={safeQuestName}
										key={index}
										step={step}
										index={index}
										isCompleted={completedSteps.has(index)}
										images={matchedImages}
										onImagePopOut={handlePopOut}
										onStepClick={handleStepClick}
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
