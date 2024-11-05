// FontContextProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

// Define the context's shape
interface FontSizeContextType {
	fontSize: number;
	setFontSize: (size: number) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
	fontSize: 16, // Default font size
	setFontSize: () => {}, // Placeholder function
});

// Provider component
export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Initialize font size with local storage value or default to 16
	const [fontSize, setFontSize] = useState<number>(() => {
		const savedSize = localStorage.getItem("userFontSize");
		return savedSize ? parseFloat(savedSize) : 16;
	});

	useEffect(() => {
		// Apply font size to the <html> element whenever fontSize changes
		document.querySelector("html")!.style.fontSize = `${fontSize}px`;
		// Save font size to local storage
		localStorage.setItem("userFontSize", fontSize.toString());
	}, [fontSize]);

	// Provide fontSize and setFontSize function to the context
	return (
		<FontSizeContext.Provider value={{ fontSize, setFontSize }}>
			{children}
		</FontSizeContext.Provider>
	);
};

// Custom hook to use font size context
export const useFontSize = () => useContext(FontSizeContext);
