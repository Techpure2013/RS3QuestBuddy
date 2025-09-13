import { Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import React from "react";

interface SubMenuProps {
	title: string;
	items: string[];
	onItemClick: (value: string) => void;
	scrollable?: boolean;
	leftSection?: React.ReactNode;
}

const SubMenu: React.FC<SubMenuProps> = ({
	title,
	items,
	onItemClick,
	scrollable = false,
	leftSection,
}) => {
	return (
		<Menu.Sub>
			{/* This is the part of the menu that is always visible */}
			<Menu.Sub.Target>
				<Menu.Sub.Item
					leftSection={leftSection}
					rightSection={<IconChevronDown size={18} stroke={1.5} />}
				>
					{title}
				</Menu.Sub.Item>
			</Menu.Sub.Target>

			{/* This is the dropdown that appears on hover/click */}
			<Menu.Sub.Dropdown
				// Conditionally apply styles for a scrollable list
				style={
					scrollable
						? {
								maxHeight: "200px",
								overflowY: "auto",
							}
						: undefined
				}
			>
				{/* Map over the 'items' array to dynamically create a Menu.Item for each one */}
				{items.map((item) => (
					<Menu.Item
						key={item} // React needs a unique key for each item in a list
						value={item}
						// When an item is clicked, call the function passed in via props
						onClick={() => onItemClick(item)}
					>
						{item}
					</Menu.Item>
				))}
			</Menu.Sub.Dropdown>
		</Menu.Sub>
	);
};

export default SubMenu;
