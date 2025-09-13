// src/components/CustomIcon.tsx
import React from "react";

interface CustomIconProps {
	src: string; // The path to your image
	size?: number | string; // The size (width and height) of the icon
	alt?: string; // Alt text for accessibility
}

export const CustomIcon: React.FC<CustomIconProps> = ({
	src,
	size = 16, // Default to 16px to match the other icons
	alt = "Custom Icon",
}) => {
	return (
		<img
			src={src}
			alt={alt}
			style={{
				width: size,
				height: size,
				// Optional: ensures the image scales nicely within its box
				objectFit: "contain",
			}}
		/>
	);
};
