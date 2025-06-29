import React from "react";
interface SubMenuProps {
    title: string;
    items: string[];
    onItemClick: (value: string) => void;
    scrollable?: boolean;
}
declare const SubMenu: React.FC<SubMenuProps>;
export default SubMenu;
