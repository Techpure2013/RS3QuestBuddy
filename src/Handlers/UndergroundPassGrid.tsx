import React, { useState, useEffect } from "react";

const Grid: React.FC = () => {
	// Initialize highlighted grid with data from localStorage or default 5x5 grid
	const [highlighted, setHighlighted] = useState<boolean[][]>(() => {
		const savedGrid = localStorage.getItem("highlightedGrid");
		return savedGrid
			? JSON.parse(savedGrid)
			: Array(5).fill(Array(5).fill(false));
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
		const emptyGrid = Array(5).fill(Array(5).fill(false));
		setHighlighted(emptyGrid);
		localStorage.removeItem("highlightedGrid");
	};

	return (
		<div>
			<p>Dont Worry I'll Remember this until you clear me.</p>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(5, 50px)",
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

export default Grid;
