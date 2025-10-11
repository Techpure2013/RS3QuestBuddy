import { Badge, Button, Menu } from "@mantine/core";
import {
	IconAward,
	IconBooks,
	IconCalendarEvent,
	IconChevronDown,
	IconClock,
	IconFilter,
} from "@tabler/icons-react";
import SubMenu from "./SubMenu"; // Make sure the path to SubMenu is correct
import { CustomIcon } from "./CustomIcon";
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
	onFilterChange: (type: string, value: string) => void;
}

// The component now accepts a props object and destructures questList from it
interface MenuInterfaceProps {
	onFilterChange: (type: string, value: string) => void;
	activeFilterCount: number; // New prop to receive the count of active filters
}

function MenuInterface({
	onFilterChange,
	activeFilterCount,
}: MenuInterfaceProps) {
	function handleFilterChange(filterType: string, value: string) {
		onFilterChange(filterType, value);
	}

	const areFiltersActive = activeFilterCount > 0;

	return (
		<div className="SearchContainer">
			<Menu
				transitionProps={{ transition: "pop-top-right" }}
				position="top-end"
				width={220}
				withinPortal
				radius="md"
				shadow="md" // Add a subtle shadow for depth
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
					{/* Use the reusable SubMenu component for Quest Age */}
					<SubMenu
						leftSection={<IconClock size={16} />}
						title="Quest Age"
						items={questAges}
						onItemClick={(value: string) => handleFilterChange("Quest Age", value)}
					/>
					{/* Use the reusable SubMenu component for Series */}
					<SubMenu
						leftSection={<IconBooks size={16} />}
						title="Series"
						items={questSeries}
						onItemClick={(value: string) => handleFilterChange("Series", value)}
						scrollable // Enable scrolling for this long list
					/>
					{/* Standard menu items for sorting */}
					<Menu.Item
						leftSection={<CustomIcon src="./assets/Quest_points.png" />}
						onClick={() => handleFilterChange("Sort", "Quest Points")}
					>
						Quest Points
					</Menu.Item>
					<Menu.Item
						leftSection={<IconCalendarEvent size={16} />}
						onClick={() => handleFilterChange("Sort", "Release Date")}
					>
						Release Date
					</Menu.Item>
					<Menu.Item
						leftSection={<CustomIcon src="./assets/IronmanImage.png" />}
						onClick={() => handleFilterChange("Sort", "Efficient Ironman Quests")}
					>
						Efficient Ironman Quests
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</div>
	);
}

export default MenuInterface;
