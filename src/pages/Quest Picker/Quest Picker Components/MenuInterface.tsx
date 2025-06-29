import { Button, Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { QuestList } from "Fetchers/FetchQuestList";
import SubMenu from "./SubMenu"; // Make sure the path to SubMenu is correct

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
function MenuInterface({ onFilterChange }: MenuInterfaceProps) {
	// A single, reusable handler for all filter/sort actions
	function handleFilterChange(filterType: string, value: string) {
		onFilterChange(filterType, value);
	}

	return (
		<div className="SearchContainer">
			<Menu
				transitionProps={{ transition: "pop-top-right" }}
				position="top-end"
				width={220}
				withinPortal
				radius="md"
			>
				<Menu.Target>
					<Button
						rightSection={<IconChevronDown size={18} stroke={1.5} />}
						pr={12}
						radius="md"
					>
						Filter Quests
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					{/* Use the reusable SubMenu component for Quest Age */}
					<SubMenu
						title="Quest Age"
						items={questAges}
						onItemClick={(value: string) => handleFilterChange("Quest Age", value)}
					/>
					{/* Use the reusable SubMenu component for Series */}
					<SubMenu
						title="Series"
						items={questSeries}
						onItemClick={(value: string) => handleFilterChange("Series", value)}
						scrollable // Enable scrolling for this long list
					/>
					{/* Standard menu items for sorting */}
					<Menu.Item onClick={() => handleFilterChange("Sort", "Quest Points")}>
						Quest Points
					</Menu.Item>
					<Menu.Item onClick={() => handleFilterChange("Sort", "Release Date")}>
						Release Date
					</Menu.Item>
					<Menu.Item
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
