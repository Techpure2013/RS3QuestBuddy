import React from "react";
import { ActionIcon, Box, Button } from "@mantine/core";
import {
	IconBrandDiscord,
	IconSettings,
	IconPlus,
	IconWorldWww,
	IconCoffee,
	IconArrowBack,
	IconCheck,
} from "@tabler/icons-react";
import Tippy from "@tippyjs/react";

// Define props for all the actions
type QuestFooterProps = {
	onSettingsClick: () => void;
	onDiscordClick: () => void;
	onNotesClick: () => void;
	onBackClick: () => void;
	onCompleteClick: () => void;
	onWikiClick: () => void;
	onCoffeeClick: () => void;
	onNextStep: () => void;
	onPrevStep: () => void;
	specialButtons: React.ReactNode; // For POG, Grids, etc.
	toolTipEnabled: boolean;
	buttonColor: string;
};

export const QuestFooter: React.FC<QuestFooterProps> = ({
	onSettingsClick,
	onDiscordClick,
	onNotesClick,
	onBackClick,
	onCompleteClick,
	onWikiClick,
	onCoffeeClick,
	onNextStep,
	onPrevStep,
	specialButtons,
	toolTipEnabled,
	buttonColor,
}) => (
	<Box style={{ borderTop: "1px solid #333" }}>
		<div className="prevNextGroup">
			<div id="icons">
				<Tippy content="Settings" disabled={!toolTipEnabled}>
					<ActionIcon
						onClick={onSettingsClick}
						variant="outline"
						size="sm"
						color={buttonColor || ""}
					>
						<IconSettings />
					</ActionIcon>
				</Tippy>
				{/* Apply color prop to all other ActionIcons as well... */}
				<Tippy content="Discord" disabled={!toolTipEnabled}>
					<ActionIcon
						onClick={onDiscordClick}
						variant="outline"
						size="sm"
						color={buttonColor || ""}
					>
						<IconBrandDiscord />
					</ActionIcon>
				</Tippy>
				<Tippy content="Notes" disabled={!toolTipEnabled}>
					<ActionIcon
						onClick={onNotesClick}
						variant="outline"
						size="sm"
						color={buttonColor || ""}
					>
						<IconPlus />
					</ActionIcon>
				</Tippy>
				<Tippy content="Back to Quest List" disabled={!toolTipEnabled}>
					<ActionIcon
						onClick={onBackClick}
						variant="outline"
						size="sm"
						color={buttonColor || ""}
					>
						<IconArrowBack />
					</ActionIcon>
				</Tippy>
				<Tippy content="Complete Quest" disabled={!toolTipEnabled}>
					<ActionIcon
						onClick={onCompleteClick}
						variant="outline"
						size="sm"
						color={buttonColor || ""}
					>
						<IconCheck color="#4EE669" />
					</ActionIcon>
				</Tippy>
				<Tippy content="Open Wiki Guide" disabled={!toolTipEnabled}>
					<ActionIcon
						onClick={onWikiClick}
						variant="outline"
						size="sm"
						color={buttonColor || ""}
					>
						<IconWorldWww />
					</ActionIcon>
				</Tippy>
				<Tippy content="Support the Dev" disabled={!toolTipEnabled}>
					<ActionIcon
						onClick={onCoffeeClick}
						variant="outline"
						size="sm"
						color={buttonColor || ""}
					>
						<IconCoffee />
					</ActionIcon>
				</Tippy>
			</div>
			{specialButtons}
			<div id="prev-next">
				<Button
					size="compact-sm"
					variant="outline"
					onClick={onNextStep}
					color={buttonColor || ""}
				>
					Next Step
				</Button>
				<Button
					size="compact-sm"
					variant="outline"
					onClick={onPrevStep}
					color={buttonColor || ""}
				>
					Prev Step
				</Button>
			</div>
		</div>
	</Box>
);
