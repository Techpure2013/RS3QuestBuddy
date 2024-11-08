import React, { useState, useEffect } from "react";

const LunarGrid: React.FC = () => {
	// Initialize highlighted grid with data from localStorage or default 4x8 grid
	const [highlighted, setHighlighted] = useState<boolean[][]>(() => {
		const savedGrid = localStorage.getItem("highlightedGrid");
		return savedGrid
			? JSON.parse(savedGrid)
			: Array.from({ length: 8 }, () => Array(4).fill(false)); // Correctly create 8 rows x 4 columns
	});

	// Save the highlighted state to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("highlightedGrid", JSON.stringify(highlighted));
	}, [highlighted]);

	// Toggle cell highlight state
	const handleClick = (row: number, col: number) => {
		setHighlighted((prevGrid) =>
			prevGrid.map((rowArr, rowIndex) =>
				rowIndex === row
					? rowArr.map((cell, colIndex) => (colIndex === col ? !cell : cell))
					: rowArr
			)
		);
	};

	// Clear all highlights
	const clearSelection = () => {
		const emptyGrid = Array.from({ length: 8 }, () => Array(4).fill(false)); // Ensure independent arrays
		setHighlighted(emptyGrid);
		localStorage.removeItem("highlightedGrid");
	};

	return (
		<div>
			<p>Don't worry, I'll remember this until you clear me.</p>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 50px)", // 4 columns
					gridTemplateRows: "repeat(8, 50px)", // 8 rows
					gap: "5px",
				}}
			>
				{highlighted.map((row, rowIndex) =>
					row.map((cell, colIndex) => (
						<div
							key={`${rowIndex}-${colIndex}`}
							onClick={() => handleClick(rowIndex, colIndex)}
							style={{
								width: "50px",
								height: "50px",
								backgroundColor: cell ? "#4caf50" : "#ddd",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								border: "1px solid #ccc",
							}}
						/>
					))
				)}
			</div>
			<button
				onClick={clearSelection}
				style={{ marginTop: "10px", marginBottom: "10px" }}
			>
				Clear Selection
			</button>
		</div>
	);
};

export default LunarGrid;
