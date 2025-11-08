import { Badge, Button, Menu } from "@mantine/core";
import {
	IconBooks,
	IconCalendarEvent,
	IconChevronDown,
	IconClock,
	IconFilter,
} from "@tabler/icons-react";
import SubMenu from "./SubMenu"; // Make sure the path to SubMenu is correct
import { CustomIcon } from "./CustomIcon";
import { Filter, SortKey } from "./../QuestCarousel";
import type { QuestAge, QuestSeries } from "./../../../state/types";
// Data for the sub-menus
const questAges = [
	"Fifth Age",
	"Ambiguous (Fits into Either Ages)",
	"Sixth Age",
	"Age of Chaos",
];

const questSeries = [
	"No Series",
	"Delrith",
	"Pirate",
	"Fairy",
	"Camelot",
	"Gnome",
	"Elf (Prifddinas)",
	"Ogre",
	"Elemental Workshop",
	"Myreque",
	"Troll",
	"Fremennik",
	"Desert",
	"Cave Goblin",
	"Dwarf (Red Axe)",
	"Temple Knight",
	"Enchanted Key",
	"Odd Old Man",
	"Wise Old Man",
	"Penguin",
	"TzHaar",
	"Summer",
	"Thieves' Guild",
	"Void Knight",
	"Fremennik Sagas",
	"Ozan",
	"Doric's Tasks",
	"Boric's Tasks",
	"Ariane",
	"Tales of the Arc",
	"Violet Tendencies",
	"Seasons",
	"Mahjarrat Mysteries",
	"Sliske's Game",
	"The Elder God Wars",
	"Legacy of Zamorak",
	"Fort Forinthry",
	"The First Necromancer",
	"City of Um",
];

// Define the props interface for type safety
interface MenuInterfaceProps {
	onFilterChange: (value: Filter) => void;
	onSortChange: (key: SortKey) => void;
	activeFilterCount: number;
}

function MenuInterface({
	onFilterChange,
	onSortChange,
	activeFilterCount,
}: MenuInterfaceProps) {
	const areFiltersActive = activeFilterCount > 0;

	return (
		<div className="SearchContainer">
			<Menu
				transitionProps={{ transition: "pop-top-right" }}
				position="top-end"
				width={220}
				withinPortal
				radius="md"
				shadow="md"
			>
				<Menu.Target>
					<Button
						leftSection={<IconFilter size={18} />}
						rightSection={
							areFiltersActive ? (
								<Badge circle color="blue" size="sm">
									{activeFilterCount}
								</Badge>
							) : (
								<IconChevronDown size={18} stroke={1.5} />
							)
						}
						pr={12}
						radius="md"
						variant={areFiltersActive ? "filled" : "outline"}
					>
						Filter Quests
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<SubMenu
						leftSection={<IconClock size={16} />}
						title="Quest Age"
						items={questAges}
						onItemClick={(value: string) =>
							onFilterChange({ type: "Quest Age", value: value as QuestAge })
						}
					/>
					<SubMenu
						leftSection={<IconBooks size={16} />}
						title="Series"
						items={questSeries}
						scrollable
						onItemClick={(value: string) =>
							onFilterChange({ type: "Series", value: value as QuestSeries })
						}
					/>

					<Menu.Item
						leftSection={<CustomIcon src="./assets/Quest_points.png" />}
						onClick={() => onSortChange("Quest Points")}
					>
						Quest Points
					</Menu.Item>
					<Menu.Item
						leftSection={<IconCalendarEvent size={16} />}
						onClick={() => onSortChange("Release Date")}
					>
						Release Date
					</Menu.Item>
					<Menu.Item
						leftSection={<CustomIcon src="./assets/IronmanImage.png" />}
						onClick={() => onSortChange("Efficient Ironman Quests")}
					>
						Efficient Ironman Quests
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</div>
	);
}

export default MenuInterface;
