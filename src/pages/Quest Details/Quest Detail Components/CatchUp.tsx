import React from "react";

interface CatchUpProps {
	step: string;
}

export const CatchUp: React.FC<CatchUpProps> = ({ step }) => {
	return <p>{step}</p>;
};
