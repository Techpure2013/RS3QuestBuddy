import React, { useEffect } from "react";

const OverlaySteps: React.FC = () => {
	useEffect(() => {
		// This code will run when the component mounts

		// Set up an interval (for example, running every 1000 milliseconds)
		const intervalId = setInterval(() => {
			alt1.overLayLine;
		}, 1000);

		// Clean up the interval when the component unmounts
		return () => {
			clearInterval(intervalId);
		};
	}, []); // Empty dependency array ensures the effect runs only once (on mount)

	// Return null or omit the return statement if the component doesn't render anything
	return null;
};

export default OverlaySteps;
